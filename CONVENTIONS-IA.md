# Conventions — Usage d'un assistant IA sur ce projet

Ce document s'applique quel que soit l'assistant utilisé (Claude, Cursor, Copilot, Gemini…).  
Aucune dépendance à un outil spécifique n'est requise.

---

## Principe général

Les fichiers `01-skills-universels/` sont des **documents de contexte** : ils contiennent les patterns validés, les décisions d'architecture et les conventions du projet. Ils sont rédigés en Markdown pur et lisibles par n'importe quel assistant.

> Charger les bons fichiers en contexte en début de session = condition pour obtenir un résultat cohérent avec le projet.

Voir `README.md` pour la composition recommandée selon le contexte de travail.

---

## Sécurité — Appels API depuis l'assistant

### Problème

Quand un assistant exécute un appel HTTP, la réponse transite par les serveurs du fournisseur (Anthropic, OpenAI, etc.). Les credentials et tokens présents dans la réponse ou lus depuis un fichier sont donc exposés hors de l'environnement local.

### Pattern retenu : script local intermédiaire

L'assistant ne lit jamais les credentials. Un script local fait l'authentification et n'expose à l'assistant que le résultat final (données métier uniquement).

```
.env (credentials)
      ↓
script local  ──→  API externe (Xano, etc.)
      ↓
résultat-output.json  ──→  assistant (lit uniquement ce fichier)
```

### Application : récupération du schéma Grist

| Fichier | Rôle | Commité |
|---|---|---|
| `.env` | Credentials Xano (URL login, URL schema, email, password) | ❌ gitignore |
| `.env.example` | Template vide — référence pour les nouveaux collaborateurs | ✅ |
| `get-grist-schema.ps1` | Script PowerShell — auth + fetch, écrit `schema-output.json` | ✅ |
| `grist-documents.json` | Registre des documents Grist par module | ✅ |
| `schema-output.json` | Schéma résultant — lu par l'assistant | ❌ gitignore |

**Commande à donner à l'assistant :**
> "Récupère le schéma du module `crm_entreprise`"

L'assistant exécute :
```powershell
powershell -ExecutionPolicy Bypass -File "get-grist-schema.ps1" -module crm_entreprise
```
puis lit `schema-output.json`. Il ne voit jamais les credentials ni le JWT.

---

## Convention `.env`

- Ne pas entourer les valeurs de guillemets (`"` ou `'`)
- Le script PowerShell strip les guillemets automatiquement, mais les éviter reste la bonne pratique
- Copier `.env.example`, ne jamais commiter `.env`

```bash
# ✅ Correct
XANO_LOGIN_URL=https://xxxx.xano.io/api:xxx/auth/login

# ❌ À éviter
XANO_LOGIN_URL="https://xxxx.xano.io/api:xxx/auth/login"
```

---

## Convention `grist-documents.json`

Chaque nouveau document Grist doit être enregistré dans ce fichier dès sa création.

```json
{
  "team_site_id": 7,
  "documents": [
    {
      "module": "nom_du_module",
      "doc_id": "identifiant_grist",
      "description": "Description courte"
    }
  ]
}
```

- `team_site_id` est partagé par tous les documents du workspace — à ne renseigner qu'une fois
- `doc_id` est visible dans l'URL du document Grist — non sensible, peut être commité
- `module` doit correspondre exactement au nom du dossier dans `02-projet-outillage-interne/modules/`

---

## Intégrations optionnelles par outil

| Outil | Intégration disponible | Notes |
|---|---|---|
| Claude Code | `.claude/` (settings, commands) | Chargement automatique des skills via plugin |
| Cursor / Windsurf | `.cursor/rules` ou `AGENTS.md` | Charger manuellement les fichiers de contexte |
| Copilot | Instructions personnalisées | Coller le contenu des skills en contexte |
| Autre | — | Charger les fichiers `01-skills-universels/` manuellement |

> Le dossier `.claude/` peut coexister dans le repo sans impacter les autres outils — il est simplement ignoré.
