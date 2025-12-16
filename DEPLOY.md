# Инструкция по размещению на GitHub

## Шаги для публикации сайта на GitHub:

### 1. Создайте репозиторий на GitHub
- Перейдите на https://github.com
- Нажмите "New repository"
- Назовите репозиторий (например: `a-brand-website`)
- Выберите Public или Private
- **НЕ** инициализируйте с README, .gitignore или лицензией (у нас уже есть файлы)

### 2. Подключите локальный репозиторий к GitHub

Выполните следующие команды в терминале (в папке проекта):

```bash
# Добавьте удаленный репозиторий (замените YOUR_USERNAME и YOUR_REPO на свои значения)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Отправьте код на GitHub
git branch -M main
git push -u origin main
```

### 3. Включите GitHub Pages (опционально)

Если хотите, чтобы сайт был доступен по адресу `https://YOUR_USERNAME.github.io/YOUR_REPO`:

1. Перейдите в Settings вашего репозитория на GitHub
2. Найдите раздел "Pages" в левом меню
3. В разделе "Source" выберите "Deploy from a branch"
4. Выберите ветку `main` и папку `/ (root)`
5. Нажмите "Save"
6. Через несколько минут сайт будет доступен по адресу, указанному в разделе Pages

### Альтернатива: Использование GitHub CLI

Если у вас установлен GitHub CLI:

```bash
# Авторизуйтесь
gh auth login

# Создайте репозиторий и отправьте код
gh repo create a-brand-website --public --source=. --remote=origin --push
```

## Примечания

- Файлы `.glb` (3D модели) могут быть большими. Если они превышают 100MB, GitHub может не принять их. В этом случае используйте Git LFS или разместите модели на отдельном хостинге.
- Для работы сайта нужен веб-сервер (не просто открытие файла). GitHub Pages автоматически предоставляет это.

