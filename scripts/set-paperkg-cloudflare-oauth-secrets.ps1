$ErrorActionPreference = "Stop"
$workspacePath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Push-Location $workspacePath
try {
    Write-Host "PaperKG Cloudflare OAuth secret setup" -ForegroundColor Cyan
    Write-Host "GitHub OAuth App page에서 Client ID를 복사한 뒤 첫 프롬프트에 붙여넣으세요."
    pnpm --dir apps/cloudflare-worker exec wrangler secret put GITHUB_CLIENT_ID
    if ($LASTEXITCODE -ne 0) { throw "GITHUB_CLIENT_ID 저장 실패" }

    Write-Host "이제 Generate a new client secret로 만든 값을 두 번째 프롬프트에 붙여넣으세요. 값은 화면에 표시되지 않습니다."
    pnpm --dir apps/cloudflare-worker exec wrangler secret put GITHUB_CLIENT_SECRET
    if ($LASTEXITCODE -ne 0) { throw "GITHUB_CLIENT_SECRET 저장 실패" }

    Write-Host "두 비밀값이 Cloudflare Worker에 저장되었습니다. 이 창을 닫아도 됩니다." -ForegroundColor Green
}
finally {
    Pop-Location
}
