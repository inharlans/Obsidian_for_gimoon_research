[CmdletBinding()]
param(
    [string]$SourceVault = "C:\Users\user\Documents\knowloge graph\vault\PaperKG",
    [string]$GoogleDriveFolder = "",
    [string]$OperationDirectory = ""
)

$ErrorActionPreference = "Stop"
$startedAt = [System.Diagnostics.Stopwatch]::StartNew()
$historyLimit = 100
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = Split-Path -Parent $scriptDirectory

if (-not $OperationDirectory) {
    $OperationDirectory = Join-Path $repositoryRoot ".paperkg\operations"
}

$statusPath = Join-Path $OperationDirectory "google-drive-sync-status.json"
$historyPath = Join-Path $OperationDirectory "google-drive-sync-history.jsonl"
$previousStatus = $null

function Read-PreviousStatus {
    if (-not (Test-Path -LiteralPath $statusPath -PathType Leaf)) {
        return $null
    }

    try {
        return Get-Content -LiteralPath $statusPath -Raw -Encoding UTF8 | ConvertFrom-Json
    }
    catch {
        return $null
    }
}

function Write-AtomicUtf8File {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $directory = Split-Path -Parent $Path
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
    $temporaryPath = Join-Path $directory (([System.IO.Path]::GetFileName($Path)) + "." + [guid]::NewGuid().ToString("N") + ".tmp")
    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($temporaryPath, $Content, $utf8WithoutBom)
    Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
}

function Complete-Sync {
    param(
        [Parameter(Mandatory = $true)][ValidateSet("success", "skipped", "failed")][string]$Status,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Nullable[int]]$SourceEligibleFiles = $null,
        [Nullable[long]]$SourceBytes = $null,
        [Nullable[int]]$RobocopyExitCode = $null,
        [string]$SuccessfulFingerprint = "",
        [string]$SuccessfulDestinationId = "",
        [int]$ProcessExitCode = 0
    )

    $startedAt.Stop()
    $lastSuccessfulFingerprint = $SuccessfulFingerprint
    if (-not $lastSuccessfulFingerprint -and $previousStatus -and $previousStatus.last_successful_fingerprint) {
        $lastSuccessfulFingerprint = [string]$previousStatus.last_successful_fingerprint
    }
    $lastSuccessfulDestinationId = $SuccessfulDestinationId
    if (-not $lastSuccessfulDestinationId -and $previousStatus -and $previousStatus.last_successful_destination_id) {
        $lastSuccessfulDestinationId = [string]$previousStatus.last_successful_destination_id
    }

    # Deliberately exclude filesystem paths, account details, filenames, and content.
    # This status is operational telemetry only and is safe to retain locally.
    $result = [ordered]@{
        schema_version = 1
        checked_at = (Get-Date).ToUniversalTime().ToString("o")
        status = $Status
        reason = $Reason
        duration_ms = [math]::Round($startedAt.Elapsed.TotalMilliseconds)
        source_eligible_files = $SourceEligibleFiles
        source_bytes = $SourceBytes
        robocopy_exit_code = $RobocopyExitCode
        last_successful_fingerprint = $lastSuccessfulFingerprint
        last_successful_destination_id = $lastSuccessfulDestinationId
    }

    $singleLine = $result | ConvertTo-Json -Compress
    Write-AtomicUtf8File -Path $statusPath -Content (($result | ConvertTo-Json -Depth 3) + [Environment]::NewLine)

    $historyLines = @()
    if (Test-Path -LiteralPath $historyPath -PathType Leaf) {
        $historyLines = @(Get-Content -LiteralPath $historyPath -Encoding UTF8 | Select-Object -Last ($historyLimit - 1))
    }
    $historyContent = (($historyLines + $singleLine) -join [Environment]::NewLine) + [Environment]::NewLine
    Write-AtomicUtf8File -Path $historyPath -Content $historyContent

    [pscustomobject]$result | ConvertTo-Json -Depth 3
    exit $ProcessExitCode
}

