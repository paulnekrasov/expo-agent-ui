#!/usr/bin/env pwsh
# Expo Agent UI Skill Validation Script
# Validates the skills/expo-agent-ui directory structure and content.

$ErrorActionPreference = "Stop"
$SkillDir = Join-Path $PSScriptRoot ".."

Write-Host "Expo Agent UI Skill Validation" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# 1. Check SKILL.md exists and has valid frontmatter
$skillMd = Join-Path $SkillDir "SKILL.md"
if (-not (Test-Path $skillMd)) {
  Write-Host "[ERROR] SKILL.md not found" -ForegroundColor Red
  $errors++
} else {
  $content = Get-Content $skillMd -Raw
  if ($content -match '^---\s*\n') {
    Write-Host "[OK] SKILL.md has YAML frontmatter" -ForegroundColor Green
  } else {
    Write-Host "[ERROR] SKILL.md missing YAML frontmatter" -ForegroundColor Red
    $errors++
  }
  if ($content -match 'name:\s*expo-agent-ui') {
    Write-Host "[OK] SKILL.md frontmatter has name: expo-agent-ui" -ForegroundColor Green
  } else {
    Write-Host "[WARN] SKILL.md frontmatter name may not be expo-agent-ui" -ForegroundColor Yellow
    $warnings++
  }
  if ($content -match 'description:\s*') {
    Write-Host "[OK] SKILL.md frontmatter has description" -ForegroundColor Green
  } else {
    Write-Host "[WARN] SKILL.md frontmatter missing description" -ForegroundColor Yellow
    $warnings++
  }
}

# 2. Check reference files exist and are non-empty
$references = @(
  "references/component-primitives.md",
  "references/semantic-ids.md",
  "references/mcp-tools.md",
  "references/maestro-flows.md"
)

foreach ($ref in $references) {
  $refPath = Join-Path $SkillDir $ref
  if (-not (Test-Path $refPath)) {
    Write-Host "[ERROR] Missing reference: $ref" -ForegroundColor Red
    $errors++
  } else {
    $refContent = Get-Content $refPath -Raw
    if ($refContent.Trim().Length -eq 0) {
      Write-Host "[ERROR] Empty reference: $ref" -ForegroundColor Red
      $errors++
    } else {
      Write-Host "[OK] Reference exists and non-empty: $ref" -ForegroundColor Green
    }
  }
}

# 3. Check examples directory
$examplesDir = Join-Path $SkillDir "examples"
$exampleFiles = Get-ChildItem $examplesDir -File -ErrorAction SilentlyContinue
if ($exampleFiles.Count -eq 0) {
  Write-Host "[ERROR] No example files found in examples/" -ForegroundColor Red
  $errors++
} else {
  Write-Host "[OK] $($exampleFiles.Count) example file(s) found" -ForegroundColor Green
  foreach ($f in $exampleFiles) {
    Write-Host "    $($f.Name)" -ForegroundColor Gray
  }
}

# 4. Check for prohibited patterns in reference files
$prohibitedPatterns = @(
  'import.*@expo/ui',        # @expo/ui should not be imported in skill docs
  'old.*swift.*parser',      # old parser references
  'tree-sitter',             # old project artifacts
  'VS Code WebView',         # old project references
  'Canvas renderer'          # old project references
)

$allFiles = Get-ChildItem $SkillDir -Recurse -Include "*.md" -ErrorAction SilentlyContinue
foreach ($file in $allFiles) {
  $fileContent = Get-Content $file.FullName -Raw
  foreach ($pattern in $prohibitedPatterns) {
    if ($fileContent -match $pattern) {
      Write-Host "[WARN] Prohibited pattern '$pattern' found in: $($file.Name)" -ForegroundColor Yellow
      $warnings++
    }
  }
}
if ($warnings -eq 0) {
  Write-Host "[OK] No prohibited patterns found in skill files" -ForegroundColor Green
}

# 5. Check for self-referencing links that resolve
$linkPattern = '\[.*?\]\((.*?\.md)\)'
foreach ($file in $allFiles) {
  $fileContent = Get-Content $file.FullName -Raw
  $matches = [regex]::Matches($fileContent, $linkPattern)
  foreach ($m in $matches) {
    $link = $m.Groups[1].Value
    $linkedPath = Join-Path (Split-Path $file.FullName -Parent) $link
    if (-not (Test-Path $linkedPath)) {
      $linkedPath = Join-Path $SkillDir $link
    }
    if (-not (Test-Path $linkedPath)) {
      Write-Host "[WARN] Broken link in $($file.Name): $link" -ForegroundColor Yellow
      $warnings++
    }
  }
}
Write-Host "[OK] Link resolution checked (warnings above if any)" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "Validation complete:" -ForegroundColor Cyan
Write-Host "  Errors:   $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "  Warnings: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })

if ($errors -gt 0) {
  Write-Host ""
  Write-Host "FAILED — $errors error(s) found" -ForegroundColor Red
  exit 1
} else {
  Write-Host ""
  Write-Host "PASSED — skill is valid" -ForegroundColor Green
  exit 0
}
