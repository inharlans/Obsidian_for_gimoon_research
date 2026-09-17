[CmdletBinding()]
param(
    [string]$TaskName = "PaperKG Google Drive Safe Sync"
)

$ErrorActionPreference = "Stop"
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = Split-Path -Parent $scriptDirectory
$launcherPath = Join-Path $scriptDirectory "run-paperkg-google-drive-sync-hidden.vbs"

if (-not (Test-Path -LiteralPath $launcherPath -PathType Leaf)) {
    throw "The hidden PaperKG sync launcher is unavailable."
}

$wscriptPath = Join-Path $env:SystemRoot "System32\wscript.exe"
$action = New-ScheduledTaskAction `
    -Execute $wscriptPath `
    -Argument ("//B //Nologo `"{0}`"" -f $launcherPath) `
    -WorkingDirectory $repositoryRoot

# One-hour cadence is sufficient for a personal backup. The sync script also
# fingerprints eligible source files, so an unchanged vault never runs robocopy.
$trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date).AddMinutes(1) `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
    -Hidden `
    -MultipleInstances IgnoreNew `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries

$principal = New-ScheduledTaskPrincipal `
    -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
    -LogonType Interactive `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Hidden, additive PaperKG Markdown/YAML/JSON backup to the dedicated Google Drive folder." `
    -Force | Out-Null

[pscustomobject]@{
    TaskName = $TaskName
    Hidden = $true
    Interval = "PT1H"
    Launcher = "wscript.exe"
    AdditiveOnly = $true
} | ConvertTo-Json
