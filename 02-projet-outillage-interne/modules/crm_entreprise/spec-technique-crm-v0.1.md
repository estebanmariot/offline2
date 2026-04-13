# Spec technique — CRM Interne v2.2
**Destinataires :** Développeur, intégrateur

---

## Architecture générale

**Stack :** Grist (Elestio self-hosted) + React 18 + Babel CDN + Chart.js 4

**Principes :**
- Grist est la source de vérité absolue — aucune donnée stockée ailleurs
- Pas de Xano — CRM 100% Grist natif
- Widget unique SPA — remplace toutes les vues Grist natives
- CRUD via `grist.docApi.applyUserActions` uniquement
- Resync complet après chaque action — jamais de mise à jour optimiste
- Document Grist dédié, séparé du document Timesheets

**Structure widget builder :**
- Tout le code dans l'onglet HTML (styles + JSX + scripts)
- Onglet JS laissé vide (incompatible Babel)
- `<script type="text/babel">` obligatoire pour JSX
- `requiredAccess: 'full'` — nécessaire pour `docApi`

---

## Modèle de données

> **Convention :** les noms de tables et colonnes sont ceux du document Grist réel — tout en minuscules.

### Table `Utilisateurs`

| Colonne | Type Grist | colRef | Notes |
|---|---|---|---|
| email | Text | 2 | Email Grist — clé RLS |
| nom | Text | 3 | Nom affiché |
| role | Choice | 4 | `admin`, `commercial` |
| user_id | Formule (Any) | 56 | `$id` — expose l'id de ligne, utilisé par la summary |

**Table summary associée :** `Utilisateurs_summary_email_nom_role_user_id`
- Colonnes : `email`, `nom`, `role`, `user_id`, `group` (RefList), `count`
- C'est cette table summary qui est liée au widget (voir §Architecture widget)
- RLS sur la summary : `user.Email == rec.email` → `+R-CUD`

---

### Table `Comptes`

| Colonne | Type Grist | colRef | Obligatoire | Notes |
|---|---|---|---|---|
| nom | Text | 6 | Oui | Raison sociale |
| secteur | Choice | 7 | Non | IT, Finance, Industrie, Santé, Retail, Éducation, Autre |
| taille | Choice | 8 | Non | TPE, PME, ETI, Grand compte |
| adresse | Text | 9 | Non | |
| ville | Text | 10 | Non | |
| code_postal | Text | 11 | Non | |
| ca_potentiel | Numeric | 12 | Non | Format monnaie € |
| notes | Text | 13 | Non | |
| date_creation | Date | 14 | Oui | DEFAULT `today()` |

---

### Table `Contacts`

| Colonne | Type Grist | colRef | Obligatoire | Notes |
|---|---|---|---|---|
| prenom | Text | 16 | Oui | |
| nom | Text | 17 | Oui | |
| fonction | Text | 18 | Non | |
| email | Text | 19 | Non | |
| telephone | Text | 20 | Non | |
| compte | Ref:Comptes | 21 | Oui | displayCol=22, visibleCol=6 (affiche `nom`) |
| notes | Text | 23 | Non | |
| date_creation | Date | 24 | Oui | DEFAULT `today()` |

---

### Table `Opportunites`

| Colonne | Type Grist | colRef | Obligatoire | Notes |
|---|---|---|---|---|
| titre | Text | 26 | Oui | |
| compte | Ref:Comptes | 27 | Oui | displayCol=29, visibleCol=6 (affiche `nom`) |
| responsable | Ref:Utilisateurs | 28 | Oui | displayCol=30, visibleCol=3 (affiche `nom`) — clé du contrôle d'édition |
| statut | Choice | 31 | Oui | Picklist ordonnée — voir §Workflow |
| amount | Numeric | 32 | Non | Montant global € |
| montant_n | Numeric | 33 | Non | Part facturable année en cours € |
| montant_n1 | Numeric | 34 | Non | Part facturable année suivante € |
| duree_mission | Choice | 35 | Non | 3 mois, 6 mois, 12 mois, >12 mois |
| date_ouverture | Date | 36 | Oui | DEFAULT `today()` |
| date_cloture | Date | 37 | Non | Estimée |
| raison_perte | Text | 38 | Conditionnel | Obligatoire si statut = `Closed Lost` |
| notes | Text | 39 | Non | |

---

### Table `Activites`

