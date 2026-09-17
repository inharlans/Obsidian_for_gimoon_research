param(
  [string]$Vault = "fixtures/valid-vault",
  [int]$Port = 8789
)

$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $workspace "tmp"
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
$stdoutLog = Join-Path $logDirectory "mcp-smoke.stdout.log"
$stderrLog = Join-Path $logDirectory "mcp-smoke.stderr.log"
$tsx = Join-Path $workspace "node_modules/tsx/dist/cli.mjs"
$server = Start-Process -FilePath "node" `
  -ArgumentList @("`"$tsx`"", "packages/mcp/src/index.ts", "http", "--vault", $Vault, "--host", "127.0.0.1", "--port", [string]$Port, "--public-base-url", "http://127.0.0.1:$Port", "--reindex-interval-ms", "0", "--allow-insecure-no-auth") `
  -WorkingDirectory $workspace -WindowStyle Hidden -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru

try {
  $ready = $false
  for ($attempt = 0; $attempt -lt 15; $attempt += 1) {
    try {
      $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -TimeoutSec 1
      $ready = $true
      break
    } catch {
      Start-Sleep -Milliseconds 200
    }
  }
  if (-not $ready) { throw "MCP health endpoint did not start" }

  $headers = @{ Accept = "application/json, text/event-stream"; "Content-Type" = "application/json" }
  $initialize = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"paperkg-smoke","version":"1.0"}}}'
  $first = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/mcp" -Method Post -Headers $headers -Body $initialize -TimeoutSec 5
  $second = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/mcp" -Method Post -Headers $headers -Body $initialize -TimeoutSec 5
  $sessionOne = [string]$first.Headers["mcp-session-id"]
  $sessionTwo = [string]$second.Headers["mcp-session-id"]
  if ([string]::IsNullOrWhiteSpace($sessionOne) -or [string]::IsNullOrWhiteSpace($sessionTwo) -or $sessionOne -eq $sessionTwo) {
    throw "Independent MCP sessions were not created"
  }

  $sessionHeaders = @{ Accept = "application/json, text/event-stream"; "Content-Type" = "application/json"; "mcp-session-id" = $sessionOne }
  $initialized = '{"jsonrpc":"2.0","method":"notifications/initialized"}'
  $null = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/mcp" -Method Post -Headers $sessionHeaders -Body $initialized -TimeoutSec 5
  $toolRequest = '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
  $toolResponse = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/mcp" -Method Post -Headers $sessionHeaders -Body $toolRequest -TimeoutSec 5
  if ($toolResponse.Content -notmatch "get_version_diff" -or $toolResponse.Content -notmatch "search_papers") {
    throw "Expected MCP tools were not listed"
  }

  [pscustomobject]@{
    health = $health.ok
    distinctSessions = $true
    toolsListed = $true
    status = $toolResponse.StatusCode
  } | ConvertTo-Json
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
    Wait-Process -Id $server.Id -ErrorAction SilentlyContinue
  }
}
