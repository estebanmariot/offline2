# Tests d'acceptance — Module RH : Entretiens annuels
**Version :** 0.2  
**Date :** 2026-03  
**Lié à :** spec-rh-entretiens.md v0.6

---

## Conventions

- ✅ Passé | ❌ Échoué | ⏳ Non testé
- **Prérequis communs :** Instance Grist avec 5 comptes — `collab@test.fr`, `manager@test.fr`, `referent_pole@test.fr`, `referent_rh@test.fr` (owner), `super_admin@test.fr` (owner). Table `Pôles` avec 1 pôle "Tech" dont le référent est `referent_pole@test.fr`. Table `Collaborateurs` peuplée : collab rattaché au manager, au pôle Tech. Une campagne 2026 `active` avec 2 sections (1 standard, 1 objectifs) et 3 questions. Un entretien créé pour `collab@test.fr`.

---

## Bloc A — RLS et isolation des données

### A1 — Table Summary Timesheets : collab voit uniquement sa ligne
- Connecté en `collab@test.fr`
- Ouvrir une vue liée sur la table Summary `Collaborateurs [by email, boond_resource_id]`
- **Attendu :** une seule ligne visible — celle du collab connecté

### A2 — Table Summary Timesheets : manager voit uniquement sa propre ligne
- Connecté en `manager@test.fr`
- **Attendu :** une seule ligne visible dans la Summary — la sienne (pas ses collaborateurs)

### A3 — Table Collaborateurs source : manager voit tous les collaborateurs
- Connecté en `manager@test.fr`
- Ouvrir le widget suivi objectifs (lié à `Collaborateurs` source)
- **Attendu :** tous les collaborateurs visibles dans le sélecteur

### A4 — Entretiens : collab voit uniquement son entretien
- Connecté en `collab@test.fr`
- **Attendu :** un seul entretien visible dans le widget

### A5 — Entretiens : manager voit ses collaborateurs directs uniquement
- Connecté en `manager@test.fr`
- **Attendu :** seuls les entretiens dont `manager_id` = manager connecté

### A6 — Entretiens : référent pôle voit tous les entretiens de son pôle
- Connecté en `referent_pole@test.fr`
- **Attendu :** entretiens des collabs du pôle "Tech" visibles, entretiens des autres pôles invisibles

### A7 — Entretiens : referent_rh et super_admin voient tout
- Connecté en `referent_rh@test.fr` (owner)
- **Attendu :** tous les entretiens visibles sans filtre

### A8 — Objectifs : même isolation que les entretiens
- Répéter A4 à A7 sur le widget suivi objectifs
- **Attendu :** même périmètre de visibilité que pour les entretiens

### A9 — acl_viewers : formule calculée correcte
- Ouvrir la table `Entretiens` en IHM native (owner)
- Vérifier la colonne `acl_viewers` d'un entretien
- **Attendu :** chaîne contenant `collab_email,manager_email,referent_pole_email`

### A10 — Compatibilité Timesheets : widget non impacté
- Connecté en `collab@test.fr`
- Ouvrir le widget Timesheets
- **Attendu :** widget fonctionnel, `boond_resource_id` correctement résolu depuis la table Summary

---

## Bloc B — Workflow entretien

### B1 — Statut initial
- super_admin crée un entretien
- **Attendu :** statut = `PLANIFIE`, dates vides

### B2 — Collab soumet
- Connecté en `collab@test.fr`, statut `EN_PREP_COLLAB`
- Remplir une réponse, cliquer "Soumettre"
- **Attendu :** statut → `SOUMIS`, `date_soumission_collab` remplie, notification email au manager

### B3 — Collab bloqué après soumission
- Statut `SOUMIS`, connecté en `collab@test.fr`
- **Attendu :** formulaire en lecture seule, bouton Soumettre absent

### B4 — Manager publie
- Connecté en `manager@test.fr`, statut `EN_PREP_MANAGER`
- Remplir une réponse manager, cliquer "Publier"
- **Attendu :** statut → `PUBLIE`, `date_publication_manager` remplie, notification email au collab

### B5 — Manager bloqué après publication
- Statut `PUBLIE`, connecté en `manager@test.fr`
- **Attendu :** formulaire en lecture seule, bouton Publier absent

### B6 — Collab valide
- Connecté en `collab@test.fr`, statut `PUBLIE`
- Cliquer "Valider"
- **Attendu :** statut → `VALIDE`, `date_validation_collab` remplie

### B7 — Lecture seule post-validation
- Statut `VALIDE`, tout rôle
- **Attendu :** formulaire entier en lecture seule, aucun bouton d'action

### B8 — Sauvegarde brouillon sans changement de statut
- Collab en `EN_PREP_COLLAB`, modifier une réponse, cliquer "Sauvegarder"
- **Attendu :** statut reste `EN_PREP_COLLAB`, données persistées, pas de notification

---

## Bloc C — Formulaire sections standard

### C1 — Navigation entre sections
- **Attendu :** onglets sections visibles, clic → contenu affiché, onglet actif mis en évidence

### C2 — Rendu question texte
- **Attendu :** deux textarea côte à côte (collab / manager), labels clairs

### C3 — Rendu question note
- Question avec `note_max = 5`
- **Attendu :** sélecteur étoiles 1–5 pour chaque auteur