| Colonne | Type Grist | colRef | Obligatoire | Notes |
|---|---|---|---|---|
| date | DateTime:Europe/Paris | 41 | Oui | Format `YYYY-MM-DD h:mma` — horodatage complet |
| type | Choice | 42 | Oui | Appel, Email, RDV, Relance, Autre |
| commentaire | Text | 43 | Non | |
| compte | Ref:Comptes | 44 | Auto | **Formule** : `$opportunite.compte` — non saisie, déduite de l'opportunité |
| opportunite | Ref:Opportunites | 46 | Non | displayCol=47, visibleCol=26 |
| auteur | Ref:Utilisateurs | 48 | Oui | displayCol=49, visibleCol=2 (affiche `email`) |

> **Important :** `Activites.compte` est une colonne formule (`$opportunite.compte`). Le widget ne doit **pas** envoyer ce champ dans `applyUserActions` — Grist le calcule automatiquement.

---

## Relations

- `Comptes` 1:N `Contacts` via `Contacts.compte`
- `Comptes` 1:N `Opportunites` via `Opportunites.compte`
- `Opportunites` 1:N `Activites` via `Activites.opportunite`
- `Activites.compte` est calculé automatiquement via `$opportunite.compte`

---

## Workflow — Statuts

Picklist ordonnée sur `Opportunites.statut` (colRef 31). Valeurs exactes :

| # | Valeur | Couleur Grist |
|---|---|---|
| 0 | `None` | Gris |
| 1 | `Qualification` | Bleu clair |
| 2 | `Découverte` | Bleu |
| 3 | `Solution` | Bleu |
| 4 | `Proposition` | Orange |
| 5 | `Négociation` | Orange |
| 6 | `Closing` | Orange |
| 7 | `Commit` | Vert |
| ✓ | `Closed Won` | Vert foncé |
| ✗ | `Closed Lost` | Rouge |

**Opportunités ouvertes** (dashboard) = `statut NOT IN ['Closed Won', 'Closed Lost']`

**Règle Closed Lost côté widget :**
```javascript
if (fields.statut === 'Closed Lost' && !fields.raison_perte?.trim()) {
  return showToast('err', 'Raison de perte obligatoire pour Closed Lost');
}
```

---

## Stratégie RLS

### RLS réelle en production

**Règle globale :**
```
user.Access != OWNER → -S
```
Les non-owners ne peuvent pas modifier la structure du document.

**Seed rules (acl_viewers / acl_editors / acl_deletors) :**

| Condition | Permissions |
|---|---|
| `user.Access in [OWNER]` | +CRUD |
| `user.Email in newRec.acl_viewers` | +D |
| `user.Email in rec.acl_editors` | +U |
| `user.Email in rec.acl_deletors` | +R |
| _(défaut)_ | -CRUD |

> **Note orthographique :** Grist utilise `acl_deletors` (pas `acl_deleters`).

**Table `Utilisateurs_summary_email_nom_role_user_id` :**

| Condition | Permissions |
|---|---|
| `user.Email == rec.email` | +R-CUD |
| _(défaut)_ | -CRUD |

→ Chaque utilisateur ne voit que sa propre ligne dans la summary. Les owners voient tout.

### Contrôle d'édition Opportunites (v1 — porté par le widget)

Pas de RLS Grist sur `Opportunites` en v1. Le contrôle est dans le widget :

```javascript
// user_id dans la summary correspond à l'id de ligne dans Utilisateurs
const peutEditer = (opp) =>
  currentUser?.role === 'admin' || opp.responsable === currentUser?.user_id;
```

Les boutons Modifier et Supprimer sont masqués si `peutEditer(opp)` retourne `false`.

---

## Architecture widget

### Table source

Le widget est lié à **`Utilisateurs_summary_email_nom_role_user_id`** (pas à `Utilisateurs` directement). La RLS filtre automatiquement la ligne de l'utilisateur connecté.

```javascript
grist.ready({ requiredAccess: 'full', allowSelectBy: true });

grist.onRecords(records => {
  if (records?.length > 0) {
    const moi = records[0];
    // user_id = id de la ligne dans Utilisateurs (pour comparer avec opp.responsable)
    setCurrentUser({
      user_id: moi.user_id,
      email:   moi.email,
      nom:     moi.nom,
      role:    moi.role,
    });
  }
  loadAll();
});
```

### Chargement multi-table

