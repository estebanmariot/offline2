---
name: methodo-projet
description: "Méthodologie spec-first pour le développement de modules applicatifs. Utiliser systématiquement au démarrage d'un nouveau module ou custom widget — rédaction de specs, user stories, critères d'acceptance, estimation, suivi d'avancement. Contient les templates de tous les documents (spec-fonctionnelle, spec-technique, acceptance, estimation, avancement). Déclencher dès que l'utilisateur mentionne : nouveau module, nouveau widget, spécifications, cahier des charges, user stories, critères d'acceptance, estimation, planification, recette, avancement, reste à faire."
---

# Méthodologie spec-first

## ⚡ Comportement obligatoire au démarrage

**Au démarrage de tout nouveau module ou custom widget, TOUJOURS commencer par demander :**

> "Quels documents souhaitez-vous produire avant de démarrer le développement ?
>
> - [ ] `spec-fonctionnelle.md` — acteurs, user stories, workflow, droits par rôle, notifications
> - [ ] `spec-technique.md` — modèle de données, RLS, architecture widget, hypothèses
> - [ ] `acceptance.md` — cas de test, critères de recette
> - [ ] `estimation.md` — blocs de travail, hypothèses, risques
> - [ ] `avancement.md` — backlog vivant, reste à faire, fait, envisagé
>
> Ne démarrer aucun développement tant que les documents cochés ne sont pas produits et validés."

---

## Documents à produire pour chaque module

| Document | Audience | Moment |
|---|---|---|
| `spec-fonctionnelle.md` | Référent métier, product owner | Avant tout développement |
| `spec-technique.md` | Développeur, intégrateur | Avant tout développement |
| `acceptance.md` | Équipe projet + métier | Avant tout développement |
| `estimation.md` | Chef de projet | Avant tout développement — référence figée |
| `avancement.md` | Équipe projet | Vivant tout au long du projet |

### Principe de séparation fonctionnel / technique

- La spec fonctionnelle ne contient aucun terme technique (pas de noms de tables, pas de statuts en majuscules, pas de règles RLS). Elle est lisible et validable directement avec le référent métier.
- La spec technique ne se préoccupe pas de la présentation — elle documente les décisions d'implémentation, les formules, les patterns validés.
- Les sujets transverses (workflow, notifications) apparaissent dans les deux, avec le niveau de détail adapté à chaque audience.

---

## Templates

### `spec-fonctionnelle.md`

```markdown
# Spec fonctionnelle — [Nom du module] vX.Y
_Destinataires : Référent métier, parties prenantes_
_Mise à jour : YYYY-MM-DD_

## Contexte et objectifs
[Pourquoi cet outil, ce qu'il remplace, volumétrie estimée]

## Hors périmètre v1
- ...

## Acteurs et rôles
| Rôle | Qui ? | Description |
|---|---|---|
| ... | ... | ... |

## User Stories
| # | En tant que | Je veux | Afin de |
|---|---|---|---|
| US-01 | [rôle] | [action] | [bénéfice] |

## Droits par rôle
[Tableaux fonctionnels : qui voit quoi, qui fait quoi — sans jargon technique]

| Action | [Rôle A] | [Rôle B] | [Rôle C] |
|---|---|---|---|
| Voir ... | ✅ | ✅ | ✗ |
| Modifier ... | ✗ | ✅ | ✗ |

## Cycle de vie / Workflow
| Étape | Qui agit | Ce qui se passe |
|---|---|---|
| ... | ... | ... |

## Règles métier
| # | Titre | Description |
|---|---|---|
| R01 | ... | ... |

## Notifications
| Événement | Destinataire(s) | Objet du mail | Contenu résumé |
|---|---|---|---|
| ... | ... | ... | ... |
```

---

### `spec-technique.md`

