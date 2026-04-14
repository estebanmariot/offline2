# Corpus IA-Grist — Portail Mairie

## Structure

📁 corpus/
├── 📁 01-skills-universels/              ← Réutilisable (Ne pas modifier)
│   ├── skill-grist-widget.md             Patterns widget React, fetchTable, RLS, identification user
│   ├── skill-grist-rls.md                Pattern ACL standardisé
│   ├── skill-xanoscript.md               Syntaxe et pièges XanoScript
│   ├── skill-methodo-projet.md           Spec-first, templates, avancement
│   └── skill-xano-grist-schema.md        Récupération autonome du schéma Grist
│
├── CONVENTIONS-IA.md                     Conventions de sécurité
├── grist-documents.json                  Registre des documents Grist du portail Mairie
│
└── 📁 02-projet-mairie/                  ← Cœur du nouveau projet
├── projet-contexte.md                Mairie, rôles (Agent, Citoyen, Asso), stack, charte
│
└── 📁 modules/
└── 📁 portail_unique/            ← L'application widget SPA
├── spec-fonctionnelle-v0.1.md
├── spec-technique-v0.1.md
└── avancement.md


---

## Composition du Project Knowledge selon le contexte

| Contexte | Fichiers à charger |
|---|---|
| **Démarrer le Portail Mairie** | `projet-contexte` + `spec-fonctionnelle-v0.1` + `skill-grist-widget` + `skill-grist-rls` + `skill-methodo-projet` |
| **Continuer le développement** | `projet-contexte` + `spec-technique-v0.1` + `avancement.md` + `skill-grist-widget` |
| **Intégrer l'IA pour les réunions**| `projet-contexte` + `skill-xanoscript` + `spec-technique-v0.1` |

---

## Principe clé

> **Stable dans les skills, vivant dans avancement.md.**
> Les skills et fichiers projet ne changent qu'à chaque apprentissage.
> `avancement.md` est le seul fichier mis à jour à chaque session de code.