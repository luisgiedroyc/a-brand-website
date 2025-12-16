# Быстрый старт - Публикация на GitHub

## Способ 1: Через веб-интерфейс (самый простой)

### Шаг 1: Создайте репозиторий на GitHub
1. Откройте https://github.com/new
2. Название репозитория: `a-brand-website` (или любое другое)
3. Выберите **Public** или **Private**
4. **ВАЖНО:** НЕ добавляйте README, .gitignore или лицензию
5. Нажмите **Create repository**

### Шаг 2: Выполните команды в PowerShell

Откройте PowerShell в папке проекта и выполните:

```powershell
# Замените YOUR_USERNAME и YOUR_REPO на ваши значения
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Например, если ваш репозиторий: `https://github.com/username/a-brand-website.git`
```powershell
git remote add origin https://github.com/username/a-brand-website.git
git branch -M main
git push -u origin main
```

### Шаг 3: Включите GitHub Pages

1. Перейдите в ваш репозиторий на GitHub
2. Откройте **Settings** → **Pages**
3. В разделе **Source**:
   - Branch: выберите `main`
   - Folder: выберите `/ (root)`
4. Нажмите **Save**
5. Через 1-2 минуты сайт будет доступен по адресу:
   `https://YOUR_USERNAME.github.io/YOUR_REPO`

---

## Способ 2: Через GitHub CLI (если установлен)

```powershell
gh repo create a-brand-website --public --source=. --remote=origin --push
```

---

## Запуск локального сервера

Для тестирования сайта локально:

```powershell
.\start-server.ps1
```

Или вручную:
```powershell
python -m http.server 8000
```

Затем откройте в браузере: http://localhost:8000

---

## Обновление сайта на GitHub

После внесения изменений:

```powershell
git add .
git commit -m "Описание изменений"
git push
```

