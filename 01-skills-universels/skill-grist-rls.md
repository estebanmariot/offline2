---
name: grist-rls
description: "Pattern standardisé pour implémenter le Row Level Security (RLS) dans les tables Grist. Utiliser dès qu'il s'agit de configurer des Access Rules sur une table Grist — colonnes ACL, règles de création/lecture/édition/suppression, protection des colonnes ACL. Inclut les règles de sécurité validées en production."
---

# Grist RLS — Pattern standardisé

## Principe

Chaque table soumise à du RLS expose 3 colonnes de type **formule** retournant une liste d'emails :

| Colonne | Rôle |
|---|---|
| `acl_viewers` | Emails autorisés à lire la ligne |
| `acl_editors` | Emails autorisés à modifier la ligne |
| `acl_deleters` | Emails autorisés à supprimer la ligne |

La logique métier (qui a accès à quoi) est centralisée dans ces formules — les règles RLS sont identiques sur toutes les tables.

---

## Règles Access Rules à configurer

### 1. Colonnes ACL (acl_viewers, acl_editors, acl_deleters)

| Condition | R | U |
|---|---|---|
| `user.Access in [OWNER]` | ✅ | ✅ |
| Tous les autres | ✗ | ✗ |

→ Les colonnes ACL sont invisibles pour tous les non-propriétaires.

**Exception — widget avec logique d'affichage basée sur les ACL :**
Si un widget custom doit conditionner l'affichage (boutons, actions) sur la base des colonnes ACL, retirer la règle de lecture sur les colonnes concernées. La règle U (modification) reste réservée aux propriétaires.

| Condition | R | U |
|---|---|---|
| `user.Access in [OWNER]` | ✅ | ✅ |
| Tous les autres | ✅ | ✗ |

### 2. Toutes les colonnes (règles sur la table)

| Condition | R | U | C | D |
|---|---|---|---|---|
| `user.Access in [OWNER]` | ✅ | ✅ | ✅ | ✅ |
| `user.Email in newRec.acl_viewers` | | | ✅ | |
| `user.Email in rec.acl_editors` | | ✅ | | |
| `user.Email in rec.acl_deleters` | | | | ✅ |
| `user.Email in rec.acl_viewers` | ✅ | | | |
| Tous les autres | ✗ | ✗ | ✗ | ✗ |

---

## Règles de cohérence

- **Un editor doit toujours être dans `acl_viewers`** — si un editor ne voit pas une ligne, corriger la formule `acl_viewers`, pas les règles RLS.
- **La règle de création** (`newRec.acl_viewers`) peut varier par table — l'exemple ci-dessus donne le droit de créer aux viewers, à adapter selon le besoin.
- **Deny by default** — la règle "Tous les autres → RUCD✗" est obligatoire.

---

## Sécurité

- Les colonnes ACL étant masquées aux non-propriétaires, un utilisateur ne peut pas connaître la liste des autres ayant accès à une ligne. Si la lecture est ouverte (exception widget), les emails des autres ayants accès sont exposés — à ne faire que dans un contexte maîtrisé.
- Seuls les propriétaires du document peuvent modifier les formules ACL (droit de structure Grist).
- Un editor ne peut pas s'auto-promouvoir via les colonnes ACL.

---

## Points de vigilance

| Situation | À vérifier |
|---|---|
| Widget avec logique d'affichage sur ACL | Ouvrir R sur les colonnes ACL concernées, garder U restreint aux propriétaires |
| Formule `acl_viewers` avec lookup | Doit être robuste à un enregistrement vide (`newRec`) |
| Nouveau type de droit nécessaire | Ajouter une colonne `acl_xxx` + règle dédiée, ne pas modifier les règles existantes |
| Table sans besoin de suppression | Omettre `acl_deleters` et la règle associée |

---

## Pattern — Contrôle de visibilité de page

### Problème

Grist ne propose pas de droits natifs sur les pages. Une page est visible dès lors qu'elle contient au moins une vue dont la source est accessible à l'utilisateur.

### Solution : table `Config_droits_page_[module]`

Créer une table dédiée par page à protéger, appliquer des règles RLS dessus, et l'inclure dans la page comme source d'une vue (widget natif).

**Résultat :** si l'utilisateur ne peut pas lire la table config, il ne voit pas la page entière.

### Mise en place

1. Créer une table `Config_droits_page_[module]` (vide, aucune colonne métier requise)
2. Appliquer les règles RLS sur cette table :

| Condition | R | U | C | D |
|---|---|---|---|---|
| `user.Access in [OWNER]` | ✅ | ✅ | ✅ | ✅ |
| `user.Email in [emails autorisés]` | ✅ | ✗ | ✗ | ✗ |
| Tous les autres | ✗ | ✗ | ✗ | ✗ |

3. Ajouter une vue liée à `Config_droits_page_[module]` sur la page à protéger (peut être masquée visuellement, elle doit juste exister)

### Exemple réel — projet Outillage Interne

```
Config_droits_page_rh           → protège la page RH Entretiens
Config_droits_page_ticketing    → protège la page Ticketing
Config_droits_page_collaborateurs → protège la page gestion Collaborateurs
```

> Les droits d'accès (`admin_rh`, `admin_ticketing`) sont portés par des colonnes booléennes de la table `Collaborateurs` — les formules ACL de la config table peuvent s'y référer via un lookup.
