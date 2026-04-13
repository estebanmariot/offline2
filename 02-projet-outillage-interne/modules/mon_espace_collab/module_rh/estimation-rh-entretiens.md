# Estimation d'effort — Module RH : Entretiens annuels
**Version :** 0.2  
**Date :** 2026-03  
**Lié à :** spec-rh-entretiens.md v0.6 — acceptance-rh-entretiens.md v0.2

---

## Résumé

| Bloc | Intitulé | Effort estimé |
|---|---|---|
| 0 | Infrastructure Grist | 3h |
| 1 | Widget 1 — Formulaire entretien (sections standard) | 6h |
| 2 | Widget 1 — Formulaire entretien (section objectifs) | 8h |
| 3 | Widget 2 — Suivi objectifs continu | 5h |
| 4 | Notifications email | 2h |
| 5 | Recette | 8h |
| **Total** | | **32h** |

> **Référence de calibration :** module Timesheets ~28h (Blocs 0-2 faits, Bloc 3 recette en cours). Le module RH est comparable en volume widget, sans la complexité Xano/API mais avec la complexité RLS multi-rôles et l'arbre objectifs/critères.

---

## Bloc 0 — Infrastructure Grist (3h)

**Déjà en place :**
- ✅ Instance Elestio opérationnelle
- ✅ Sign in with Grist activé
- ✅ Table `Collaborateurs` existante
- ✅ Table Summary `Collaborateurs [by email, boond_resource_id]` créée et RLS validée en test
- ✅ Token widget Xano existant (réutilisable pour emails)

**À faire :**
- Ajouter colonnes RH sur `Collaborateurs` (`nom_complet`, `manager_id`, `pole_id`, `role`, `actif`) — 0.5h
- Créer table `Pôles` — 0.25h
- Créer les 5 nouvelles tables (`Campagnes`, `Sections`, `Questions`, `Entretiens`, `Réponses`, `Objectifs`, `Critères`) avec colonnes et types — 1h
- Écrire et tester la formule `acl_viewers` sur `Entretiens` — 0.5h
- Écrire et tester la formule `acl_viewers` sur `Objectifs` — 0.25h
- Configurer les règles RLS sur `Entretiens` et `Objectifs` (`user.Email in $acl_viewers.split(",")`) — 0.25h
- Valider H14 : refs chaînées 3 niveaux (`pole_id.referent_id.email`) en formule Grist — 0.25h

**Risque principal :**
- ⚠️ H14 : si la formule chaînée ne fonctionne pas, appliquer le fallback (colonne dénormalisée `referent_pole_email` sur `Collaborateurs`) — +0.5h

**Ordre critique :** valider H14 en tout premier — c'est le seul risque architectural restant.

---

## Bloc 1 — Widget 1 : Formulaire entretien — Sections standard (6h)

**Périmètre :**
- Initialisation `grist.onRecords` / `grist.onRecord` — pattern Timesheets réutilisable
- Détection du rôle connecté depuis `Collaborateurs` (colonne `role`)
- Navigation par onglets entre sections
- Rendu question `texte` : deux textarea côte à côte
- Rendu question `note` : sélecteur étoiles côte à côte
- Bouton "Copier ↓" (manager uniquement)
- Sauvegarde brouillon via `grist.docApi.applyUserActions`
- Actions Soumettre / Publier / Valider + mise à jour statut + date
- Lecture seule selon statut et rôle
- Référents et super_admin : lecture seule totale

**Décomposition :**
- Squelette React + initialisation + détection rôle — 1h
- Navigation sections + onglets — 0.5h
- Rendu questions texte + note + layout côte à côte — 1.5h
- Bouton Copier ↓ — 0.5h
- Sauvegarde brouillon (upsert `Réponses`) — 1h
- Actions Soumettre / Publier / Valider + lecture seule — 1h
- Charte graphique + polish — 0.5h

**Risques :**
- ⚠️ Upsert `Réponses` : lire les IDs existants avant sauvegarde pour UPDATE vs INSERT
- ⏳ Performances `applyUserActions` avec ~60 réponses simultanées — à tester

---

## Bloc 2 — Widget 1 : Formulaire entretien — Section objectifs (8h)