```markdown
# Spec technique — [Nom du module] vX.Y
_Destinataires : Développeur, intégrateur_
_Mise à jour : YYYY-MM-DD_

## Architecture générale
[Stack, principes, ce qui reste en IHM native Grist vs widget]

## Modèle de données
| Table | Colonne | Type | Description / Formule |
|---|---|---|---|
| ... | ... | ... | ... |

## Workflow — Statuts
| Statut | Transitions possibles | Qui peut transitionner |
|---|---|---|
| STATUT_A | → STATUT_B | [rôle] |

## Stratégie RLS
| Table | AllowRead | AllowCreate | AllowUpdate | AllowDelete |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## Architecture widget
[Init, source de données, détection rôle, navigation SPA si applicable]

## Notifications
[Endpoint Xano, événements déclencheurs avec statuts techniques]

## Hypothèses validées
| # | Hypothèse | Statut | Date |
|---|---|---|---|
| H1 | ... | ✅ Validé | YYYY-MM-DD |
| H2 | ... | ⏳ À tester | — |
| H3 | ... | ❌ Invalide | YYYY-MM-DD |
```

---

### `acceptance.md`

```markdown
# Critères d'acceptance — [Nom du module] vX.Y
_Mise à jour : YYYY-MM-DD_

## Cas de test

### [Fonctionnalité / User Story]
| # | Scénario | Données d'entrée | Résultat attendu | Statut |
|---|---|---|---|---|
| 1 | ... | ... | ... | ⏳ |

## Conditions de recette
- [ ] Tous les cas de test passent
- [ ] Comportement aux limites validé (données vides, erreurs réseau, droits insuffisants)
- [ ] Testé sur chaque rôle distinct
- [ ] Testé par un utilisateur final métier
```

---

### `estimation.md`

```markdown
# Estimation — [Nom du module] vX.Y
_Document de référence — figé après validation. Pour le suivi vivant, voir avancement.md_
_Créé le : YYYY-MM-DD_

## Blocs de travail
| # | Bloc | Charge estimée (JH) | Hypothèses | Risques |
|---|---|---|---|---|
| 1 | ... | 0,5 | ... | ... |

**Total estimé : X,XX JH**
**Réserve risques : X,XX JH (XX%)**

## Ordre de développement recommandé
1. ...
2. ...

## Hypothèses structurantes
- ...
```

---

### `avancement.md`

```markdown
# Avancement — [Nom du module] vX.Y
_Mise à jour : YYYY-MM-DD — à mettre à jour en fin de chaque session_
_Granularité : 0,125 JH = 1h | Base : 8h = 1 JH_

## ✅ Fait
| Fonctionnalité | Détail | JH |
|---|---|---|
| ... | ... | 0,5 |

**Total réalisé : X,XX JH**

## 🔄 Reste à faire
| # | Tâche | Détail | JH estimé |
|---|---|---|---|
| 1 | ... | ... | 0,25 |

**Total restant : X,XX JH**

## 💡 Envisagé (hors périmètre actuel)
| # | Idée | Valeur attendue | JH estimé |
|---|---|---|---|
| 1 | ... | ... | 0,5 |
```

---

## Versioning des specs

- Incrémenter la version (vX.Y) à chaque décision architecturale majeure
- Marquer les hypothèses : ✅ Validé / ⏳ À tester / ❌ Invalide
- `estimation.md` est figé après validation initiale — ne pas le modifier
- `avancement.md` est le seul document vivant pour le suivi quotidien

---

## Ordre de développement

1. **Backend endpoint par endpoint** — tester chaque endpoint indépendamment avant d'intégrer
2. **Frontend écran par écran** — développer en écrans distincts, pas en feature complète
3. **Tests d'intégration** — vérifier les flux complets une fois les briques validées séparément

---

## Checklist démarrage nouveau module

- [ ] Demander quels documents produire (voir bloc ⚡ en haut)
- [ ] Produire et valider `spec-fonctionnelle.md` avec le référent métier **avant de continuer**
- [ ] Produire `spec-technique.md`
- [ ] Produire `acceptance.md`
- [ ] Produire `estimation.md`
- [ ] Initialiser `avancement.md` à partir de l'estimation
- [ ] Identifier si API externe nécessaire (→ Xano) ou module interne (→ `grist.docApi` uniquement)
- [ ] Valider les endpoints en test réel avant développement frontend (si API externe)
- [ ] Valider les hypothèses RLS critiques en Bloc 0
- [ ] Vérifier les TABLE IDs exacts dans Données sources Grist
- [ ] Développer backend endpoint par endpoint
- [ ] Développer widget React écran par écran
- [ ] Tester intégration complète selon `acceptance.md`
- [ ] Mettre à jour `avancement.md` et docs avec les apprentissages
