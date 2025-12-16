# Скрипт для запуска локального сервера
Write-Host "=== Запуск локального сервера ===" -ForegroundColor Cyan
Write-Host "Сайт будет доступен по адресу: http://localhost:8000" -ForegroundColor Green
Write-Host "Нажмите Ctrl+C для остановки сервера" -ForegroundColor Yellow
Write-Host ""

# Запускаем Python HTTP сервер
python -m http.server 8000

