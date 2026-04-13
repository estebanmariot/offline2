---
name: grist-widget
description: "Patterns validés pour développer des custom widgets dans Grist (self-hosted Elestio). Utiliser dès qu'il s'agit de créer, modifier ou déboguer un widget custom Grist — initialisation, React/JSX, communication avec l'API Grist, RLS, gestion utilisateur, appels API externes depuis le widget. Inclut toutes les limitations connues et leurs contournements validés en production."
---

# Grist Widget — Patterns validés

## Stack technique

- React 18 + JSX via CDN Babel standalone ✅ confirmé
- Tout dans l'onglet HTML — onglet JS non compatible Babel
- `<script type="text/babel">` obligatoire pour JSX

```html
<script src="https://docs.getgrist.com/grist-plugin-api.js"></script>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

---

## Initialisation standard

```javascript
grist.ready({ requiredAccess: 'full' });

// onRecords → déclenché au chargement, retourne tableau de lignes
grist.onRecords(async (records) => {
  // records = lignes de la table source du widget (filtrées par RLS)
});

// onRecord → déclenché sur clic dans une vue liée, retourne 1 enregistrement
grist.onRecord(async (record) => {
  // record = ligne sélectionnée
});
// Utiliser les deux en combinaison pour couvrir tous les cas
```

---

## Helper toRows — indispensable

`fetchTable` retourne un objet "columnar" (une clé par colonne, valeur = tableau) — pas un tableau de lignes.

```javascript
const toRows = (table) => {
  const ids = table.id || [];
  return ids.map((id, i) => {
    const row = { id };
    Object.keys(table).forEach(k => { if (k !== 'id') row[k] = table[k][i]; });
    return row;
  });
};
```

---

## Lecture de données

```javascript
// Lire une table (respecte la RLS de l'utilisateur connecté)
const tRows = toRows(await grist.docApi.fetchTable('NomTable'));

// ⚠️ fetchTable respecte la RLS : retourne uniquement les lignes autorisées
// Seuls les owners Grist voient tout — réserver ce statut aux super admins techniques
```

---

## Écriture depuis widget via grist.docApi

```javascript
// INSERT
await grist.docApi.applyUserActions([
  ['AddRecord', 'NomTable', null, { champ1: val1, champ2: val2 }]
]);

// UPDATE
await grist.docApi.applyUserActions([
  ['UpdateRecord', 'NomTable', id, { champ1: val1 }]
]);

// Toujours re-fetcher après écriture — jamais de mise à jour optimiste
const tRows = toRows(await grist.docApi.fetchTable('NomTable'));
setData(tRows);
```

---

## Identification de l'utilisateur connecté

Le pattern recommandé est d'exposer l'ID de la table source directement dans la Summary via une **colonne formule** :

```python
# Colonne formule `user_id` dans la table Summary (Grist) :
$colonneRefVersTableSource.id
# Exemple : $email_ref.id  ou  $collab_ref.id
```

Cela évite de charger toute la table source juste pour résoudre l'ID.

```javascript
// Dans le widget — records[0].user_id contient le vrai ID de la table source
grist.onRecords(async (records) => {
  const profil = records[0];
  const moiId = profil.user_id; // ID fiable via colonne formule Summary
});
```

**Si la colonne `user_id` n'est pas disponible dans la Summary**, fallback par lookup :

```javascript
grist.onRecords(async (records) => {
  const profil = records[0]; // email fiable via RLS, mais records[0].id ≠ ID table source
  const rowsCo = toRows(await grist.docApi.fetchTable('Collaborateurs'));
  const moi = rowsCo.find(c => c.email === profil.email);
  const moiId = moi?.id;
});
```

> ⚠️ **CRITIQUE — IDs Summary ≠ IDs table source** : les IDs d'une Summary sont auto-incrémentés indépendamment de la table source. Ne jamais utiliser `records[0].id` directement pour des lookups dans d'autres tables.

---

## Champs auto-générés sur colonnes Ref

Grist génère automatiquement `gristHelper_Display`, `gristHelper_Display2`, `gristHelper_Display3`... sur les colonnes Ref pour stocker le label affiché.

```javascript
// Récupérer un nom sans charger toute la table référencée
const nomCollab = entretien.gristHelper_Display3 || `Collab #${entretien.collaborateur_id}`;
```

---

## Nommage des tables Grist

- Grist capitalise automatiquement la première lettre des noms de tables à l'import
- `rh_entretiens` → TABLE ID = `Rh_entretiens`
- Toujours vérifier le TABLE ID exact dans **Données sources** avant de l'utiliser dans `fetchTable`

---

## Patterns React courants

### Resync après action
```javascript
await load(); // après save, create — pas de mise à jour optimiste
```

### Rechargement forcé d'un composant
```javascript
const [listKey, setListKey] = useState(0);
setListKey(k => k + 1);
<MonComposant key={listKey} ... />
```

### Toast feedback
```javascript
const showToast = (type, msg) => {
  setToast({ type, msg });
  if (toastTimer.current) clearTimeout(toastTimer.current);
  toastTimer.current = setTimeout(() => setToast(null), 3000);
};
// type : 'ok' | 'err' | 'warn'
```

### Structure état objet indexé (accès O(1))
```javascript
const [items, setItems] = useState({});
// Structure : { [item_id]: { ...item, enfants: [...] } }
// Avantage : mise à jour partielle sans reconstruire tout le tableau
```

---

## Limitations connues

| Limitation | Contournement |
|---|---|
| `grist.docApi.getUser()` non disponible dans les widgets | Utiliser table Summary avec RLS `user.Email == email` |
| `user.Email` disponible dans Access Rules uniquement | Idem — via Summary |
| Appel API REST Grist depuis widget → bloqué CORS (origin gristlabs.github.io) | Passer par Xano ou proxy |
| `grist.onRecords` sans `tableId` lit uniquement la table source du widget | Utiliser `fetchTable` pour les autres tables |
| IDs Summary ≠ IDs table source | Toujours lookup par email ou clé métier |

---

## RLS — patterns validés

### Pattern simple (1 utilisateur = 1 ligne)
```python
user.Email == rec.email
```

### Pattern Summary pour RLS différentes sur même table source
```
Table source Collaborateurs → pas de RLS → référentiel commun

