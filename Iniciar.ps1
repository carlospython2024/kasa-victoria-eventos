param([switch]$Produccion)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) { $nodeExecutable = $nodeCommand.Source }
else {
  $nodeExecutable = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  if (-not (Test-Path -LiteralPath $nodeExecutable)) { throw 'Instala Node.js 24 o posterior para ejecutar el proyecto.' }
}
if (-not (Test-Path -LiteralPath 'node_modules\vite\bin\vite.js')) {
  throw 'Primero instala las dependencias con pnpm install o npm install.'
}
if ($Produccion) {
  & $nodeExecutable 'node_modules\typescript\bin\tsc' --noEmit
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  & $nodeExecutable 'node_modules\typescript\bin\tsc' -p tsconfig.server.json
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  & $nodeExecutable 'node_modules\vite\bin\vite.js' build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  & $nodeExecutable --import tsx 'scripts\prerender.tsx'
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  & $nodeExecutable --env-file-if-exists=.env.local --import tsx 'server\start.ts'
} else {
  & $nodeExecutable 'node_modules\vite\bin\vite.js' --host 127.0.0.1 --port 5173
}
