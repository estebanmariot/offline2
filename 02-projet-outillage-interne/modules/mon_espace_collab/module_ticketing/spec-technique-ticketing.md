# Spec technique — Module Ticketing v0.4
**Destinataires :** Développeur, intégrateur
**Date :** 2026-04-08

---

## Architecture générale

- **Frontend** : widget custom Grist — SPA, un seul widget, une seule vue Grist
- **Stockage données** : Grist natif (tables)
- **Stockage PJ** : Xano Private File Storage — Grist stocke uniquement les métadonnées (`xano_pj_id`, `nom_fichier`)
- **Notifications** : webhooks Grist natifs → Xano → Mailtrap
- **RLS** : pattern standardisé grist-rls (colonnes `acl_viewers`, `acl_editors` selon table)

**Pourquoi Xano pour les PJ :**
- Les attachments Grist natifs ne sont pas soumis aux RLS (accessible par ID sans contrôle d'accès)
- Pas d'API d'accès aux fichiers depuis le SDK widget sans token REST exposé
- Xano Private Files génère des signed URLs temporaires (TTL 60s)

---

## Modèle de données

### `Tck_Categories`

| Colonne | Type | Notes |
|---|---|---|
| `nom` | Text | Libellé de la catégorie |
| `responsable_id` | Ref → Collaborateurs | Responsable de la catégorie (reçoit les tickets en première instance) |
| `agents` | RefList → Collaborateurs | Agents membres de cette catégorie |
| `actif` | Bool | Permet de désactiver sans supprimer |

### `Tck_Tickets`

| Colonne | Type | Notes |
|---|---|---|
| `titre` | Text | |
| `description` | Text | |
| `criticite` | Text | `BASSE` / `MOYENNE` / `HAUTE` / `TRES_HAUTE` — saisie libre, validation widget |
| `statut` | Choice | `OUVERT` / `EN_COURS` / `PENDING` / `RESOLU` / `A_VALIDER` / `FERME` |
| `categorie_id` | Ref → Tck_Categories | |
| `demandeur_id` | Ref → Collaborateurs | Collaborateur ayant créé le ticket |
| `agent_assigne_id` | Ref → Collaborateurs | Agent actuellement assigné |
| `date_creation` | DateTime | Auto à la création |
| `date_maj` | DateTime | Mis à jour à chaque modification |
| `Derniere_mise_a_jour_par` | Text (Formula) | `user.Name` — recalculé à chaque modification (`recalcWhen: 2`) |
| `categorie_id_agents_email` | Formula | `$categorie_id.agents.email` — emails des agents de la catégorie, utilisé pour les notifications Xano/Mailtrap |
| `notification_emails` | Formula | Liste des emails destinataires pour webhooks (voir §Notifications) |
| `acl_viewers` | Formula | Voir §RLS |
| `acl_editors` | Formula | Voir §RLS |

> Pas de `acl_deleters` — la suppression de ticket n'est pas autorisée en v1.

### `Tck_Commentaires`

| Colonne | Type | Notes |
|---|---|---|
| `ticket_id` | Ref → Tck_Tickets | |
| `auteur_id` | Ref → Collaborateurs | |
| `contenu` | Text | |
| `date` | DateTime | Auto à la création |
| `notification_emails` | Formula | Liste des emails destinataires pour webhooks (voir §Notifications) |
| `acl_viewers` | Formula | Voir §RLS |

> Pas de `acl_editors` — les commentaires ne sont pas éditables en v1.
> Pas de `acl_deleters` — la suppression de commentaire n'est pas autorisée en v1.

### `Tck_PiecesJointes`

| Colonne | Type | Notes |
|---|---|---|
| `xano_pj_id` | Text | Path Xano Private Storage (`/vault/...`) |
| `nom_fichier` | Text | Nom original du fichier (avec extension) |
| `ticket_id` | Ref → Tck_Tickets | null si PJ sur commentaire |
| `commentaire_id` | Ref → Tck_Commentaires | null si PJ sur ticket |
| `auteur_id` | Ref → Collaborateurs | |
| `date` | DateTime | |
| `acl_viewers` | Formula | Voir §RLS |

> ⚠️ Pas de colonne `size` — le contrôle 10MB s'applique uniquement aux nouveaux fichiers uploadés dans la session courante.

### `Collaborateurs` — champs ajoutés

| Colonne | Type | Notes |
|---|---|---|
| `admin_ticketing` | Bool | Donne accès à la vue admin ticketing |
| `user_id` | Formula | `user.id` — ID Grist de l'utilisateur connecté, utilisé pour identifier `moi` dans le widget |

---

## Workflow — Statuts

```
OUVERT → EN_COURS → PENDING → EN_COURS
                 ↘ RESOLU → A_VALIDER → FERME (demandeur confirme)
                                      → EN_COURS (demandeur rouvre)
```

- Transitions libres en v1 (pas de contrainte côté RLS)
- Le passage à `FERME` depuis `A_VALIDER` et le retour à `EN_COURS` sont déclenchés par le **demandeur** uniquement
- Toutes les autres transitions de statut sont réservées aux agents/responsables/admin

> ⚠️ **v1 — contrôle widget uniquement** : le demandeur dispose techniquement du droit `+U` sur le ticket (via `acl_editors`). Les restrictions de transitions de statut sont appliquées par le widget, pas par Grist.

---

## Stratégie RLS

Pattern grist-rls standard.

### `Tck_Tickets`

**`acl_viewers`**
```python
emails = [rec.demandeur_id.email]
cat = rec.categorie_id
if cat:
    if cat.responsable_id:
        emails.append(cat.responsable_id.email)
    for a in cat.agents:
        emails.append(a.email)
for c in Collaborateurs.all:
    if c.admin_ticketing:
        emails.append(c.email)
return ','.join(set(filter(None, emails)))
```

**`acl_editors`**
```python
emails = [rec.demandeur_id.email]
cat = rec.categorie_id
if cat:
    if cat.responsable_id:
        emails.append(cat.responsable_id.email)
    for a in cat.agents:
        emails.append(a.email)
for c in Collaborateurs.all:
    if c.admin_ticketing:
        emails.append(c.email)
return ','.join(set(filter(None, emails)))
```

> ⚠️ Le demandeur peut modifier le ticket (titre, description, criticité, PJ). Les transitions de statut réservées au demandeur (fermer/rouvrir depuis `A_VALIDER`) sont contrôlées **uniquement par le widget** — pas de protection RLS supplémentaire (v1).

⚠️ **Point critique** : à chaque changement de `categorie_id` ou d'`agent_assigne_id`, les formules `acl_*` sont recalculées automatiquement par Grist (colonnes formule). Pas d'action manuelle requise, mais à vérifier en test (H2).

### `Tck_Commentaires`

**`acl_viewers`** : demandeur + agents de la catégorie du ticket parent (logique identique à `acl_viewers` de `Tck_Tickets`)

### `Tck_PiecesJointes`

**`acl_viewers`** : idem `Tck_Commentaires`

---

## Architecture widget

### Init
```javascript
// Pattern validé en production (React)
useEffect(() => {
  grist.ready({ requiredAccess: 'full' });
  grist.onRecords(async records => {
    if (!records || !records.length) { setLoading(false); return; }
    const profil = records[0];
    setMoi(profil);
    await charger(profil);
    setLoading(false);
  });
}, []);
```

> La vue liée est configurée dans Grist ("Sélectionner les données") sur la table Summary Collaborateurs — filtrage RLS natif, pas de code widget.

### Identification utilisateur

`moi.id` (ID record Summary) ≠ ID Collaborateurs. La colonne formula `user_id` dans `Collaborateurs` expose `user.id` — la Summary liée expose donc directement `moi.user_id` comme identifiant fiable pour toutes les comparaisons et écritures (`demandeur_id`, `auteur_id`, etc.).

```javascript
// Toutes les références à l'utilisateur connecté utilisent moi.user_id
demandeur_id: moi.user_id
auteur_id: moi.user_id
```

### Normalisation des Ref Grist (`derefVal`)

`fetchTable` retourne les colonnes Ref sous `['R', id]` et RefList sous `['L', id1, id2, ...]`. Un helper `derefVal` est appliqué dans `toRows` pour normaliser toutes les valeurs à la source :

```javascript
const derefVal = (v) => {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) {
    if (v[0] === 'R') return v[1] ?? null;  // Ref → entier
    if (v[0] === 'L') return v.slice(1);    // RefList → tableau d'entiers
    return v;
  }
  return v;
};

const toRows = (t) => {
  if (!t) return [];
  const keys = Object.keys(t);
  if (!keys.length) return [];
  const len = t[keys[0]]?.length || 0;
  return Array.from({length: len}, (_, i) =>
    Object.fromEntries(keys.map(k => [k, derefVal(t[k][i])]))
  );
};
```

### Détection rôle
```javascript
const estAdmin = !!moi.admin_ticketing;
const mesCatsIds = categories.filter(c =>
  c.responsable_id === moi.user_id ||
  (Array.isArray(c.agents) && c.agents.includes(moi.user_id))
).map(c => c.id);
const estAgent = mesCatsIds.length > 0;
```

### Vues
- **Vue demandeur** : liste mes tickets (filtre `demandeur_id == moi.user_id`) + bouton Nouveau ticket + détail
- **Vue agent** : liste tickets de mes catégories + détail + actions statut
- **Vue admin** : toutes les vues + onglet configuration catégories/agents
- Un utilisateur peut cumuler les vues (ex. agent qui est aussi demandeur)

### Recalcul ACL après changement catégorie
Lors d'une réaffectation avec changement de catégorie :
1. Mettre à jour `categorie_id` et `agent_assigne_id` sur le ticket
2. Grist recalcule les colonnes `acl_*` automatiquement
3. Le widget recharge le ticket pour refléter les nouveaux droits

---

## Endpoints Xano PJ (groupe TICKETING)

| Endpoint | Méthode | Input | Statut |
|---|---|---|---|
| `/TICKETING/pj_upload` | POST multipart | `fichier` (File), `nom_fichier` (text) | ✅ validé |
| `/TICKETING/pj_signed-url` | GET | `?xano_pj_id=` (text) | ✅ validé |
| `/TICKETING/pj_delete` | DELETE JSON | `{xano_pj_id}` | ✅ validé |

- Token : `$env.widget_token_ticketing` (même token pour les 3 endpoints)
- Signed URL TTL : 60 secondes
- Stockage : Xano Private File Storage

**Flux upload :**
1. Widget → `POST pj_upload` (FormData multipart)
2. Xano → `storage.create_attachment` → retourne `{xano_pj_id, nom_fichier, size}`
3. Widget → `AddRecord Tck_PiecesJointes` avec `xano_pj_id` + `nom_fichier`

**Flux lecture :**
1. Widget → `GET pj_signed-url?xano_pj_id=...`
2. Xano → `storage.sign_private_url` → retourne `{url, ttl}`
3. Widget → `fetch(url)` → `createObjectURL(blob)` → `<a download>` (contournement restriction cross-origin)

**Limites PJ (contrôle widget) :**
- 5 fichiers max cumulés par ticket (ticket + commentaires)
- 10 MB max cumulés (nouveaux fichiers session uniquement — pas de colonne `size` dans Grist)

---

## Notifications

Déclenchement via **webhooks Grist natifs** sur modification de table → Xano → Mailtrap.

| Webhook Xano | Table Grist surveillée | Événement | Destinataires (`notification_emails`) |
|---|---|---|---|
| `WEBHOOK/TICKETING_NOTIF_creation_ticket_notifier_agents` | `Tck_Tickets` | Création | `list(dict.fromkeys(filter(None, [$demandeur_id.email] + [$agent_assigne_id.email] + ($categorie_id.agents.email or []))))` |
| `WEBHOOK/TICKETING_NOTIF_statut_mis_a_jour` | `Tck_Tickets` | Modification statut | idem |
| `WEBHOOK/TICKETING_NOTIF_ajout_commentaire_ticket` | `Tck_Commentaires` | Création | `list(dict.fromkeys(filter(None, [$auteur_id.email] + ($ticket_id.categorie_id.agents.email or []))))` |

**Colonne `notification_emails` :**
- Type : Formula (liste Python)
- Calculée automatiquement par Grist, consommée par le webhook Xano
- Dédupliquée via `dict.fromkeys`, `None` filtrés via `filter(None, ...)`
- Aplatissement des RefList via concaténation `+` de listes Python

**Colonne `categorie_id_agents_email` (`Tck_Tickets`) :**
- Formula : `$categorie_id.agents.email`
- Helper intermédiaire pour accéder aux emails des agents depuis le webhook, en complément de `notification_emails`

---

## Hypothèses

| # | Hypothèse | Statut |
|---|---|---|
| H1 | Attachments Grist non soumis aux RLS — accessible par ID sans auth | ✅ confirmé → Xano proxy |
| H2 | `acl_viewers` recalculé automatiquement après changement de `categorie_id` | ⏳ À tester |
| H3 | Un collaborateur peut être agent de plusieurs catégories simultanément | ✅ |
| H4 | Token Xano unique pour les 3 endpoints PJ | ✅ |
| H5 | Pas de suppression de ticket ni de commentaire en v1 | ✅ |
| H6 | fetchTable Ref/RefList → normalisé via `derefVal` dans `toRows` | ✅ validé |
| H7 | `moi.user_id` (formula `user.id`) = identifiant fiable multi-comptes | ✅ validé |
| H8 | signed URL cross-origin → fetch + Blob URL côté widget | ✅ validé |