**Périmètre :**
- Lecture objectifs du collab sur 3 années (N-1, N, N+1) depuis `campagne.annee`
- Trois blocs avec affichage conditionnel % (N-1 et N uniquement)
- Ajout/suppression objectifs (collab et manager)
- Ajout/suppression critères par objectif
- Cochage `atteint_collab` / `atteint_manager` selon rôle
- Logique plancher % : validation à la saisie
- Champs % et commentaires avec Copier ↓ (manager)
- Lecture seule selon statut

**Décomposition :**
- Lecture objectifs 3 années + structure état React — 1h
- Rendu 3 blocs avec affichage conditionnel % — 1.5h
- Ajout/suppression objectifs (écriture `Objectifs`) — 1h
- Rendu critères + ajout/suppression (écriture `Critères`) — 1h
- Logique cochage + calcul plancher % + validation saisie — 1.5h
- Commentaires + Copier ↓ sur objectifs — 0.5h
- Lecture seule selon statut + rôle — 0.5h
- Tests cohérence inter-widgets — 1h

**Risques :**
- ⚠️ State React arbre objectifs → critères : bien concevoir `{ [objectif_id]: { ...obj, criteres: [...] } }` dès le départ
- ⚠️ Bloc le plus dense — buffer 1h inclus

---

## Bloc 3 — Widget 2 : Suivi objectifs continu (5h)

**Périmètre :**
- Lié à `Collaborateurs` (RLS filtre selon rôle)
- Sélecteur d'année (défaut : année courante)
- Vue collab : ses objectifs, édition libre
- Vue manager : sélecteur de collaborateur direct + édition complète
- Vue référent pôle / RH : sélecteur de collaborateur, lecture seule
- Logique plancher % (même logique Bloc 2 — fonction utilitaire partagée)
- Barre de progression visuelle

**Décomposition :**
- Squelette React + initialisation + sélecteur année — 0.5h
- Détection rôle + sélecteur collaborateur (manager / référent) — 0.75h
- Liste objectifs + rendu critères — 1h
- Ajout/modification objectifs et critères — 1h
- Logique plancher % (réutilisation Bloc 2) — 0.25h
- Lecture seule selon rôle (référents) — 0.25h
- Barre de progression + charte graphique — 0.75h
- Tests isolation RLS — 0.5h

---

## Bloc 4 — Notifications email (2h)

**Décomposition :**
- Test CORS Mailtrap depuis widget Grist — 0.25h
- Si OK : implémentation fetch direct — 0.5h
- Si CORS bloqué : endpoint Xano `rh/send-email` (pattern existant) — 1h
- 3 templates email HTML simples — 0.5h
- Tests envoi réel (Mailtrap inbox) — 0.25h

---

## Bloc 5 — Recette (8h)

**Décomposition :**
- Setup environnement recette (5 comptes, données de test, pôles) — 0.75h
- Bloc A (RLS multi-rôles + compatibilité Timesheets) — 2h
- Blocs B + C (workflow + formulaire standard) — 2h
- Blocs D + E (objectifs widget 1 + widget 2) — 1.5h
- Blocs F + G (emails + cohérence inter-widgets) — 0.75h
- Corrections post-recette (buffer) — 1h

**Tests prioritaires (à passer en premier) :**
1. A1 + A10 — compatibilité Timesheets avec la nouvelle architecture Summary
2. A6 + A8 — RLS référent pôle via `acl_viewers`
3. D6 + D9 — logique plancher % et indépendance collab/manager

---

## Ordre de développement recommandé

1. **Bloc 0** — Infrastructure + validation H14 (refs chaînées) en tout premier
2. **Bloc 4** — Test CORS email (débloque ou non le besoin Xano)
3. **Bloc 1** — Widget 1 sections standard (fondations)
4. **Bloc 2** — Widget 1 section objectifs (greffe sur fondations)
5. **Bloc 3** — Widget 2 suivi (réutilise composants Bloc 2)
6. **Bloc 5** — Recette complète

---

## Comparaison avec Timesheets

| Dimension | Timesheets | RH Entretiens |
|---|---|---|
| API externe | Oui (BoondManager) | Non |
| Xano endpoints | 4 | 0–1 (emails) |
| Widgets React | 1 | 2 |
| Complexité état React | Grille 2D | Arbre objectifs → critères |
| RLS | Simple (Summary) | Multi-rôles (acl_viewers) |
| Effort total estimé | ~28h | ~32h |
