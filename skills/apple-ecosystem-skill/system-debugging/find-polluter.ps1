param(
  [Parameter(Mandatory = $true)]
  [string]$PollutionCheck,

  [Parameter(Mandatory = $true)]
  [string]$TestPattern
)

function Normalize-Pattern {
  param([string]$Pattern)

  $normalized = $Pattern -replace "\\", "/"
  if ($normalized.StartsWith("./")) {
    return $normalized.Substring(2)
  }
  return $normalized
}

function Test-PollutionExists {
  param([string]$Path)
  return Test-Path -LiteralPath $Path
}

$normalizedPattern = Normalize-Pattern -Pattern $TestPattern
$repoRoot = (Get-Location).Path

Write-Host "Searching for test that creates: $PollutionCheck"
Write-Host "Test pattern: $TestPattern"
Write-Host ""

$testFiles = Get-ChildItem -Path . -Recurse -File | ForEach-Object {
  $relativePath = [System.IO.Path]::GetRelativePath($repoRoot, $_.FullName) -replace "\\", "/"
  [PSCustomObject]@{
    RelativePath = $relativePath
    FullPath = $_.FullName
  }
} | Where-Object {
  $_.RelativePath -like $normalizedPattern
} | Sort-Object RelativePath

$total = @($testFiles).Count

Write-Host "Found $total test files"
Write-Host ""

$count = 0
foreach ($testFile in $testFiles) {
  $count += 1

  if (Test-PollutionExists -Path $PollutionCheck) {
    Write-Host "Pollution already exists before test $count/$total"
    Write-Host "Skipping: $($testFile.RelativePath)"
    continue
  }

  Write-Host "[$count/$total] Testing: $($testFile.RelativePath)"

  & npm test -- $testFile.RelativePath *> $null

  if (Test-PollutionExists -Path $PollutionCheck) {
    Write-Host ""
    Write-Host "FOUND POLLUTER"
    Write-Host "  Test: $($testFile.RelativePath)"
    Write-Host "  Created: $PollutionCheck"
    Write-Host ""
    Write-Host "Pollution details:"
    Get-Item -Force -LiteralPath $PollutionCheck | Format-List FullName, Length, Mode, LastWriteTime
    Write-Host ""
    Write-Host "To investigate:"
    Write-Host "  npm test -- $($testFile.RelativePath)"
    Write-Host "  Get-Content $($testFile.RelativePath)"
    exit 1
  }
}

Write-Host ""
Write-Host "No polluter found - all tests clean."
exit 0
