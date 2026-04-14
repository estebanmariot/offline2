# Mairie — Contexte projet

## Entité et objectif

**Entité :** Mairie / Collectivité territoriale
**Objectif :** Créer un portail numérique unique sur Grist centralisant les services pour les citoyens, les associations et le personnel de la mairie. L'interface principale sera un Widget (Single Page Application) s'adaptant dynamiquement au rôle de l'utilisateur.

**Profil développeur :** No-coder expérimenté — lit et valide le code AI-généré, ne l'écrit pas. Approche "vibe coding" avec validation itérative.

---

## Les Acteurs et Rôles

Le portail détecte l'utilisateur connecté et lui affiche une interface personnalisée :

1. **Citoyen :** Accès grand public (réservation de salles, prise de rendez-vous).
2. **Association :** Accès dédié (réservation de salles, gestion des subventions, demandes événementielles).
3. **Agent de mairie :** Accès global ou sectoriel (validation des salles, traitement des demandes, réunions).

---

## Modules du Portail

| # | Module | Accès | Description |
|---|---|---|---|
| 1 | **Location Salles & Matériel** | Tous | Calendrier, fiches salles, formulaires de réservation. |
| 2 | **Associations & Subventions** | Asso + Mairie | Registre des associations, versements, suivi des dossiers et événements. |
| 3 | **Gestion des Rendez-vous** | Tous | Prise de RDV avec agenda par agent/service. |
| 4 | **Suivi des Demandes (Guichet)** | Mairie uniquement | Ticketing (email, tel, guichet), statut, priorité, agent assigné. |
| 5 | **Réunions & Comptes Rendus** | Mairie uniquement | Ordre du jour, actions, IA de transcription, génération PDF pour l'externe. |

---

## Stack technique envisagée

| Composant | Outil | Rôle |
|---|---|---|
| **Base de données** | Grist | Source de vérité (Tables : Utilisateurs, Salles, RDV, Assos, Demandes...) |
| **Interface globale** | Widget Grist (SPA HTML/JS) | Application contenue dans une seule page (Single Page Application) utilisant HTML natif, Tailwind CSS (via CDN) et Vanilla JavaScript. |
| **Formulaires externes** | Grist (Formulaires natifs) | Si des utilisateurs n'ont pas de compte Grist, on utilisera les vues formulaires publiques de Grist. |
| **Génération PDF & IA** | Xano / API Externe | Xano servira de proxy pour appeler une IA (ex: Whisper pour l'audio des réunions) et générer des PDF complexes. |

> **Règle d'or :** Tout ce qui concerne la base de données et les droits (RLS) reste nativement dans Grist. Le widget communique via `grist.docApi`. L'UI entière fonctionne sans framework frontend (pas de React/Vue), tout en un seul fichier (HTML/JS/CSS) pour faciliter l'intégration Grist.

---

## UI / Charte Graphique (À définir)

*Note pour la suite : Définir ici les couleurs (Bleu république, blanc, rouge, ou charte locale de la mairie) pour le widget.*