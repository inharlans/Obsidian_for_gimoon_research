<#
.SYNOPSIS
    Translate a paper to Korean with DeepL and file it under the Zotero
    linked-attachment root, using this library's naming convention.

.DESCRIPTION
    Produces the three files every paper in the library has:

        <base> - Original PDF.pdf
        <base> - Korean Translation PDF (DeepL).pdf
        <base> - Reading Dual PDF (EN-KO Alternating).pdf

    where <base> is "<FirstAuthor> 등(<Year>), <Title without colon>", capped
    at 92 characters the way the existing entries are.

    Only the pages before the reference list are translated; the back matter
    stays in English. Every translated page is checked for Hangul afterwards,
    so a silently dropped DeepL chunk fails the run instead of shipping a
    half-English PDF.

.EXAMPLE
    ./translate-paper.ps1 -Source 2602.02007 -Author Hu -Year 2026 `
        -Title "Beyond RAG for Agent Memory: Retrieval by Decoupling and Aggregation"

.EXAMPLE
    ./translate-paper.ps1 -Source "C:\tmp\paper.pdf" -Author Jiang -Year 2026 -Title "SYNAPSE: ..."
#>
[CmdletBinding()]
param(
    # arXiv id (2602.02007), any http(s) URL, or a path to a local PDF.
    [Parameter(Mandatory)][string]$Source,
    [Parameter(Mandatory)][string]$Author,
    [Parameter(Mandatory)][string]$Year,
    [Parameter(Mandatory)][string]$Title,
    # Defaults to Zotero's own linked-attachment base directory.
    [string]$DestDir,
    [string]$WorkDir = "$env:TEMP\paperkg-translate",
    # Override page range; normally derived as "everything before References".
    [string]$Pages,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# pdf2zh-next (BabelDOC engine), the same engine as the rest of the library.
# Its babeldoc package needs pdf2zh-tool\patch-babeldoc.py, or extracted text
# loses every space.
$venv    = "C:\Users\user\Documents\pdf2zh-tool\.venv-next\Scripts"
$python  = Join-Path $venv "python.exe"
$pdf2zh  = Join-Path $venv "pdf2zh_next.exe"
$probe   = Join-Path $PSScriptRoot "paperkg_pdf_probe.py"
$zoteroProfile = "C:\Users\user\AppData\Roaming\Zotero\Zotero\Profiles\zno9k7cs.default"

foreach ($required in @($python, $pdf2zh, $probe)) {
    if (-not (Test-Path -LiteralPath $required)) { throw "missing dependency: $required" }
}

# --- destination -----------------------------------------------------------
# Read it from Zotero rather than hardcoding: this library has moved between a
# local folder and the Google Drive mount before, and the two must not drift.
if (-not $DestDir) {
    $prefsFiles = @("user.js", "prefs.js") | ForEach-Object { Join-Path $zoteroProfile $_ } |
        Where-Object { Test-Path -LiteralPath $_ }
    foreach ($prefs in $prefsFiles) {
        $match = Select-String -LiteralPath $prefs -Encoding utf8 `
            -Pattern 'user_pref\("extensions\.zotero\.baseAttachmentPath",\s*"(.+?)"\)' |
            Select-Object -First 1
        if ($match) {
            $DestDir = $match.Matches[0].Groups[1].Value -replace '\\\\', '\'
            $zoteroBase = $DestDir
            Write-Host "destination from $(Split-Path $prefs -Leaf): $DestDir"
            break
        }
    }
}
if (-not $DestDir) { throw "could not determine the Zotero attachment base directory; pass -DestDir" }
if (-not (Test-Path -LiteralPath $DestDir)) { throw "destination does not exist: $DestDir" }

# --- DeepL key -------------------------------------------------------------
# The key lives in the old PDFMathTranslate config; hand it to pdf2zh-next via
# its PDF2ZH_ environment prefix so it never appears on a command line.
$configPath = Join-Path $env:USERPROFILE ".config\PDFMathTranslate\config.json"
if (-not (Test-Path -LiteralPath $configPath)) { throw "missing DeepL config: $configPath" }
$deepl = (Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json).translators |
    Where-Object { $_.name -eq "deepl" } | Select-Object -First 1
if (-not $deepl.envs.DEEPL_AUTH_KEY) { throw "DEEPL_AUTH_KEY not set in $configPath" }
$env:PDF2ZH_DEEPL_AUTH_KEY = $deepl.envs.DEEPL_AUTH_KEY
Write-Host ("DeepL key loaded ({0} chars, not printed)" -f $env:PDF2ZH_DEEPL_AUTH_KEY.Length)