Summary [by email, boond_resource_id]
  → RLS module A : user.Email == rec.email

Summary [by email, nom_complet, manager_id]
  → RLS module B : user.Email == rec.email
```
✅ Validé en production.

### Pattern propriété d'appairage (user attributes)
```
Dans Access Rules → User Attributes :
  NAME : collab
  PROPRIÉTÉ D'APPAIRAGE : user.Email
  TABLE D'APPAIRAGE : Collaborateurs
  COLONNE CIBLE : email

→ Permet d'utiliser user.collab.admin_rh dans toutes les règles RLS
```
✅ Validé en production.

### Pattern acl_viewers (multi-rôles implicites)
```python
# Colonne calculée acl_viewers :
",".join(filter(None, [
  $champ_ref_1.email,
  $champ_ref_2.email,
  $champ_ref_3.ref_chainee.email   # refs chaînées 3 niveaux supportées
]))

# Règle RLS :
user.Email in rec.acl_viewers or user.collab.admin_rh
# ✅ .split(",") non nécessaire — Grist gère nativement le "in" sur texte CSV
```

### Pattern acl_editors (lecture vs écriture différenciée)
```python
# Règles RLS différenciées :
AllowCreate: user.Email in newRec.acl_viewers or user.collab.admin_rh
AllowRead:   user.Email in rec.acl_viewers or user.collab.admin_rh
AllowUpdate: user.Email in rec.acl_editors or user.collab.admin_rh
AllowDelete: user.Email in rec.acl_editors or user.collab.admin_rh

# RLS par chaînage sur table enfant (sans colonnes ACL propres) :
AllowRead:   user.Email in rec.parent_id.acl_viewers or user.collab.admin_rh
AllowUpdate: user.Email in rec.parent_id.acl_editors or user.collab.admin_rh
```
✅ `newRec.acl_viewers` fonctionne sur colonne formule — Grist évalue la formule sur les nouvelles valeurs lors d'un `AllowCreate`. ✅ Validé Bloc 1.

### Visibilité conditionnelle côté widget
```javascript
const peutEditer = (obj) => {
  if (!moi?.email) return false;
  const editors = (obj.acl_editors || '').split(',').map(e => e.trim()).filter(Boolean);
  return editors.includes(moi.email);
};
// Usage : {peutEditer(o) && <button onClick={() => supprimer(o)}>✕</button>}
// La RLS Grist reste le vrai verrou — le widget est cohérent mais non souverain
```
