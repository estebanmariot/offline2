# Spec technique — Module RH : Entretiens annuels
**Version :** 1.2  
**Date :** 2026-04  
**Destinataires :** Développeur, intégrateur Grist  
**Statut :** Bloc 0 validé — Bloc 1 en cours

**Changelog v1.1 :**
- §2 `Rh_Campagnes` : ajout colonne `avec_etape_manager`
- §2 `Rh_Entretiens` : ajout colonnes `date_limite_preparation` et `date_entretien`
- §3 Workflow : conditionnel selon `avec_etape_manager`
- §5 Architecture widget : sauvegarde à la volée (debounce/onBlur) + indicateur d'état
- §6 Notifications : conditionnelles selon `avec_etape_manager`

**Changelog v1.2 :**
- §2 `Rh_Objectifs` : ajout colonne `acl_deleters` (pattern skill grist-rls)
- §4 RLS : refonte selon pattern standardisé grist-rls (colonnes acl_viewers / acl_editors / acl_deleters, règles uniformes sous forme de tableaux, masquage colonnes ACL aux non-owners)
- §5 widget : formatDate (timestamps Grist en secondes Unix), correction guard `toutReadonly` (closure stale), colonne manager masquée si `avec_etape_manager = false`
- §7 : hypothèses H24–H26 ajoutées

---

## 1. Architecture générale

### Stack
- **Base de données :** Grist (Elestio self-hosted) — source de vérité unique
- **Widget frontend :** HTML/CSS/React 18 + JSX via Babel CDN, dans le widget builder Grist
- **Logique métier :** `grist.docApi` exclusivement — pas de Xano pour la logique interne
- **Emails :** endpoint Xano `rh/send-email` — pattern réutilisé depuis le module Timesheets
- **Pas de CORS à gérer** pour les emails : même pattern existant validé