### C4 — Bouton "Copier ↓" (manager)
- Manager connecté, réponse collab remplie
- Cliquer "Copier ↓"
- **Attendu :** champ manager pré-alimenté, reste éditable

### C5 — Bouton "Copier ↓" absent pour le collab
- **Attendu :** aucun bouton "Copier ↓" visible côté collab

### C6 — Persistance après rechargement
- Saisir, sauvegarder, recharger
- **Attendu :** réponses affichées à l'identique

### C7 — Référent pôle voit le formulaire en lecture seule
- Connecté en `referent_pole@test.fr`, entretien `VALIDE`
- **Attendu :** formulaire visible, tout en lecture seule, aucun bouton d'action

---

## Bloc D — Section objectifs (widget entretien)

### D1 — Affichage trois blocs temporels
- Campagne 2026, objectifs en années 2025, 2026, 2027
- **Attendu :** blocs "Bilan N-1 (2025)", "Suivi N (2026)", "Objectifs N+1 (2027)"

### D2 — % d'avancement masqué sur N+1
- **Attendu :** pas de champ % dans le bloc N+1

### D3 — Ajout objectif par le collab
- `EN_PREP_COLLAB`, cliquer "+ Objectif N"
- **Attendu :** objectif créé dans `Objectifs` avec `annee = 2026`, `collaborateur_id` correct

### D4 — Ajout objectif par le manager
- `EN_PREP_MANAGER`, cliquer "+ Objectif N+1"
- **Attendu :** objectif créé avec `annee = 2027`, visible dans widget suivi du collab

### D5 — Ajout critère
- Cliquer "+ Critère" sur un objectif, saisir libellé et seuil
- **Attendu :** critère créé, `objectif_id` correct

### D6 — Cochage critère collab → plancher %
- Objectif N-1, critères à 50%, 75%, 100%
- Cocher critère 75%
- **Attendu :** `pct_avancement_collab` ≥ 75 automatiquement

### D7 — Plancher non franchissable à la baisse
- Plancher = 75, tenter de saisir 50
- **Attendu :** valeur refusée ou ramenée à 75, message affiché

### D8 — % libre au-dessus du plancher
- Plancher = 75, saisir 90
- **Attendu :** valeur 90 acceptée

### D9 — Indépendance collab / manager sur critères
- Collab coche `atteint_collab` critère 75% → `pct_avancement_collab` = 75
- Manager ne coche pas `atteint_manager`
- **Attendu :** `pct_avancement_manager` inchangé

### D10 — Collab ne peut pas cocher atteint_manager
- Connecté en `collab@test.fr`
- **Attendu :** colonne `atteint_manager` en lecture seule ou absente

### D11 — Bouton "Copier ↓" sur % et commentaire objectif
- Manager connecté, cliquer "Copier ↓" sur % puis commentaire
- **Attendu :** `pct_avancement_manager` et `commentaire_manager` pré-alimentés, éditables

---

## Bloc E — Widget suivi objectifs (continu)

### E1 — Collab voit ses objectifs de l'année courante
- **Attendu :** objectifs filtrés sur `collaborateur_id` = collab connecté, année courante par défaut

### E2 — Sélecteur d'année fonctionnel
- Changer l'année → liste mise à jour

### E3 — Manager : sélecteur de collaborateurs directs uniquement
- Connecté en `manager@test.fr`
- **Attendu :** sélecteur n'affiche que les collaborateurs directs

### E4 — Manager crée un objectif pour un collab
- Sélectionner un collab, "+ Objectif", saisir titre
- **Attendu :** objectif créé avec `collaborateur_id` = collab sélectionné, visible dans son widget

### E5 — Référent pôle : lecture seule sur objectifs de son pôle
- Connecté en `referent_pole@test.fr`
- **Attendu :** objectifs des collabs du pôle Tech visibles, aucune action d'édition disponible

### E6 — Suivi continu indépendant du statut entretien
- Entretien `VALIDE`, collab modifie % d'avancement objectif N
- **Attendu :** modification acceptée

### E7 — Barre de progression visuelle
- Objectif avec `pct_avancement_collab` = 75
- **Attendu :** barre à 75%, cohérente avec la valeur

---

## Bloc F — Notifications email

### F1 — Notification ouverture collab
- Passage `PLANIFIE` → `EN_PREP_COLLAB`
- **Attendu :** email reçu par collab, objet correct, lien Grist inclus

### F2 — Notification soumission manager
- Collab soumet
- **Attendu :** email reçu par manager avec nom du collab

### F3 — Notification publication collab
- Manager publie
- **Attendu :** email reçu par collab

### F4 — Pas de notification sur sauvegarde brouillon
- **Attendu :** aucun email lors des sauvegardes

---

## Bloc G — Cohérence des données

### G1 — manager_id copié à la création de l'entretien
- **Attendu :** `entretien.manager_id` = `collaborateur.manager_id`

### G2 — Objectif visible dans les deux widgets
- Créer objectif via widget suivi (année 2026)
- Ouvrir widget entretien campagne 2026
- **Attendu :** objectif visible dans bloc "Suivi N"

### G3 — Objectif entretien visible dans widget suivi
- Créer objectif via widget entretien (N+1, année 2027)
- Widget suivi, année 2027
- **Attendu :** objectif visible

### G4 — acl_viewers mis à jour si manager change
- Changer le `manager_id` d'un collaborateur en IHM Grist
- **Attendu :** `acl_viewers` recalculé automatiquement (formule Grist)