```javascript
const loadAll = async () => {
  setLoading(true);
  const [u, c, ct, o, a] = await Promise.all([
    grist.docApi.fetchTable('Utilisateurs'),
    grist.docApi.fetchTable('Comptes'),
    grist.docApi.fetchTable('Contacts'),
    grist.docApi.fetchTable('Opportunites'),
    grist.docApi.fetchTable('Activites'),
  ]);
  setUtilisateurs(toRows(u));
  setComptes(toRows(c));
  setContacts(toRows(ct));
  setOpps(toRows(o));
  setActivites(toRows(a));
  setLoading(false);
};
```

Conversion columnar → tableau d'objets :

```javascript
const toRows = data => {
  const keys = Object.keys(data).filter(k => k !== 'id');
  const ids = data.id || [];
  return ids.map((id, i) =>
    Object.fromEntries([['id', id], ...keys.map(k => [k, data[k][i]])])
  );
};
```

### CRUD — noms de colonnes exacts

```javascript
// Créer une opportunité
await grist.docApi.applyUserActions([['AddRecord', 'Opportunites', null, {
  titre: '...', compte: 1, responsable: 2, statut: 'Qualification',
  amount: null, montant_n: null, montant_n1: null,
}]]);

// Créer une activité — NE PAS envoyer "compte" (formule auto)
await grist.docApi.applyUserActions([['AddRecord', 'Activites', null, {
  date: Math.floor(Date.now() / 1000), // timestamp Unix pour DateTime
  type: 'Appel',
  commentaire: '...',
  opportunite: 3,
  auteur: 1,
  // ⚠️ "compte" omis — calculé automatiquement par Grist
}]]);
```

### État global React

```javascript
const [currentUser, setCurrentUser] = useState(null); // { user_id, email, nom, role }
const [utilisateurs, setUtilisateurs] = useState([]);
const [comptes, setComptes]   = useState([]);
const [contacts, setContacts] = useState([]);
const [opps, setOpps]         = useState([]);
const [activites, setActivites] = useState([]);
const [loading, setLoading]   = useState(true);
const [tab, setTab]           = useState('comptes');
const [drawer, setDrawer]     = useState(null); // { mode: 'view'|'edit'|'new', entity, record }
const [modal, setModal]       = useState(null); // { entity, record }
const [toast, setToast]       = useState(null); // { type: 'ok'|'err', msg }
```

### Contrôle d'édition

```javascript
// Comparaison par user_id (id Grist) — pas par email
const peutEditer = (opp) =>
  currentUser?.role === 'admin' || opp.responsable === currentUser?.user_id;
```

### Dashboard KPI — calculs

| KPI | Calcul |
|---|---|
| Nb comptes | `comptes.length` |
| Opps ouvertes | `opps.filter(o => !['Closed Won','Closed Lost'].includes(o.statut)).length` |
| Pipeline total | `sum(amount)` sur opps ouvertes |
| Pipeline N | `sum(montant_n)` sur opps ouvertes |
| Pipeline N+1 | `sum(montant_n1)` sur opps ouvertes |
| Taux conversion | `Closed Won / (Closed Won + Closed Lost) * 100` |
| Donut statuts | `groupBy(statut).count` — Chart.js `doughnut` |
| Top comptes | `join compte → groupBy nom → sum(amount).top10` — Chart.js `bar` horizontal |

---

## Hypothèses validées

| # | Hypothèse | Statut |
|---|---|---|
| H-01 | 1 admin + N commerciaux | ✅ Validé |
| H-02 | Périmètre édition = opportunités dont on est responsable (par user_id) | ✅ Validé |
| H-03 | Contrôle d'édition porté par le widget en v1 | ✅ Validé |
| H-04 | Les 10 statuts pipeline correspondent à Salesforce | ✅ Validé |
| H-05 | Raison de perte = texte libre | ✅ Validé |
| H-06 | Table source widget = summary `Utilisateurs_summary_email_nom_role_user_id` | ✅ Validé |
| H-07 | `Activites.compte` est une formule auto — non saisie dans le widget | ✅ Validé |
| H-08 | `grist.docApi.fetchTable` disponible avec `requiredAccess: 'full'` | ⏳ À tester |
| H-09 | Lecture multi-table (5 tables) possible au chargement | ⏳ À tester |
| H-10 | Valeurs Durée mission : 3 mois, 6 mois, 12 mois, >12 mois | ✅ Validé (schéma réel) |
| H-11 | Export Salesforce de qualité suffisante pour import direct | ⏳ À tester |
