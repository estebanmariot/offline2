# Outillage interne — Architecture sécurité

## Chaîne de sécurité — Modules avec API externe (ex : Timesheets)

```
Utilisateur → Sign in with Grist (IdP natif Elestio)
    → RLS Grist (table Summary) → identifie le collaborateur connecté
    → Widget envoie token statique dans header Authorization
    → Xano vérifie precondition token == $env.widget_token
    → Xano appelle API externe avec credentials $env
```

## Chaîne de sécurité — Modules internes (RH, CRM)

```
Utilisateur → Sign in with Grist (IdP natif Elestio)
    → RLS Grist sur tables métier (acl_viewers ou règles simples)
    → Widget lit/écrit via grist.docApi (pas de Xano pour la logique métier)
    → Xano uniquement si appel externe nécessaire (ex : Mailtrap emails)
```

---

## Token widget Xano

- Token statique embarqué dans widget builder Grist (non public)
- Stocké dans `$env.widget_token` côté Xano — jamais dans le code source
- Vérification en **première étape** de chaque endpoint :

```xanoscript
precondition (`$env.$http_headers.Authorization` == ("Bearer " ~ $env.widget_token)) {
  error_type = "unauthorized"
  error = "Unauthorized"
}
```

> **Sémantique Xano precondition :** si condition VRAIE → on continue. Si FAUSSE → erreur déclenchée. C'est l'inverse de ce qu'on attend intuitivement.

---

## Variables d'environnement Xano

| Variable | Valeur | Usage |
|---|---|---|
| `$env.boond_username` | Email compte technique Boond | Auth Basic Boond |
| `$env.boond_token` | Mot de passe compte technique Boond | Auth Basic Boond |
| `$env.widget_token` | Token secret partagé avec le widget | Sécurisation tous endpoints |

---

## Auth Basic Boond dans Xano

```xanoscript
|push:("Authorization: Basic %s"
  |sprintf:(($env.boond_username ~ ":" ~ $env.boond_token)|base64_encode)
)
```

---

## Règles de sécurité générales

- Les owners Grist voient tout sans passer par la RLS — réserver ce statut aux super admins techniques uniquement
- `admin_rh` est un toggle métier spécifique au module RH — pas un owner Grist
- Un editor ne peut pas s'auto-promouvoir via les colonnes ACL
- La RLS Grist est le vrai verrou de sécurité — le widget est cohérent mais non souverain
