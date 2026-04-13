---
name: xanoscript
description: "Syntaxe et patterns XanoScript validés en production. Utiliser systématiquement dès qu'il s'agit d'écrire, corriger ou comprendre du code XanoScript — endpoints, variables, boucles, conditions, appels API externes, lambdas JavaScript, preconditions. Inclut tous les pièges connus et les patterns validés en production."
---

# XanoScript — Syntaxe et patterns validés

## Structure d'un endpoint

```xanoscript
query nom_endpoint verb=GET {
  input {
    text param1
    int param2?
    object[] items {
      schema {
        text id?
        int row
        decimal duration
        text delivery_id?
      }
    }
  }

  stack {
    // logique ici
  }

  response = $result
}
```

**Types d'input disponibles :** `text`, `int`, `decimal`, `bool`, `object`, `object[]`
**`?` rend un champ optionnel.** Les tableaux d'objets nécessitent un bloc `schema {}`.
**`integer` n'existe pas** — utiliser `int`.

---

## Variables

```xanoscript
var $ma_variable { value = "valeur" }
var.update $ma_variable { value = "nouvelle valeur" }
```

---

## Conditions

```xanoscript
conditional {
  if ($condition) { ... }
  elseif ($autre) { ... }
  else { ... }
}
```

---

## Boucles

```xanoscript
foreach ($tableau) {
  each as $item {
    // $item est l'élément courant
  }
}
```

---

## Appel API externe

```xanoscript
api.request {
  url = ("https://api.example.com/endpoint/%s" |sprintf:$input.id)
  method = "GET"  // ou POST, PUT
  params = { cle: "valeur" }  // body pour POST/PUT
  headers = []
    |push:"Accept: application/json"
    |push:"Content-Type: application/json"
    |push:("Authorization: Basic %s"
      |sprintf:($env.username ~ ":" ~ $env.token)|base64_encode
    )
} as $response
```

**Accès au résultat :**
```xanoscript
$response.response.result.data    // données
$response.response.result.meta    // métadonnées
$response.response.status         // code HTTP
```

---

## Lambda JavaScript

```xanoscript
api.lambda {
  code = "return typeof $var.inc.attributes.monChamp !== 'undefined' ? $var.inc.attributes.monChamp : null;"
  timeout = 5
} as $result
```

**Règles critiques :**
- Les variables du stack sont accessibles via `$var.nom_variable` dans le code JS
- Pas de paramètre `input` ou `vars` — utiliser `$var` directement
- Tout sur **une seule ligne** — pas de sauts de ligne dans le code
- `input` est un mot réservé XanoScript — ne pas l'utiliser comme nom de paramètre lambda

---

## Précondition (sémantique Xano)

```xanoscript
precondition (`$env.$http_headers.Authorization` == ("Bearer " ~ $env.widget_token)) {
  error_type = "unauthorized"
  error = "Unauthorized"
}
```

**Sémantique critique :** si condition VRAIE → on continue. Si FAUSSE → erreur déclenchée.
C'est l'inverse de ce qu'on attend intuitivement.

**Error types disponibles :** `standard`, `notfound`, `accessdenied`, `toomanyrequests`, `unauthorized`, `badrequest`, `inputerror`

---

## Concatenation et filters

```xanoscript
"texte" ~ $variable           // concatenation
$valeur|base64_encode         // filtre
"format %s"|sprintf:$var      // sprintf
[]|push:"valeur"              // push dans tableau
$obj|set:"cle":"valeur"       // set dans objet
$tableau|is_empty             // test tableau vide
```

---

## Accès headers entrants

```xanoscript
`$env.$http_headers.Authorization`  // avec backticks obligatoires
```

---

## Retour anticipé

```xanoscript
return { value = { statut: "ok", id: $mon_id } }
```

---

## Sécurisation endpoint (pattern standard)

Toujours en première étape de chaque endpoint :

```xanoscript
precondition (`$env.$http_headers.Authorization` == ("Bearer " ~ $env.widget_token)) {
  error_type = "unauthorized"
  error = "Unauthorized"
}
```

Token stocké dans `$env.widget_token` — jamais dans le code source.

---

## Auth Basic dans un appel API

```xanoscript
|push:("Authorization: Basic %s"
  |sprintf:(($env.boond_username ~ ":" ~ $env.boond_token)|base64_encode)
)
```

---

## Pièges connus

| Piège | Correction |
|---|---|
| `integer` dans input | Utiliser `int` |
| Sauts de ligne dans lambda | Tout sur une seule ligne |
| `input` comme paramètre lambda | Mot réservé — utiliser `$var.nom_variable` |
| `vars` ou `input` dans lambda | Ne fonctionne pas — utiliser `$var` |
| Backticks oubliés pour headers | `\`$env.$http_headers.Authorization\`` |
| Sémantique precondition inversée | VRAI = continuer, FAUX = erreur |
| Accès réponse API | `$response.response.result.data` (pas `$response.data`) |
