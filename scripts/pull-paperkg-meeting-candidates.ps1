param(
    [ValidatePattern('^mi_[a-f0-9]{32}$')]
    [string]$ReceiptId,
    [int]$Limit = 100
)

$ErrorActionPreference = "Stop"
$workspacePath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$vaultRoot = [IO.Path]::GetFullPath((Join-Path $workspacePath "vault\PaperKG"))
$tsx = Join-Path $workspacePath "node_modules\.bin\tsx.cmd"
if (-not (Test-Path -LiteralPath $tsx)) { throw "Bundled tsx runtime was not found. Run pnpm install first." }

$safeLimit = [Math]::Max(1, [Math]::Min($Limit, 1000))
$whereClause = if ($ReceiptId) { "WHERE storage_state = 'ready' AND receipt_id = '$ReceiptId'" } else { "WHERE storage_state = 'ready' AND local_sync_status != 'promoted'" }
$query = "SELECT receipt_id, note_id, r2_json_key, local_sync_status FROM meeting_receipts $whereClause ORDER BY submitted_at DESC LIMIT $safeLimit"

Push-Location $workspacePath
try {
    $json = pnpm --dir apps/cloudflare-worker exec wrangler d1 execute paperkg-remote --remote --json --command $query
    if ($LASTEXITCODE -ne 0) { throw "D1 receipt query failed." }
    $decoded = $json | ConvertFrom-Json
    $rows = @($decoded[0].results)
    if ($rows.Count -eq 0) {
        Write-Host "No remote meeting candidates matched."
        return
    }

    foreach ($row in $rows) {
        if ($row.receipt_id -notmatch '^mi_[a-f0-9]{32}$' -or $row.note_id -notmatch '^mtg_[a-f0-9]{24}$') {
            throw "Remote receipt contains an invalid identifier."
        }
        if ($row.r2_json_key -notmatch '^meeting-candidates/mi_[a-f0-9]{32}\.json$') {
            throw "Remote receipt contains an invalid R2 JSON key."
        }
        $temporary = Join-Path ([IO.Path]::GetTempPath()) "paperkg-$($row.receipt_id)-$([guid]::NewGuid().ToString('N')).json"
        try {
            pnpm --dir apps/cloudflare-worker exec wrangler r2 object get "paperkg-storage/$($row.r2_json_key)" --file $temporary --remote
            if ($LASTEXITCODE -ne 0) { throw "R2 download failed for $($row.receipt_id)." }
            $syncOutput = & $tsx packages/cli/src/index.ts meeting sync-bundle $temporary --vault $vaultRoot
            if ($LASTEXITCODE -ne 0) { throw "Local candidate import failed for $($row.receipt_id)." }
            $sync = ($syncOutput -join "`n") | ConvertFrom-Json
            if ($sync.receiptId -ne $row.receipt_id -or $sync.status -notin @("needs_review", "promoted")) {
                throw "Local importer returned an invalid sync result."
            }
            $remoteState = if ($sync.status -eq "promoted") { "promoted" } else { "needs_review" }
            $promotedSql = if ($remoteState -eq "promoted") { ", local_promoted_at = COALESCE(local_promoted_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))" } else { "" }
            $update = "UPDATE meeting_receipts SET local_sync_status = '$remoteState', local_synced_at = COALESCE(local_synced_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))$promotedSql WHERE receipt_id = '$($row.receipt_id)'"
            pnpm --dir apps/cloudflare-worker exec wrangler d1 execute paperkg-remote --remote --command $update | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "Remote receipt status update failed for $($row.receipt_id)." }
            Write-Host "Synced candidate: $($sync.candidatePath) [$remoteState]"
        }
        finally {
            if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
        }
    }

    pnpm paperkg validate $vaultRoot
    if ($LASTEXITCODE -ne 0) { throw "Vault validation failed after candidate import." }
}
finally {
    Pop-Location
}
