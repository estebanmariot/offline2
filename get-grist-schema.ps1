<#
.SYNOPSIS
    Récupère le schéma d'un document Grist via l'endpoint Xano privé.
    Écrit le résultat dans schema-output.json — jamais les credentials.

.PARAMETER module
    Nom du module (résolution automatique via grist-documents.json)
    Ex : crm_entreprise, module_rh, ticketing

.PARAMETER doc_id
    Identifiant du document Grist (si non renseigné dans grist-documents.json)

.PARAMETER team_site_id
    Identifiant du site Grist/workspace (si non renseigné dans grist-documents.json)

.EXAMPLE
    .\get-grist-schema.ps1 -module crm_entreprise
    .\get-grist-schema.ps1 -doc_id "abc123" -team_site_id 42
#>

param(
    [string]$module,
    [string]$doc_id,
    [int]$team_site_id
)

# --- Résolution des paramètres via grist-documents.json ---
$configPath = Join-Path $PSScriptRoot "grist-documents.json"

if ($module) {
    if (-not (Test-Path $configPath)) {
        Write-Error "grist-documents.json introuvable. Impossible de résoudre le module '$module'."
        exit 1
    }
    $config = Get-Content $configPath | ConvertFrom-Json
    $entry  = $config.documents | Where-Object { $_.module -eq $module }

    if (-not $entry) {
        Write-Error "Module '$module' introuvable dans grist-documents.json."
        Write-Host "Modules disponibles : $($config.documents.module -join ', ')" -ForegroundColor Yellow
        exit 1
    }
    if (-not $entry.doc_id) {
        Write-Error "doc_id non renseigné pour le module '$module' dans grist-documents.json."
        exit 1
    }

    $doc_id      = $entry.doc_id
    $team_site_id = if ($team_site_id) { $team_site_id } else { $config.team_site_id }
    Write-Host "Module résolu : $module → doc_id=$doc_id, team_site_id=$team_site_id" -ForegroundColor DarkGray
}

if (-not $doc_id -or -not $team_site_id) {
    Write-Error "Paramètres manquants. Utiliser -module <nom> ou -doc_id <id> -team_site_id <id>."
    exit 1
}

# --- Lecture du .env ---
$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Error ".env introuvable à la racine du projet. Copier .env.example en .env et renseigner les valeurs."
    exit 1
}

$env_vars = @{}
Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
        $value = $matches[2].Trim().Trim('"').Trim("'")
        $env_vars[$matches[1].Trim()] = $value
    }
}

$loginUrl  = $env_vars["XANO_LOGIN_URL"]
$schemaUrl = $env_vars["XANO_SCHEMA_URL"]
$email     = $env_vars["XANO_EMAIL"]
$password  = $env_vars["XANO_PASSWORD"]

if (-not $loginUrl -or -not $schemaUrl -or -not $email -or -not $password) {
    Write-Error "Variable(s) manquante(s) dans .env (XANO_LOGIN_URL, XANO_SCHEMA_URL, XANO_EMAIL, XANO_PASSWORD)."
    exit 1
}

# --- Étape 1 : Login Xano → JWT ---
Write-Host "Authentification Xano..." -ForegroundColor Cyan

try {
    $loginBody     = @{ email = $email; password = $password } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod `
        -Uri $loginUrl `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop
} catch {
    Write-Error "Échec du login Xano : $($_.Exception.Message)"
    exit 1
}

$jwt = $loginResponse.authToken
if (-not $jwt) {
    Write-Error "Champ 'authToken' absent de la réponse de login. Vérifier XANO_LOGIN_URL."
    exit 1
}

# --- Étape 2 : Récupération du schéma ---
Write-Host "Récupération du schéma (doc_id=$doc_id, team_site_id=$team_site_id)..." -ForegroundColor Cyan

try {
    $headers = @{ Authorization = "Bearer $jwt" }
    $schema  = Invoke-RestMethod `
        -Uri "$schemaUrl`?doc_id=$doc_id&team_site_id=$team_site_id" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
} catch {
    Write-Error "Échec de la récupération du schéma : $($_.Exception.Message)"
    exit 1
}

# --- Écriture du résultat (schéma uniquement, jamais les credentials) ---
$outputPath = Join-Path $PSScriptRoot "schema-output.json"
$schema | ConvertTo-Json -Depth 20 | Set-Content $outputPath -Encoding UTF8

Write-Host "Schéma écrit dans schema-output.json" -ForegroundColor Green