# --- fetch source ----------------------------------------------------------
New-Item -ItemType Directory -Path $WorkDir -Force | Out-Null
$stem  = "paper-" + [guid]::NewGuid().ToString("N").Substring(0, 8)
$inputPdf = Join-Path $WorkDir "$stem.pdf"

if (Test-Path -LiteralPath $Source) {
    Copy-Item -LiteralPath $Source -Destination $inputPdf
    Write-Host "source: local file"
} else {
    $url = if ($Source -match '^https?://') { $Source } else { "https://arxiv.org/pdf/$Source" }
    Write-Host "source: $url"
    Invoke-WebRequest -Uri $url -OutFile $inputPdf -UseBasicParsing
}
$head = New-Object byte[] 4
$stream = [System.IO.File]::OpenRead($inputPdf)
try { $null = $stream.Read($head, 0, 4) } finally { $stream.Close() }
if (-not ($head[0] -eq 0x25 -and $head[1] -eq 0x50 -and $head[2] -eq 0x44 -and $head[3] -eq 0x46)) {
    throw "downloaded file is not a PDF (no %PDF header): $inputPdf"
}

# --- page range ------------------------------------------------------------
if (-not $Pages) {
    $refPage = [int](& $python $probe refpage $inputPdf)
    if ($refPage -gt 1) {
        $Pages = "1-$($refPage - 1)"
        Write-Host "references start on page $refPage -> translating $Pages"
    } else {
        Write-Host "no reference heading found -> translating the whole document"
        $Pages = "1-9999"
    }
}

# --- translate -------------------------------------------------------------
Push-Location $WorkDir
try {
    # --deepl is explicit: without it pdf2zh-next silently picks a free
    # third-party engine. The glossary extractor would also send text to one.
    & $pdf2zh "$stem.pdf" --deepl --lang-in en --lang-out ko --pages $Pages --output . `
        --no-auto-extract-glossary --use-alternating-pages-dual --watermark-output-mode no_watermark
    if ($LASTEXITCODE -ne 0) { throw "pdf2zh failed with exit code $LASTEXITCODE" }
} finally {
    Pop-Location
}

$mono = Join-Path $WorkDir "$stem.no_watermark.ko.mono.pdf"
$dual = Join-Path $WorkDir "$stem.no_watermark.ko.dual.pdf"
foreach ($produced in @($mono, $dual)) {
    if (-not (Test-Path -LiteralPath $produced)) { throw "pdf2zh did not produce $produced" }
}

# --- verify ----------------------------------------------------------------
# DeepL rate limits show up as pages that stayed English. Catch that here.
Write-Host "--- Hangul coverage ---"
& $python $probe hangul $mono $Pages
if ($LASTEXITCODE -ne 0) {
    throw "some translated pages came back without Korean text; re-run before filing these"
}
# Keep the library's one Korean font.
& $python $probe font $mono
if ($LASTEXITCODE -ne 0) {
    throw "translation is not set in Source Han Serif KR; fix the font before filing"
}

# --- name and file ---------------------------------------------------------
$cleanTitle = ($Title -replace '[:\\/*?"<>|]', '') -replace '\s+', ' '
$base = "$Author 등($Year), $($cleanTitle.Trim())"
if ($base.Length -gt 92) { $base = $base.Substring(0, 92) }

$targets = @(
    @{ Src = $inputPdf; Name = "$base - Original PDF.pdf" },
    @{ Src = $mono;  Name = "$base - Korean Translation PDF (DeepL).pdf" },
    @{ Src = $dual;  Name = "$base - Reading Dual PDF (EN-KO Alternating).pdf" }
)
foreach ($t in $targets) {
    $dest = Join-Path $DestDir $t.Name
    if ((Test-Path -LiteralPath $dest) -and -not $Force) {
        throw "already exists (pass -Force to replace): $($t.Name)"
    }
    Copy-Item -LiteralPath $t.Src -Destination $dest -Force:$Force
    Write-Host ("filed {0,6:N2} MB  {1}" -f ((Get-Item -LiteralPath $dest).Length / 1MB), $t.Name)
}

Write-Host ""
Write-Host "Done. Filed into: $DestDir"
if ($DestDir -eq $zoteroBase) {
    Write-Host "That is Zotero's linked-attachment base directory, so attach these as"
    Write-Host "linked files (not stored copies) and Zotero will store relative paths."
}
