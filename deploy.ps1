# Скрипт для публикации на GitHub
# Запустите этот скрипт в PowerShell

Write-Host "=== Публикация сайта на GitHub ===" -ForegroundColor Cyan

# Проверяем, есть ли удаленный репозиторий
$remote = git remote get-url origin 2>$null

if (-not $remote) {
    Write-Host "`nУдаленный репозиторий не настроен." -ForegroundColor Yellow
    Write-Host "Пожалуйста, выполните следующие шаги:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Создайте репозиторий на https://github.com/new" -ForegroundColor White
    Write-Host "2. Скопируйте URL репозитория (например: https://github.com/username/repo.git)" -ForegroundColor White
    Write-Host "3. Выполните команду:" -ForegroundColor White
    Write-Host "   git remote add origin YOUR_REPO_URL" -ForegroundColor Green
    Write-Host ""
    Write-Host "Или используйте GitHub CLI:" -ForegroundColor White
    Write-Host "   gh repo create YOUR_REPO_NAME --public --source=. --remote=origin --push" -ForegroundColor Green
    exit 1
}

Write-Host "`nНайден удаленный репозиторий: $remote" -ForegroundColor Green

# Проверяем статус
Write-Host "`nПроверка статуса репозитория..." -ForegroundColor Cyan
git status

# Добавляем все изменения
Write-Host "`nДобавление изменений..." -ForegroundColor Cyan
git add .

# Проверяем, есть ли изменения для коммита
$status = git status --porcelain
if ($status) {
    Write-Host "`nСоздание коммита..." -ForegroundColor Cyan
    $commitMessage = Read-Host "Введите сообщение коммита (или нажмите Enter для 'Update')"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Update"
    }
    git commit -m $commitMessage
} else {
    Write-Host "`nНет изменений для коммита." -ForegroundColor Yellow
}

# Отправляем на GitHub
Write-Host "`nОтправка на GitHub..." -ForegroundColor Cyan
$branch = git branch --show-current
if (-not $branch) {
    $branch = "main"
    git branch -M main
}

git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Успешно опубликовано на GitHub!" -ForegroundColor Green
    Write-Host "`nДля включения GitHub Pages:" -ForegroundColor Cyan
    Write-Host "1. Перейдите в Settings → Pages вашего репозитория" -ForegroundColor White
    Write-Host "2. Выберите branch: $branch, folder: / (root)" -ForegroundColor White
    Write-Host "3. Сохраните" -ForegroundColor White
} else {
    Write-Host "`n✗ Ошибка при публикации. Проверьте настройки git и доступ к репозиторию." -ForegroundColor Red
}

