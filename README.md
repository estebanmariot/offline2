# Corpus IA-Grist — Guide d'utilisation

## Structure

```
📁 corpus/
├── 📁 01-skills-universels/              ← Réutilisable sur tout projet Grist
│   ├── skill-grist-widget.md             Patterns widget React, fetchTable, RLS, identification user
│   ├── skill-grist-rls.md                Pattern ACL standardisé
│   ├── skill-xanoscript.md               Syntaxe et pièges XanoScript
│   ├── skill-methodo-projet.md           Spec-first, templates, avancement, user stories
│   └── skill-xano-grist-schema.md        Récupération autonome du schéma Grist via Xano
│
├── CONVENTIONS-IA.md                     Conventions multi-LLM, sécurité API, .env, grist-documents.json
├── get-grist-schema.ps1                  Script local d'auth Xano + fetch schéma (credentials jamais exposés)
├── grist-documents.json                  Registre des documents Grist par module
├── .env.example                          Template credentials (le .env réel est gitignore)
│
└── 📁 02-projet-outillage-interne/       ← Tout ce qui est propre au projet
    ├── projet-contexte.md                ESN, stack, modules, détection rôle, charte graphique
    ├── projet-securite.md                Chaînes de sécurité, token Xano, variables env
    │
    └── 📁 modules/
        ├── 📁 crm_entreprise/
        │   └── avancement.md
        │
        └── 📁 mon_espace_collab/
            ├── 📁 module_cra_boond/
            │   ├── timesheets-boond-api.md   Endpoints Boond, structures JSON, pièges
            │   └── avancement.md
            │
            ├── 📁 module_rh_entretiens/
            │   ├── rh-decisions.md           Décisions archi, RLS, patterns spécifiques RH
            │   └── avancement.md
            │
            └── 📁 module_ticketing/
                └── avancement.md
```

---

## Composition du Project Knowledge selon le contexte

| Contexte | Fichiers à charger |
|---|---|
| **Nouveau widget Grist (hors projet)** | `skill-grist-widget` + `skill-grist-rls` + `skill-methodo-projet` |
| **Nouveau module** | `projet-contexte` + `projet-securite` + `skill-grist-widget` + `skill-grist-rls` + `skill-methodo-projet` |
| **Continuer module_cra_boond** | `projet-contexte` + `projet-securite` + `timesheets-boond-api` + `skill-xanoscript` + `skill-grist-widget` |
| **Continuer module_rh_entretiens** | `projet-contexte` + `rh-decisions` + `skill-grist-widget` + `skill-grist-rls` |
| **Démarrer module_ticketing / crm** | `projet-contexte` + `projet-securite` + `skill-grist-widget` + `skill-grist-rls` + `skill-methodo-projet` |
| **Consulter le schéma d'un document Grist** | `skill-xano-grist-schema` + `grist-documents.json` renseigné |
| **Rédiger specs uniquement** | `skill-methodo-projet` seul suffit |

---

## Règles de maintenance

| Quand | Action |
|---|---|
| Nouveau pattern Grist générique découvert | → `skill-grist-widget.md` |
| Nouveau pattern RLS découvert | → `skill-grist-rls.md` |
| Nouveau piège ou pattern XanoScript | → `skill-xanoscript.md` |
| Nouveau document Grist créé | → `grist-documents.json` (ajouter l'entrée module + doc_id) |
| Décision archi commune au projet (stack, sécu) | → `projet-contexte.md` ou `projet-securite.md` |
| Nouvelle convention IA ou pattern sécurité | → `CONVENTIONS-IA.md` |
| Décision spécifique à un module | → fichier de décisions du module concerné |
| Fin de session de développement | → `avancement.md` du module concerné |
| Nouveau module créé | → Créer `modules/[nom]/` avec `avancement.md` + docs specs |

---

## Principe clé

> **Stable dans les skills, vivant dans avancement.md.**
> Les skills et fichiers projet ne changent qu'à chaque apprentissage significatif.
> `avancement.md` est le seul fichier mis à jour à chaque session.
