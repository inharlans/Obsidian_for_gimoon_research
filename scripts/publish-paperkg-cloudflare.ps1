param(
    [string]$SnapshotPath = ".paperkg/cloudflare/paperkg.snapshot.json"
)

$ErrorActionPreference = "Stop"
$workspacePath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$resolvedSnapshot = Join-Path $workspacePath $SnapshotPath

Push-Location $workspacePath
try {
    pnpm paperkg validate vault/PaperKG
    if ($LASTEXITCODE -ne 0) { throw "Vault validation failed." }

    node scripts/build-cloudflare-snapshot.mjs
    if ($LASTEXITCODE -ne 0) { throw "Snapshot build failed." }

    pnpm --dir apps/cloudflare-worker exec wrangler r2 object put paperkg-storage/snapshot/paperkg.snapshot.json --file $resolvedSnapshot --remote
    if ($LASTEXITCODE -ne 0) { throw "R2 upload failed." }
}
finally {
    Pop-Location
}
