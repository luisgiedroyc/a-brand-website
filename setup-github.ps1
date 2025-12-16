# Automatic GitHub repository setup and publishing
# This script will help deploy the site to GitHub

Write-Host "=== GitHub Repository Setup ===" -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git is not installed. Install Git from https://git-scm.com" -ForegroundColor Red
    exit 1
}

# Check current status
Write-Host "`nCurrent repository status:" -ForegroundColor Cyan
git status

# Check if remote repository exists
$remote = git remote get-url origin 2>$null

if ($remote) {
    Write-Host "`nRemote repository is already configured: $remote" -ForegroundColor Green
    Write-Host "`nTo publish, run:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1" -ForegroundColor White
} else {
    Write-Host "`nRemote repository is not configured." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Choose how to create repository:" -ForegroundColor Cyan
    Write-Host "1. Via GitHub web interface (recommended)" -ForegroundColor White
    Write-Host "2. Via GitHub CLI (if installed)" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter number (1 or 2)"
    
    if ($choice -eq "1") {
        Write-Host "`nInstructions:" -ForegroundColor Cyan
        Write-Host "1. Open https://github.com/new" -ForegroundColor White
        Write-Host "2. Create a new repository (e.g., a-brand-website)" -ForegroundColor White
        Write-Host "3. DO NOT add README, .gitignore, or license" -ForegroundColor White
        Write-Host "4. After creating, copy the repository URL" -ForegroundColor White
        Write-Host ""
        $repoUrl = Read-Host "Paste repository URL (e.g., https://github.com/username/repo.git)"
        
        if ($repoUrl) {
            Write-Host "`nConfiguring remote repository..." -ForegroundColor Cyan
            git remote add origin $repoUrl
            git branch -M main
            
            Write-Host "`nPushing code to GitHub..." -ForegroundColor Cyan
            git push -u origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`nSuccessfully published to GitHub!" -ForegroundColor Green
                Write-Host "`nTo enable GitHub Pages:" -ForegroundColor Cyan
                Write-Host "1. Go to Settings -> Pages: $repoUrl/settings/pages" -ForegroundColor White
                Write-Host "2. Source: branch 'main', folder '/ (root)'" -ForegroundColor White
                Write-Host "3. Save" -ForegroundColor White
                Write-Host "4. In a few minutes, site will be available on GitHub Pages" -ForegroundColor White
            }
        }
    } elseif ($choice -eq "2") {
        # Check GitHub CLI
        try {
            $ghVersion = gh --version
            Write-Host "GitHub CLI is installed" -ForegroundColor Green
            
            $repoName = Read-Host "`nEnter repository name"
            if ($repoName) {
                Write-Host "`nCreating repository and publishing..." -ForegroundColor Cyan
                gh repo create $repoName --public --source=. --remote=origin --push
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "`nSuccessfully created and published!" -ForegroundColor Green
                }
            }
        } catch {
            Write-Host "GitHub CLI is not installed. Install from https://cli.github.com" -ForegroundColor Red
            Write-Host "Or use option 1 (web interface)" -ForegroundColor Yellow
        }
    }
}
