# Outillage interne — Contexte projet

## Entreprise et objectif

**Entreprise :** ESN ~50 personnes
**Objectif :** Remplacer Salesforce CRM, Lucca RH et BoondManager Intranet par des outils internes custom développés sur Grist.

**Profil développeur :** No-coder expérimenté — lit et valide le code AI-généré, ne l'écrit pas. Approche "vibe coding" avec validation itérative.

---

## Modules

| # | Module | Statut |
|---|---|---|
| 1 | Timesheets Boond (CRA) | ✅ En recette |
| 2 | RH — Entretiens annuels | 🔄 Bloc 1 en cours |
| 3 | Ticketing interne | 🔄 À développer |
| 4 | CRM | 🔄 À développer |

---

## Stack technique définitive

| Composant | Outil | Rôle |
|---|---|---|
| **Base de données** | Grist (Elestio self-hosted) | Source de vérité pour modules internes (RH, CRM) |
| **Source de vérité externe** | BoondManager | Source de vérité absolue pour les timesheets |
| **Proxy API sécurisé** | Xano (SaaS) | Endpoints sécurisés vers APIs externes + emails |
| **Interface utilisateur** | Grist (Elestio self-hosted) | Auth + shell UI + widget builder |
| **Widget frontend** | HTML/CSS/React 18 + JSX via Babel CDN | Interface dans widget builder Grist |
| **Email** | Mailtrap via Xano | Notifications — appel depuis widget via endpoint Xano |
| **Jours fériés** | Nager.Date API publique | `https://date.nager.at/api/v3/PublicHolidays/{year}/{iso}` |
| **Hébergement** | Elestio | Grist self-hosted avec Nginx + Let's Encrypt |

> **Règle :** Xano n'est nécessaire que pour les appels vers des APIs externes (BoondManager, Mailtrap). Les modules internes (RH, CRM) s'appuient sur `grist.docApi` pour la logique métier — pas de Xano.

---

## Documents Grist

| Document | Modules hébergés | Raison |
|---|---|---|
| **Mon Espace Collab** (`gZnXTd9NcUgSYtsWyrZJcz`) | CRA Boond + RH Entretiens + Ticketing | Mutualisation de la table `Collaborateurs` et des droits |
| **CRM** (`bMaMjnvaP17SyL3BftmFW1`) | CRM Interne | Document dédié, indépendant |

> La table `Collaborateurs` est la source de vérité des utilisateurs pour les modules Mon Espace Collab. La table summary `Collaborateurs_summary_actif_admin_rh_admin_ticketing_boond_resource_id_email_manager_id_nom_complet_pole_id_user_id` est utilisée comme source des widgets (RLS par email + exposition du `user_id`).

---

## Principes généraux

- API externe = source de vérité absolue — jamais dupliquer les données dans Grist
- Pour les modules internes, Grist est la source de vérité — pas de Xano
- Toujours resync depuis la source après une action (save, create) — pas de mise à jour optimiste
- Découper les endpoints en responsabilités uniques (1 endpoint = 1 action)
- Tester chaque endpoint Xano indépendamment avant d'intégrer dans le widget
- Tout ce qui peut se gérer via l'IHM native Grist doit y rester — widget uniquement pour UX complexe

---

## Patterns React — spécifiques Outillage interne

Ces patterns utilisent le modèle de données propre à Outillage interne (champs `collaborateur_id`, `manager_id`, `admin_rh`). Les patterns génériques (toRows, toast, resync, écriture docApi) sont dans `skill-grist-widget.md`.

### Détection du rôle dans le widget

```javascript
// moiId = profil.user_id (colonne formule Summary) ou lookup par email
const roleContexte = !record ? null
  : record.collaborateur_id === moiId ? 'collaborateur'
  : record.manager_id === moiId       ? 'manager'
  : moi?.admin_rh                     ? 'admin_rh'
  : 'lecteur';

// Détection manager global
const estManager = records.some(r => r.manager_id === moiId && r.collaborateur_id !== moiId);
```



| Usage | Valeur |
|---|---|
| Fond général | `#F4F5F7` |
| Fond carte | `#FFFFFF` |
| Texte principal | `#1A1A1A` |
| Texte secondaire | `#6B7280` |
| Accent principal | `#43D19B` |
| Erreur | `#EF4444` |
| Avertissement | `#F59E0B` |
| Cellule vide | `#FFFFFF` |
| Cellule 0,5j | `#D1FAE5` |
| Cellule 1j | `#43D19B` |
| Cellule dépassement | `#FED7AA` |

**Typographie :**
- Contenu : Inter (Google Fonts)
- Boutons / titres d'action : Press Start 2P (Google Fonts) — effet rétro gamer

**Effet rétro gamer (boutons) :**
```css
border: 2px solid #000;
box-shadow: 3px 3px 0px #000;
transition: all 0.08s ease;
/* Au clic */
transform: translate(2px, 2px);
box-shadow: 1px 1px 0px #000;
```

**Indicateur de chargement :**
```jsx
<div className="loading">
  CHARGEMENT<span className="cursor-blink">▮</span>
</div>
// @keyframes blink { 50% { opacity: 0; } }
```
