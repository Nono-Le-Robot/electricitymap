Clear-Host
Write-Host "######## DEBUT DU SCRIPT ######## " -ForegroundColor Green

cd front
$buildMessage = "Build de l'application en cours..."
Write-Host $buildMessage -ForegroundColor Cyan
$buildOutput = npm run build 2>&1
cd ..
cd deploy
Write-Host "Upload des fichiers sur le serveur FTP..." -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
$uploadResult = & node deploy.js 2>&1
if ($LASTEXITCODE -ne 0 -or $buildOutput -match "ERR!") {
    Write-Host "BUILD -- FAIL" -ForegroundColor Red
    Write-Host "Détails du build :"
    Write-Host $buildOutput -ForegroundColor Red
     cd ..
    exit 1
} else {
    Write-Host "BUILD -- OK" -ForegroundColor Green
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "UPLOAD -- FAIL" -ForegroundColor Red
    Write-Host "Upload Details:"
    Write-Host $uploadResult -ForegroundColor Red
    cd ..
    exit 1
} else {
    Write-Host "UPLOAD -- OK" -ForegroundColor Green
}
    Write-Host "PRODUCTION -- OK" -ForegroundColor Green
Start-Sleep -Seconds 1
    Write-Host "" -ForegroundColor Green
Write-Host "######### FIN DU SCRIPT ######### " -ForegroundColor Green
    Write-Host "" -ForegroundColor Green

cd ..

