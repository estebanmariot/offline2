---
name: xano-grist-schema
description: "Récupère le schéma complet d'un document Grist via l'endpoint Xano privé. Utiliser dès qu'on a besoin de connaître les tables, colonnes, colRef, types ou formules d'un document Grist — notamment avant de développer ou modifier un widget custom."
---

# Skill — Récupération du schéma Grist via Xano

## Principe de sécurité

Le script `get-grist-schema.ps1` gère l'authentification **entièrement en local**.  
Claude n'exécute que ce script et lit uniquement `schema-output.json` — il ne voit jamais les credentials ni le JWT.

```
.env (credentials)
      ↓
get-grist-schema.ps1  →  Xano login  →  Xano schema
      ↓
schema-output.json  ←  Claude lit uniquement ce fichier
```

---

## Prérequis

Fichier `.env` à la racine du projet (copier `.env.example` et renseigner les valeurs) :

```
XANO_LOGIN_URL=
XANO_SCHEMA_URL=
XANO_EMAIL=
XANO_PASSWORD=
```

> ⚠️ `.env` et `schema-output.json` sont dans `.gitignore` — ne jamais les commiter.

---

## Résolution du document

Le fichier `grist-documents.json` (racine du projet) liste tous les documents Grist par module.  
Consulter ce fichier pour identifier le bon module avant d'appeler le script.

---

## Procédure d'exécution

### Étape 1 — Lancer le script

**Option A — Par nom de module (recommandé) :**

```powershell
powershell -ExecutionPolicy Bypass -File "get-grist-schema.ps1" -module crm_entreprise
```

**Option B — Par paramètres directs (si module absent de grist-documents.json) :**

```powershell
powershell -ExecutionPolicy Bypass -File "get-grist-schema.ps1" -doc_id "VALEUR" -team_site_id VALEUR
```

Le script affiche :
- `Authentification Xano...`
- `Récupération du schéma...`
- `Schéma écrit dans schema-output.json` ✅

### Étape 2 — Lire le schéma

Utiliser l'outil **Read** pour lire `schema-output.json` à la racine du projet.

---

## Utilisation du résultat

Une fois le schéma récupéré :

- Identifier les **noms exacts de tables** (TABLE IDs Grist)
- Extraire les **colRef** (identifiants numériques de colonnes) nécessaires aux `Ref:` et `displayCol`
- Vérifier les **types de colonnes** (Text, Numeric, Choice, Ref, DateTime…)
- Repérer les **colonnes formule** (ne jamais les envoyer dans `applyUserActions`)
- Identifier la **table summary** à utiliser comme source du widget si RLS utilisateur requis

> Ces informations alimentent directement `spec-technique.md` et le code du widget.

---

## En cas d'erreur

| Message d'erreur | Cause probable | Action |
|---|---|---|
| `.env introuvable` | Fichier `.env` absent | Copier `.env.example` → `.env` et renseigner les valeurs |
| `Variable manquante dans .env` | Une des 4 variables est vide | Vérifier `.env` |
| `Échec du login` | URL ou credentials incorrects | Vérifier `XANO_LOGIN_URL`, `XANO_EMAIL`, `XANO_PASSWORD` |
| `authToken absent` | Mauvais endpoint de login | Vérifier `XANO_LOGIN_URL` |
| `Échec récupération schéma` (403) | `team_site_id` incorrect | Vérifier l'URL du workspace Grist |
| `Échec récupération schéma` (404) | `doc_id` incorrect | Vérifier l'URL du document Grist |
