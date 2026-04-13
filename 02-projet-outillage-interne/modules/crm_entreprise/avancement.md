# Avancement — CRM Interne v0.1
_Mise à jour : 2026-04-10 — à mettre à jour en fin de chaque session_
_Granularité : 0,125 JH = 1h | Base : 8h = 1 JH_
_Lié à : spec-fonctionnelle-crm-v0.1.md v2.2 · spec-technique-crm-v0.1.md v2.2_

---

## ✅ Fait

| Fonctionnalité | Détail | JH |
|---|---|---|
| Spec fonctionnelle v2.2 | Acteurs, droits, workflow 10 statuts, règles métier R-01 à R-10 | 0,5 |
| Spec technique v2.2 | Modèle de données (5 tables), RLS, architecture widget, hypothèses H-01 à H-11 | 0,5 |
| Schéma Grist | `grist_doc_schema.json` — toutes les tables, colonnes, colRef, types, formules | 0,5 |
| Widget v0.1 — Init & structure | SPA React 18 + Babel CDN + Chart.js 4, `grist.ready`, `onRecords`, détection utilisateur connecté via summary | 0,25 |
| Widget v0.1 — Chargement multi-table | `loadAll` async : 5 tables en parallèle, conversion columnar→rows (`toRows`) | 0,25 |
| Widget v0.1 — Tab Comptes | Liste paginée (20/p), recherche, filtres, CRUD complet (créer, modifier, supprimer avec confirmation), validation champ obligatoire `nom` | 0,5 |
| Widget v0.1 — Tab Contacts | Liste paginée, recherche, CRUD complet, validation champs obligatoires (`prenom`, `nom`, `compte`), sélecteur Compte | 0,5 |
| Widget v0.1 — Tab Opportunités | Liste paginée, recherche, filtres, contrôle d'édition par `user_id`, CRUD selon rôle, blocage Closed Lost sans raison de perte | 0,75 |
| Widget v0.1 — Activités | Liste par opportunité, CRUD (créer, supprimer), horodatage, `compte` déduit automatiquement (non envoyé dans `applyUserActions`) | 0,5 |
| Widget v0.1 — Dashboard | 6 KPI cards, donut Chart.js (répartition statuts), bar chart horizontal (top 10 comptes par montant) | 0,5 |
| Widget v0.1 — UI/UX | Design system Inter, composants toast, drawer, modal confirmation, navigation par onglets | 0,25 |

**Total réalisé : 5,00 JH**

---

## 🔄 Reste à faire

| # | Tâche | Détail | JH estimé |
|---|---|---|---|
| 1 | Validation H-08 | Tester `grist.docApi.fetchTable` avec `requiredAccess: 'full'` en environnement réel | 0,25 |
| 2 | Validation H-09 | Tester lecture simultanée des 5 tables au chargement — vérifier absence d'erreur de droits | 0,25 |
| 3 | Validation H-11 | Tester l'export Salesforce — vérifier la qualité des données pour import dans Grist | 0,5 |
| 4 | Import données Salesforce | Nettoyage CSV + import dans les tables Grist (Comptes, Contacts, Opportunités) | 1,0 |
| 5 | RLS production | Configurer les seed rules (`acl_viewers`, `acl_editors`, `acl_deletors`) dans Grist, tester par rôle | 0,5 |
| 6 | Tests d'intégration complets | Valider les flux CRUD sur chaque entité, tester le contrôle d'édition Admin vs Commercial | 0,5 |
| 7 | Recette utilisateur | Session de test avec 1 admin + 1 commercial, correction des retours | 0,5 |
| 8 | Fichier `acceptance.md` | Rédiger les cas de test formels avant recette | 0,25 |
| 9 | Fichier `estimation.md` | Figer l'estimation initiale pour référence projet | 0,25 |

**Total restant : 4,00 JH**

---

## 💡 Envisagé (hors périmètre v1)

| # | Idée | Valeur attendue | JH estimé |
|---|---|---|---|
| 1 | Vue Kanban du pipeline | Visualisation drag-and-drop par statut — meilleure UX commerciale | 2,0 |
| 2 | Notifications automatiques | Alertes email sur changement de statut ou relance programmée | 1,5 |
| 3 | Intégration messagerie (Gmail / Outlook) | Lier les emails envoyés aux activités CRM | 3,0 |
| 4 | RLS Grist native sur Opportunités (v2) | Remplacer le contrôle widget côté serveur — plus robuste | 1,0 |
| 5 | Automatisation des relances | Rappels automatiques sur opportunités inactives depuis X jours | 1,5 |
| 6 | Sync Salesforce continue | Import bidirectionnel ou lecture Salesforce en temps réel | 5,0 |