### Principe
Tout ce qui peut se gérer via l'IHM native Grist y reste. Le widget couvre uniquement l'UX complexe (formulaire d'entretien, suivi objectifs).

### Ce qui reste en IHM native Grist
- Gestion des pôles et rattachements
- Gestion des collaborateurs (admin_rh, manager, pôle)
- Création et configuration des campagnes, sections, questions
- Création des entretiens (avec dates de planification)
- Reprise des objectifs historiques
- Tableau de suivi (filtrable par pôle, statut, campagne)

---

## 2. Modèle de données

Tout dans le **même document Grist** que le module Timesheets. Préfixe `Rh_` sur toutes les tables du module (Grist capitalise automatiquement la première lettre).

### TABLE IDs confirmés
`Rh_Entretiens` `Rh_Campagnes` `Rh_Sections` `Rh_Questions` `Rh_Reponses` `Rh_Objectifs` `Rh_Criteres` `Rh_Poles`

Summary RH : `Collaborateurs_summary_admin_rh_email_manager_id_nom_complet_pole_id`

---

### Table `Rh_Poles`

| Colonne | Type | Notes |
|---|---|---|
| `nom` | Text | Ex : "Tech", "Commerce", "Support" |
| `referent_id` | Ref → Collaborateurs | 1 référent par pôle |

---

### Table `Collaborateurs` *(étendue — sans RLS)*

| Colonne | Type | Notes |
|---|---|---|
| `email` | Text | ✅ Existant |
| `boond_resource_id` | Int | ✅ Existant |
| `nom_complet` | Text | |
| `manager_id` | Ref → Collaborateurs | Self-join |
| `pole_id` | Ref → Rh_Poles | |
| `admin_rh` | Toggle | Spécifique module RH — pas de droits sur autres modules |
| `actif` | Bool | |

---

### Table `Rh_Campagnes`

| Colonne | Type | Notes |
|---|---|---|
| `nom` | Text | |
| `annee` | Int | Année de référence |
| `statut` | Choice | `brouillon` / `active` / `cloturee` |
| `date_limite_collab` | Date | |
| `date_limite_manager` | Date | |
| `avec_etape_manager` | Toggle | `true` par défaut — si `false` : workflow PLANIFIE → EN_PREP_COLLAB → VALIDE |

---

### Table `Rh_Sections`

| Colonne | Type | Notes |
|---|---|---|
| `campagne_id` | Ref → Rh_Campagnes | |
| `titre` | Text | |
| `ordre` | Int | |
| `instructions` | Text | Optionnel |
| `type` | Choice | `standard` / `objectifs` |

> Une seule section de type `objectifs` par campagne.

---

### Table `Rh_Questions`

| Colonne | Type | Notes |
|---|---|---|
| `section_id` | Ref → Rh_Sections | |
| `libelle` | Text | |
| `type` | Choice | `texte` / `note` / `texte_note` |
| `note_max` | Int | Si type contient `note` |
| `ordre` | Int | |
| `requis_collab` | Bool | |
| `requis_manager` | Bool | |

---

### Table `Rh_Entretiens`

| Colonne | Type | Notes |
|---|---|---|
| `campagne_id` | Ref → Rh_Campagnes | |
| `collaborateur_id` | Ref → Collaborateurs | |
| `manager_id` | Ref → Collaborateurs | Copié depuis `collaborateur_id.manager_id` à la création |
| `statut` | Choice | Voir §3 |
| `date_soumission_collab` | DateTime | Rempli par le widget à la transition → EN_PREP_MANAGER |
| `date_publication_manager` | DateTime | Rempli par le widget à la transition → PUBLIE |
| `date_validation_collab` | DateTime | Rempli par le widget à la transition → VALIDE |
| `date_limite_preparation` | Date | Informatif — date limite de saisie pour le collaborateur |
| `date_entretien` | Date | Informatif — date physique du rendez-vous |
| `acl_viewers` | Formule Text | Voir ci-dessous |

**Formule `acl_viewers` :**
```python
",".join(filter(None, [
  $collaborateur_id.email,
  $manager_id.email,
  $collaborateur_id.pole_id.referent_id.email
]))
```
✅ Refs chaînées 3 niveaux validées en Bloc 0.

---

### Table `Rh_Reponses`

| Colonne | Type | Notes |
|---|---|---|
| `entretien_id` | Ref → Rh_Entretiens | |
| `question_id` | Ref → Rh_Questions | |
| `auteur` | Choice | `collaborateur` / `manager` |
| `valeur_texte` | Text | |
| `valeur_note` | Int | |

---

### Table `Rh_Objectifs`

| Colonne | Type | Notes |
|---|---|---|
| `collaborateur_id` | Ref → Collaborateurs | |
| `annee` | Int | Année calendaire |
| `titre` | Text | |
| `statut` | Choice | `realisable` / `a_risque` |
| `pct_avancement_collab` | Int | 0–100 — plancher = max(seuil_pct critères cochés collab) |
| `pct_avancement_manager` | Int | 0–100 — plancher = max(seuil_pct critères cochés manager) |
| `commentaire_collab` | Text | |
| `commentaire_manager` | Text | |
| `ordre` | Int | |
| `acl_viewers` | Formule Text | Collab + manager + référent pôle |
| `acl_editors` | Formule Text | Manager + référent pôle (sans le collab) |
| `acl_deleters` | Formule Text | Identique à `acl_editors` — séparé pour conformité pattern grist-rls |

**Formule `acl_viewers` :**
```python
",".join(filter(None, [
  $collaborateur_id.email,
  $collaborateur_id.manager_id.email,
  $collaborateur_id.pole_id.referent_id.email
]))
```

**Formule `acl_editors` :**
```python
",".join(filter(None, [
  $collaborateur_id.manager_id.email,
  $collaborateur_id.pole_id.referent_id.email
]))
```

**Formule `acl_deleters` :** *(identique à `acl_editors`)*
```python
",".join(filter(None, [
  $collaborateur_id.manager_id.email,
  $collaborateur_id.pole_id.referent_id.email
]))
```

---

### Table `Rh_Criteres`

| Colonne | Type | Notes |
|---|---|---|
| `objectif_id` | Ref → Rh_Objectifs | |
| `libelle` | Text | |
| `seuil_pct` | Int | % cible |
| `atteint_collab` | Bool | |
| `atteint_manager` | Bool | |
| `ordre` | Int | |

> Pas de colonnes ACL propres — droits hérités via chaînage `objectif_id` dans les règles RLS.

---

## 3. Workflow — Statuts d'un entretien

**Avec étape manager (`avec_etape_manager = true`, défaut) :**
```
PLANIFIE → EN_PREP_COLLAB → EN_PREP_MANAGER → PUBLIE → VALIDE
```

**Sans étape manager (`avec_etape_manager = false`) :**
```
PLANIFIE → EN_PREP_COLLAB → VALIDE
```

> Le statut `SOUMIS` a été supprimé — la transition collab → manager est directe.

| Statut | Qui agit | Action widget |
|---|---|---|
| `PLANIFIE` | admin_rh (IHM Grist) | Déclenche notification email collab |
| `EN_PREP_COLLAB` | Collaborateur | Saisit, sauvegarde à la volée, soumet → `EN_PREP_MANAGER` (ou `VALIDE` si sans étape manager) |
| `EN_PREP_MANAGER` | Manager | *(si avec étape manager)* Lit réponses collab, saisit sa partie, publie → `PUBLIE` |
| `PUBLIE` | Collaborateur | *(si avec étape manager)* Consulte entretien complet, valide → `VALIDE` |
| `VALIDE` | — | Lecture seule définitive |

**Logique de soumission collab dans le widget :**
```javascript
const avecManager = campagne.avec_etape_manager !== false; // true par défaut si absent
const prochainStatut = avecManager ? 'EN_PREP_MANAGER' : 'VALIDE';
// email manager envoyé uniquement si avecManager
```

**Règles métier :**
- Sauvegarde à la volée : `UpdateRecord` sur `Rh_Reponses` sans changement de statut (voir §5)
- Collab bloqué en lecture dès `EN_PREP_MANAGER`
- Manager bloqué en lecture dès `PUBLIE`
- Sections/questions gelées dès que campagne passe à `active`
- Objectifs modifiables indépendamment du statut entretien

**Champs de date mis à jour par le widget :**
- Soumission collab → `date_soumission_collab = now()` (uniquement si `avec_etape_manager`)
- Publication manager → `date_publication_manager = now()`
- Validation collab → `date_validation_collab = now()`

---

## 4. Stratégie RLS

Pattern standardisé issu du skill **grist-rls**. Chaque table soumise à RLS expose des colonnes formule `acl_viewers`, `acl_editors`, `acl_deleters`. La logique métier est centralisée dans ces formules ; les règles Access Rules sont uniformes sur toutes les tables.

### Propriété d'appairage utilisateur
```
Dans Access Rules → User Attributes :
  NAME : collab
  PROPRIÉTÉ D'APPAIRAGE : user.Email
  TABLE D'APPAIRAGE : Collaborateurs
  COLONNE CIBLE : email
→ Expose user.collab.admin_rh dans toutes les règles RLS
```
✅ Validé en Bloc 0.

### Table Summary RH
```
Collaborateurs [by email, nom_complet, manager_id, pole_id, admin_rh]
  RLS : user.Email == rec.email or user.collab.admin_rh
```
✅ Validé en Bloc 0.

---

### Pattern de règles Access Rules (toutes les tables RLS)

**Étape 1 — Protéger les colonnes ACL (`acl_viewers`, `acl_editors`, `acl_deleters`) :**

| Condition | R | U |
|---|---|---|
| `user.Access in [OWNER]` | ✅ | ✅ |
| Tous les autres | ✗ | ✗ |

> Les colonnes ACL sont invisibles pour tous les non-propriétaires — un utilisateur ne peut pas connaître la liste des autres ayant accès à une ligne.

**Étape 2 — Règles sur toutes les colonnes de la table :**

| Condition | R | U | C | D |
|---|---|---|---|---|
| `user.Access in [OWNER]` | ✅ | ✅ | ✅ | ✅ |
| `user.collab.admin_rh` | ✅ | ✅ | ✅ | ✅ |
| `user.Email in newRec.acl_viewers` | | | ✅ | |
| `user.Email in rec.acl_editors` | | ✅ | | |
| `user.Email in rec.acl_deleters` | | | | ✅ |
| `user.Email in rec.acl_viewers` | ✅ | | | |
| Tous les autres | ✗ | ✗ | ✗ | ✗ |

> **Deny by default** : la ligne "Tous les autres → RUCD✗" est obligatoire.

---

### RLS `Rh_Entretiens`

Pas de suppression via le widget — `acl_deleters` non nécessaire.

**Colonnes ACL :** `acl_viewers` uniquement (formule — voir §2).

| Condition | R | U | C | D |
|---|---|---|---|---|
| `user.Access in [OWNER]` | ✅ | ✅ | ✅ | ✅ |
| `user.collab.admin_rh` | ✅ | ✅ | ✅ | ✅ |
| `user.Email in rec.acl_viewers` | ✅ | ✅ | | |
| Tous les autres | ✗ | ✗ | ✗ | ✗ |

> U accordé aux viewers car le widget met à jour `statut` et les dates de transition — toujours depuis un utilisateur dans `acl_viewers`. C et D réservés à l'IHM native / admin.

---

### RLS `Rh_Objectifs`

**Colonnes ACL :** `acl_viewers`, `acl_editors`, `acl_deleters` (formules — voir §2).

| Condition | R | U | C | D |
|---|---|---|---|---|
| `user.Access in [OWNER]` | ✅ | ✅ | ✅ | ✅ |
| `user.collab.admin_rh` | ✅ | ✅ | ✅ | ✅ |
| `user.Email in newRec.acl_viewers` | | | ✅ | |
| `user.Email in rec.acl_editors` | | ✅ | | |
| `user.Email in rec.acl_deleters` | | | | ✅ |
| `user.Email in rec.acl_viewers` | ✅ | | | |
| Tous les autres | ✗ | ✗ | ✗ | ✗ |

> `newRec.acl_viewers` évalué par Grist sur colonne formule lors d'un `AllowCreate`. ✅ Validé en Bloc 1.

---

### RLS `Rh_Criteres`

Pas de colonnes ACL propres — droits hérités via chaînage `objectif_id`.

| Condition | R | U | C | D |
|---|---|---|---|---|
| `user.Access in [OWNER]` | ✅ | ✅ | ✅ | ✅ |
| `user.collab.admin_rh` | ✅ | ✅ | ✅ | ✅ |
| `user.Email in newRec.objectif_id.acl_viewers` | | | ✅ | |
| `user.Email in rec.objectif_id.acl_editors` | | ✅ | | |
| `user.Email in rec.objectif_id.acl_deleters` | | | | ✅ |
| `user.Email in rec.objectif_id.acl_viewers` | ✅ | | | |
| Tous les autres | ✗ | ✗ | ✗ | ✗ |

---

### RLS tables de configuration — lecture ouverte, écriture admin uniquement

| Table | AllowRead | AllowCreate / Update / Delete |
|---|---|---|
| `Rh_Campagnes` | Tous utilisateurs authentifiés (`True`) | Admin RH / owner Grist |
| `Rh_Sections` | Tous utilisateurs authentifiés (`True`) | Admin RH / owner Grist |
| `Rh_Questions` | Tous utilisateurs authentifiés (`True`) | Admin RH / owner Grist |
| `Rh_Poles` | Tous utilisateurs authentifiés (`True`) | Admin RH / owner Grist |

> Ces tables ne contiennent pas de données personnelles. La lecture ouverte est nécessaire pour que le widget charge sections et questions via `fetchTable`. ✅ Validé Bloc 0.

**Notes générales :**
- `.split(",")` non nécessaire — Grist gère nativement le `in` sur une colonne texte CSV. ✅ Validé.
- `fetchTable` respecte la RLS : retourne uniquement les lignes autorisées.
- Réserver le statut Owner Grist aux super admins techniques — les owners voient tout, RLS ignorée.
- Un editor doit toujours être dans `acl_viewers` — si ce n'est pas le cas, corriger la formule `acl_viewers`, pas les règles RLS.

---

## 5. Architecture widget

### Initialisation
Le widget est lié à la **Summary RH**. L'ID de la Summary ≠ ID de `Collaborateurs` — lookup obligatoire par email :

```javascript
grist.ready({ requiredAccess: 'full' });
grist.onRecords(async (records) => {
  const profil = records[0]; // email fiable, ID non fiable
  const rowsCo = toRows(await grist.docApi.fetchTable('Collaborateurs'));
  const moiCollab = rowsCo.find(c => c.email === profil.email);
  const moiId = moiCollab?.id; // vrai ID utilisé dans manager_id / collaborateur_id
});
```

### Détection du rôle dans le contexte d'un entretien
```javascript
const roleEntretien = !entretien ? null
  : entretien.collaborateur_id === moiId ? 'collaborateur'
  : entretien.manager_id === moiId       ? 'manager'
  : 'lecteur';

const estManager = entretiens.some(e => e.manager_id === moiId && e.collaborateur_id !== moiId);
```

### Affichage des dates de planification
Grist stocke les dates en **secondes Unix**. Conversion obligatoire avant affichage :
```javascript
const formatDate = (ts) => {
  if(!ts) return null;
  return new Date(ts * 1000).toLocaleDateString('fr-FR', {day:'2-digit', month:'long', year:'numeric'});
};
```
`date_entretien` et `date_limite_preparation` affichées dans l'en-tête du formulaire, conditionnellement si non nulles.

### Workflow conditionnel `avec_etape_manager`
```javascript
// Déclaré dans le scope du bloc formulaire
const avecManager = campagne?.avec_etape_manager !== false; // true par défaut si absent

// Colonne manager masquée si sans étape manager
<div className={avecManager ? 'q-cols' : ''}>
  <div>/* colonne collaborateur */</div>
  {avecManager && <div>/* colonne manager */</div>}
</div>
```

### Sauvegarde à la volée

Aucun bouton de sauvegarde explicite. Deux mécanismes selon le type de champ :

**Champs texte — debounce 800ms :**
```javascript
const debounceTimers = useRef({});

const handleTextChange = (entretien, auteur, q, val, suffix) => {
  setRep(entretien.id, q.id, auteur, val, suffix);
  const key = `${entretien.id}_${q.id}_${auteur}_${suffix}`;
  clearTimeout(debounceTimers.current[key]);
  debounceTimers.current[key] = setTimeout(() => {
    setReponses(prev => {
      sauvReponseUnitaire(entretien, auteur, q, {...prev, [key]: val});
      return prev;
    });
  }, 800);
};
```

**Champs note — onBlur immédiat :**
```javascript
const handleNoteBlur = (entretien, auteur, q, reponsesSnap) => {
  sauvReponseUnitaire(entretien, auteur, q, reponsesSnap);
};
```

**Sauvegarde unitaire :**
```javascript
const sauvReponseUnitaire = async (entretien, auteur, q, reponsesSnap) => {
  if(!entretien) return;
  // ⚠️ Ne pas utiliser toutReadonly ici — closure stale dans le debounce.
  // Les champs sont déjà disabled côté React. La RLS Grist est le vrai verrou.
  setSaveStatus('saving');
  try {
    // UpdateRecord si existId, sinon AddRecord
    // Si AddRecord → mettre à jour repIds avec le nouvel ID retourné
    setSaveOk(); // 'saved' pendant 2s puis 'idle'
  } catch(e) { setSaveStatus('error'); }
};
```

**Indicateur d'état (footer formulaire) :**
```
idle   → rien affiché
saving → ↻ Enregistrement…
saved  → ✓ Enregistré (disparaît après 2s)
error  → ⚠ Erreur
```

> La sauvegarde globale `sauvegarder()` est conservée en filet de sécurité, appelée avant chaque transition de statut.

### Visibilité bouton ✕ (supprimer objectif/critère)
```javascript
const peutEditer = (obj) => {
  if(!moi?.email) return false;
  return moiAdminRh || (obj.acl_editors || '').split(',').map(e => e.trim()).includes(moi.email);
};
```
> La RLS Grist est le vrai verrou. Le widget est cohérent mais non souverain.

### Suppression objectif (cascade manuelle)
Grist ne gère pas la cascade. Supprimer un objectif nécessite de supprimer d'abord ses critères :
```javascript
const actions = [
  ...criteres.filter(c => c.objectif_id === obj.id).map(c => ['RemoveRecord', 'Rh_Criteres', c.id]),
  ['RemoveRecord', 'Rh_Objectifs', obj.id],
];
await grist.docApi.applyUserActions(actions);
```

### Gestion types de questions (`texte_note`)
```javascript
const types    = q.type ? q.type.split('_') : ['texte'];
const hasTexte = types.includes('texte');
const hasNote  = types.includes('note');
const both     = hasTexte && hasNote;
const keyTxt  = both ? `${base}_texte` : base;
const keyNote = both ? `${base}_note`  : base;
```

### Logique plancher %
```javascript
const calcPlancher = (criteres, champ) => {
  const coches = criteres.filter(c => c[champ]);
  return coches.length ? Math.max(...coches.map(c => c.seuil_pct)) : 0;
};
// champ = 'atteint_collab' ou 'atteint_manager'
```

---

## 6. Notifications email

Endpoint Xano `rh/send-email` — même pattern que le module Timesheets.

| Événement (statut) | Destinataire | Objet | Condition |
|---|---|---|---|
| → `EN_PREP_COLLAB` | Collaborateur | "Votre entretien annuel est ouvert" | Toujours |
| → `EN_PREP_MANAGER` | Manager | "[Prénom Nom] a soumis son entretien" | Si `avec_etape_manager` |
| → `PUBLIE` | Collaborateur | "Votre entretien a été publié — à valider" | Si `avec_etape_manager` |

---

## 7. Hypothèses validées

| # | Hypothèse | Statut |
|---|---|---|
| H1 | Section `objectifs` unique par campagne | ✅ |
| H2 | Un collaborateur a un seul manager à un instant T | ✅ |
| H3 | Emails via endpoint Xano `rh/send-email` | ✅ pattern connu |
| H4 | `grist.docApi` écriture depuis widget `full` | ✅ |
| H5 | % d'avancement affiché sur N-1 et N uniquement | ✅ |
| H6 | Reprise données historiques : saisie IHM Grist native | ✅ |
| H7 | `atteint_collab` / `atteint_manager` champs distincts | ✅ |
| H8 | Plancher % = max(seuil_pct critères cochés par l'auteur) | ✅ |
| H9 | Objectifs sans champ `description` | ✅ |
| H10 | Manager : voit ses directs + peut créer/modifier/supprimer objectifs | ✅ |
| H11 | Table Summary pour RLS Timesheets | ✅ validé production |
| H12 | Table Summary RH `[by email, nom_complet, manager_id, pole_id, admin_rh]` | ✅ validé Bloc 0 |
| H13 | Propriété d'appairage `user.collab` → `user.collab.admin_rh` dans RLS | ✅ validé Bloc 0 |
| H14 | Refs chaînées 3 niveaux dans formule `acl_viewers` | ✅ validé Bloc 0 |
| H15 | `user.Email in rec.acl_viewers` sans `.split()` | ✅ validé Bloc 0 |
| H16 | 1 seul référent par pôle | ✅ |
| H17 | `admin_rh` spécifique module RH — pas de droits sur autres modules | ✅ |
| H18 | `newRec.acl_viewers` évalué sur colonne formule lors d'un `AllowCreate` | ✅ validé Bloc 1 |
| H19 | Collab peut créer des objectifs mais pas les modifier/supprimer | ✅ par design |
| H20 | Suppression objectif = cascade manuelle des critères liés | ✅ implémenté widget |
| H21 | `avec_etape_manager` conditionne le workflow, les notifications et l'affichage colonne manager | ✅ validé v1.3 |
| H22 | `date_limite_preparation` et `date_entretien` : informatifs, sans effet bloquant | ✅ par design |
| H23 | Sauvegarde à la volée : debounce 800ms (texte) + onBlur (note) | ✅ validé v1.3 |
| H24 | Dates Grist stockées en secondes Unix — conversion `ts * 1000` avant affichage | ✅ validé v1.3 |
| H25 | Guard `toutReadonly` invalide dans `sauvReponseUnitaire` — closure stale dans debounce | ✅ corrigé v1.3 — RLS Grist est le vrai verrou |
| H26 | Pattern RLS grist-rls : `acl_viewers` / `acl_editors` / `acl_deleters` séparés, colonnes ACL masquées aux non-owners | ✅ appliqué v1.2 |
