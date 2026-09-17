param(
  [string]$GoogleDriveRoot,
  [string]$StableLocalRoot = "C:\Users\user\Documents\PaperKG-Zotero-Attachments",
  [string]$OutputPath = "output/zotero-google-drive-plan.json",
  [string]$ZoteroLocalApi = "http://127.0.0.1:23119",
  [string]$ZoteroDataDirectory = "C:\Users\user\Zotero"
)

$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $PSScriptRoot
$headers = @{ "Zotero-Allowed-Request" = "1"; Accept = "application/json" }

try {
  $probe = Invoke-WebRequest -UseBasicParsing -Uri "$ZoteroLocalApi/api/users/0/items?itemType=attachment&limit=1&format=json" -Headers $headers -TimeoutSec 5
} catch {
  throw "Zotero local API is unavailable at $ZoteroLocalApi. Open Zotero Desktop and enable the local API before retrying."
}

$total = [int]$probe.Headers["Total-Results"]
$items = New-Object System.Collections.Generic.List[object]
for ($start = 0; $start -lt $total; $start += 100) {
  $response = Invoke-WebRequest -UseBasicParsing -Uri "$ZoteroLocalApi/api/users/0/items?itemType=attachment&limit=100&start=$start&format=json" -Headers $headers -TimeoutSec 15
  $page = $response.Content | ConvertFrom-Json
  foreach ($item in $page) { $items.Add($item) }
}

$resolvedDrive = $null
$resolvedLocal = [IO.Path]::GetFullPath($StableLocalRoot)
if ($GoogleDriveRoot) {
  $resolvedDrive = [IO.Path]::GetFullPath($GoogleDriveRoot)
  $resolvedData = [IO.Path]::GetFullPath($ZoteroDataDirectory)
  if ($resolvedDrive.StartsWith($resolvedData, [StringComparison]::OrdinalIgnoreCase) -or $resolvedData.StartsWith($resolvedDrive, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Google Drive attachment root and Zotero data directory must be completely separate."
  }
}

$resolvedData = [IO.Path]::GetFullPath($ZoteroDataDirectory)
if ($resolvedLocal.StartsWith($resolvedData, [StringComparison]::OrdinalIgnoreCase) -or $resolvedData.StartsWith($resolvedLocal, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Stable linked-file root and Zotero data directory must be completely separate."
}

$attachments = foreach ($item in $items) {
  $data = $item.data
  $enclosure = $item.links.enclosure
  $sourcePath = $null
  if ($enclosure -and $enclosure.href -and ([string]$enclosure.href).StartsWith("file:")) {
    $sourcePath = ([Uri][string]$enclosure.href).LocalPath
  } elseif ($data.path -and -not ([string]$data.path).StartsWith("storage:")) {
    $sourcePath = [string]$data.path
  } elseif ($data.filename -and $data.key) {
    $sourcePath = Join-Path (Join-Path $ZoteroDataDirectory "storage\$($data.key)") ([string]$data.filename)
  }
  $exists = $sourcePath -and (Test-Path -LiteralPath $sourcePath -PathType Leaf)
  $bytes = if ($exists) { (Get-Item -LiteralPath $sourcePath).Length } elseif ($enclosure.length) { [long]$enclosure.length } else { 0 }
  $safeFilename = if ($data.filename) { [string]$data.filename } else { "$($data.key).bin" }
  $plannedTarget = Join-Path $resolvedLocal "$($data.key)-$safeFilename"
  [pscustomobject]@{
    attachmentKey = [string]$data.key
    parentItemKey = [string]$data.parentItem
    title = [string]$data.title
    filename = $safeFilename
    contentType = [string]$data.contentType
    linkMode = [string]$data.linkMode
    sourcePath = $sourcePath
    sourceExists = [bool]$exists
    bytes = [long]$bytes
    plannedTarget = $plannedTarget
    action = if ([string]$data.linkMode -eq "linked_file") { "verify-relative-link-under-stable-local-root" } elseif ([string]$data.linkMode -eq "linked_url") { "verify-private-drive-mobile-link" } else { "manual-review-no-automatic-stored-conversion" }
  }
}

$profileExtensions = "C:\Users\user\AppData\Roaming\Zotero\Zotero\Profiles\zno9k7cs.default\extensions"
$attangerInstalled = @(Get-ChildItem -LiteralPath $profileExtensions -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "attanger" }).Count -gt 0
$driveInstalled = @(Get-ItemProperty @(
  "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
) -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -match "Google Drive" }).Count -gt 0

$summary = [pscustomobject]@{
  generatedAt = [DateTime]::UtcNow.ToString("o")
  mode = "read-only-stable-local-linked-file-audit"
  zoteroLocalApi = $ZoteroLocalApi
  zoteroDataDirectory = [IO.Path]::GetFullPath($ZoteroDataDirectory)
  googleDriveRoot = $resolvedDrive
  stableLocalRoot = $resolvedLocal
  googleDriveForDesktopInstalled = $driveInstalled
  attangerInstalled = $attangerInstalled
  attachmentCount = @($attachments).Count
  storedAttachmentCount = @($attachments | Where-Object { $_.linkMode -notlike "linked_*" }).Count
  linkedAttachmentCount = @($attachments | Where-Object { $_.linkMode -like "linked_*" }).Count
  missingAttachmentCount = @($attachments | Where-Object { -not $_.sourceExists }).Count
  totalBytes = [long](($attachments | Measure-Object -Property bytes -Sum).Sum)
  safety = @(
    "Never move zotero.sqlite or the Zotero data directory into Google Drive.",
    "Keep Zotero Data Sync enabled for items, notes, tags, and attachment link metadata.",
    "Keep Zotero, Attanger, and Better BibTeX pointed at the stable local linked-file root.",
    "Synchronize only missing immutable PDFs between the stable local root and Drive; never delete or overwrite conflicts.",
    "Linked files are not available in Zotero mobile apps; use the private metadata-only Google Drive URL child."
  )
  nextSteps = @(
    "Install and sign in to Google Drive for Desktop.",
    "Keep the existing My Drive/PaperKG-Zotero-Attachments folder as the add-only cloud replica.",
    "Back up C:\Users\user\Zotero while Zotero is closed.",
    "Set Zotero Linked Attachment Base Directory, Attanger, and Better BibTeX to the stable local root.",
    "Verify relative linked-file resolution with Drive stopped, then verify missing-only Drive synchronization.",
    "Do not convert these PDFs to Zotero stored attachments."
  )
  attachments = @($attachments)
}

$absoluteOutput = if ([IO.Path]::IsPathRooted($OutputPath)) { $OutputPath } else { Join-Path $workspace $OutputPath }
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($absoluteOutput)) | Out-Null
[IO.File]::WriteAllText($absoluteOutput, ($summary | ConvertTo-Json -Depth 8), [Text.UTF8Encoding]::new($false))
[pscustomobject]@{
  output = $absoluteOutput
  attachmentCount = $summary.attachmentCount
  storedAttachmentCount = $summary.storedAttachmentCount
  linkedAttachmentCount = $summary.linkedAttachmentCount
  missingAttachmentCount = $summary.missingAttachmentCount
  totalGiB = [Math]::Round($summary.totalBytes / 1GB, 3)
  googleDriveForDesktopInstalled = $summary.googleDriveForDesktopInstalled
  attangerInstalled = $summary.attangerInstalled
  googleDriveRoot = $summary.googleDriveRoot
  stableLocalRoot = $summary.stableLocalRoot
} | ConvertTo-Json -Depth 4