function Test-IsEligibleFile {
    param(
        [Parameter(Mandatory = $true)][System.IO.FileInfo]$File,
        [Parameter(Mandatory = $true)][string]$Root
    )

    if ($File.Extension -notin @(".md", ".yaml", ".yml", ".json")) {
        return $false
    }

    $relativePath = $File.FullName.Substring($Root.TrimEnd("\").Length).TrimStart("\")
    $segments = $relativePath -split "[\\/]"
    return -not ($segments | Where-Object { $_ -in @(".paperkg", ".obsidian", "Attachments", "node_modules") })
}

$previousStatus = Read-PreviousStatus

try {
    # Google Drive Desktop may be signed out, paused, or unmounted. This is an
    # ordinary skipped run, not an error worth retrying or showing to the user.
    if (-not $GoogleDriveFolder) {
        if (-not (Test-Path -LiteralPath "G:\" -PathType Container)) {
            Complete-Sync -Status "skipped" -Reason "google_drive_unavailable"
        }

        $allowedRootItem = Get-ChildItem -LiteralPath "G:\" -Directory -ErrorAction SilentlyContinue |
            ForEach-Object { Join-Path $_.FullName "PaperKG-Vault-Sync" } |
            Where-Object { Test-Path -LiteralPath $_ -PathType Container } |
            Select-Object -First 1

        if (-not $allowedRootItem) {
            Complete-Sync -Status "skipped" -Reason "dedicated_folder_unavailable"
        }

        $allowedRoot = [System.IO.Path]::GetFullPath($allowedRootItem)
        $destination = Join-Path $allowedRoot "PaperKG"
    }
    else {
        $destination = [System.IO.Path]::GetFullPath($GoogleDriveFolder)
        $allowedRoot = Split-Path -Parent $destination

        if (-not (Test-Path -LiteralPath $allowedRoot -PathType Container)) {
            Complete-Sync -Status "skipped" -Reason "dedicated_folder_unavailable"
        }
    }

    # Even explicit invocations are constrained to ...\PaperKG-Vault-Sync\PaperKG.
    # This prevents accidental writes into another Drive or local folder.
    if ((Split-Path -Leaf $allowedRoot) -ne "PaperKG-Vault-Sync" -or (Split-Path -Leaf $destination) -ne "PaperKG") {
        throw "The destination is outside the dedicated PaperKG Google Drive folder."
    }

    $source = [System.IO.Path]::GetFullPath($SourceVault)
    if (-not (Test-Path -LiteralPath $source -PathType Container)) {
        throw "The PaperKG source vault is unavailable."
    }

    $allowedPrefix = $allowedRoot.TrimEnd("\") + "\"
    if (-not $destination.StartsWith($allowedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "The destination is outside the dedicated PaperKG Google Drive folder."
    }

    $destinationHashAlgorithm = [System.Security.Cryptography.SHA256]::Create()
    try {
        $destinationId = ([System.BitConverter]::ToString($destinationHashAlgorithm.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($destination.ToLowerInvariant())))).Replace("-", "").ToLowerInvariant()
    }
    finally {
        $destinationHashAlgorithm.Dispose()
    }

    $sourceFiles = @(Get-ChildItem -LiteralPath $source -Recurse -File -Force |
        Where-Object { Test-IsEligibleFile -File $_ -Root $source } |
        Sort-Object FullName)
    $sourceBytes = [long](($sourceFiles | Measure-Object -Property Length -Sum).Sum)

    $fingerprintLines = $sourceFiles | ForEach-Object {
        $relativePath = $_.FullName.Substring($source.TrimEnd("\").Length).TrimStart("\").ToLowerInvariant()
        "{0}|{1}|{2}" -f $relativePath, $_.Length, $_.LastWriteTimeUtc.Ticks
    }
    $fingerprintInput = $fingerprintLines -join "`n"
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $fingerprint = ([System.BitConverter]::ToString($sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($fingerprintInput)))).Replace("-", "").ToLowerInvariant()
    }
    finally {
        $sha256.Dispose()
    }

    if ($previousStatus -and
        $previousStatus.last_successful_fingerprint -eq $fingerprint -and
        $previousStatus.last_successful_destination_id -eq $destinationId -and
        (Test-Path -LiteralPath $destination -PathType Container)) {
        Complete-Sync -Status "skipped" -Reason "source_unchanged" -SourceEligibleFiles $sourceFiles.Count -SourceBytes $sourceBytes
    }

    New-Item -ItemType Directory -Path $destination -Force | Out-Null

    # Additive only: there is no /MIR, /PURGE, or destination deletion. Derived,
    # private, attachment, session, and build data are excluded.
    $arguments = @(
        $source,
        $destination,
        "*.md",
        "*.yaml",
        "*.yml",
        "*.json",
        "/E",
        "/XO",
        "/XJ",
        "/COPY:DAT",
        "/DCOPY:DAT",
        "/R:1",
        "/W:1",
        "/NFL",
        "/NDL",
        "/NJH",
        "/NJS",
        "/NP",
        "/XD",
        ".paperkg",
        ".obsidian",
        "Attachments",
        "node_modules",
        "/XF",
        "workspace.json",
        "workspace-mobile.json"
    )

    & robocopy.exe @arguments | Out-Null
    $robocopyExit = $LASTEXITCODE

    if ($robocopyExit -gt 7) {
        throw "Robocopy failed with exit code $robocopyExit."
    }

    Complete-Sync -Status "success" -Reason "additive_sync_complete" -SourceEligibleFiles $sourceFiles.Count -SourceBytes $sourceBytes -RobocopyExitCode $robocopyExit -SuccessfulFingerprint $fingerprint -SuccessfulDestinationId $destinationId
}
catch {
    # Do not persist exception messages because they may contain local paths.
    Complete-Sync -Status "failed" -Reason "unexpected_error" -ProcessExitCode 1
}
