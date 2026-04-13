# Endpoints XanoScript — Ticketing PJ
# Token stocké dans $env.widget_token_ticketing

---

## POST /ticketing/pj/upload

```xanoscript
query ticketing_pj_upload verb=POST {
  input {
    file? fichier
    text nom_fichier
  }

  stack {
    precondition (`$env.$http_headers.Authorization` == ("Bearer " ~ $env.widget_token_ticketing)) {
      error_type = "unauthorized"
      error = "Unauthorized"
    }

    storage.create_attachment {
      value = $input.fichier
      access = "private"
      filename = $input.nom_fichier
    } as $file_meta
  }

  response = {
    xano_pj_id: $file_meta.path,
    nom_fichier: $input.nom_fichier,
    size: $file_meta.size
  }
}
```

---

## GET /ticketing/pj/signed-url

```xanoscript
query ticketing_pj_signed_url verb=GET {
  input {
    text xano_pj_id
  }

  stack {
    precondition (`$env.$http_headers.Authorization` == ("Bearer " ~ $env.widget_token_ticketing)) {
      error_type = "unauthorized"
      error = "Unauthorized"
    }

    storage.sign_private_url {
      pathname = $input.xano_pj_id
      ttl = 60
    } as $signed_url
  }

  response = {
    url: $signed_url,
    ttl: 60
  }
}
```

---

## DELETE /ticketing/pj/delete

```xanoscript
query ticketing_pj_delete verb=DELETE {
  input {
    text xano_pj_id
  }

  stack {
    precondition (`$env.$http_headers.Authorization` == ("Bearer " ~ $env.widget_token_ticketing)) {
      error_type = "unauthorized"
      error = "Unauthorized"
    }

    storage.delete_file {
      pathname = $input.xano_pj_id
    }
  }

  response = {
    deleted: true,
    xano_pj_id: $input.xano_pj_id
  }
}
```

---

## Limites appliquées côté widget (avant upload)

- Max 5 pièces jointes cumulées (ticket + commentaires confondus)
- Max 10MB cumulés
- Contrôle effectué dans le widget avant tout appel Xano
