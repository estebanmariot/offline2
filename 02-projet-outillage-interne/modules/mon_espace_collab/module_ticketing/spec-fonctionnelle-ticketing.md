# Spec fonctionnelle — Module Ticketing v0.1
**Destinataires :** Référent métier, parties prenantes
**Date :** 2026-04-02

---

## Contexte et objectifs

Permettre à tout collaborateur de soumettre une demande de support, suivre son traitement, et échanger avec l'équipe en charge. Le support est organisé par catégories, chaque catégorie ayant un responsable et une équipe dédiée.

---

## Hors périmètre v1

- Hiérarchie de catégories
- SLA / délais de traitement
- Rapports et statistiques
- Affectation automatique (round-robin)

---

## Acteurs et rôles

| Rôle | Qui ? |
|---|---|
| **Collaborateur** | Tout salarié — peut soumettre des tickets |
| **Agent** | Membre d'un pôle support — traite les tickets de ses catégories |
| **Responsable catégorie** | Agent désigné comme responsable d'une catégorie — reçoit les tickets en première instance, peut réaffecter |
| **Admin ticketing** | Configure les catégories et gère les agents — champ dédié dans la fiche collaborateur |

Un agent peut être responsable et/ou membre de plusieurs catégories.

---

## Droits par rôle

| Action | Collaborateur | Agent | Responsable catégorie | Admin ticketing |
|---|---|---|---|---|
| Créer un ticket | ✅ (les siens) | ✅ | ✅ | ✅ |
| Voir ses propres tickets | ✅ | ✅ | ✅ | ✅ |
| Voir les tickets de sa catégorie | ✗ | ✅ | ✅ | ✅ |
| Voir tous les tickets | ✗ | ✗ | ✗ | ✅ |
| Modifier le statut | ✗ (sauf valider/rouvrir) | ✅ (ses catégories) | ✅ | ✅ |
| Valider / rouvrir un ticket (statut À VALIDER) | ✅ (les siens) | ✗ | ✗ | ✅ |
| Réaffecter un ticket (agent ou catégorie) | ✗ | ✗ | ✅ | ✅ |
| Commenter un ticket | ✅ (les siens) | ✅ (ses catégories) | ✅ | ✅ |
| Joindre un fichier | ✅ (les siens) | ✅ (ses catégories) | ✅ | ✅ |
| Configurer catégories / agents | ✗ | ✗ | ✗ | ✅ |

---

## Cycle de vie d'un ticket

| Statut | Qui peut y passer | Description |
|---|---|---|
| **Ouvert** | Collaborateur (à la création) | Ticket soumis, non pris en charge |
| **En cours** | Agent / Responsable / Admin | Ticket pris en charge |
| **Pending** | Agent / Responsable / Admin | En attente d'information du demandeur |
| **Résolu** | Agent / Responsable / Admin | Traitement terminé, en attente de validation |
| **À valider** | Agent / Responsable / Admin | Résolution soumise au demandeur pour confirmation |
| **Fermé** | Demandeur (confirmation) / Admin | Ticket clôturé — le demandeur confirme la résolution depuis "À valider" |

> **v1 — workflow libre** : aucune contrainte de transition, le statut est librement modifiable par les agents.

---

## Règles métier

| # | Règle |
|---|---|
| R1 | Un ticket est automatiquement affecté au responsable de la catégorie choisie à la création |
| R2 | Le responsable peut réaffecter le ticket à un autre agent (toute catégorie) ; si la catégorie change, le ticket est réaffecté au responsable de la nouvelle catégorie |
| R2b | La criticité est choisie par le demandeur à la création : Basse / Moyenne / Haute / Très haute |
| R3 | Un collaborateur ne voit que ses propres tickets |
| R4 | Un agent voit tous les tickets des catégories auxquelles il appartient |
| R5 | Les commentaires sont visibles par le demandeur et les agents de la catégorie |
| R6 | Les pièces jointes sont attachées au ticket (taille max ~25 Mo par fichier, stockage Grist natif) |

---

## Notifications email

> Endpoint dédié (à définir — distinct de l'endpoint RH).

| Événement | Destinataire |
|---|---|
| Ticket créé | Responsable de la catégorie |
| Statut modifié | Demandeur |
| Nouveau commentaire | Demandeur + agent assigné |
| Ticket réaffecté | Nouvel agent assigné |

---

## Interface

Single page application intégrée dans Grist (un seul widget, une seule page affichée).

**Vues selon le rôle :**
- **Collaborateur** : liste de ses tickets + formulaire de création + détail ticket (commentaires, PJ)
- **Agent / Responsable** : liste des tickets de ses catégories + détail ticket + actions (statut, réaffectation)
- **Admin** : toutes les vues ci-dessus + configuration catégories / agents
