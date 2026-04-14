# Schéma de Données Grist — Portail Mairie v0.1

Voici la structure de base de données recommandée pour faire fonctionner tous les modules du portail.
**Consigne pour le No-Coder :** Créez ces tables dans Grist. Si vous modifiez un "Nom de la Colonne" (ID de la colonne dans Grist), mettez à jour la colonne correspondante dans ce tableau. Le code du widget s'appuiera **exactement** sur la colonne "ID Colonne (Grist JS)" pour fonctionner.

---

### Table : `Utilisateurs`
*Rôle : Gérer les comptes de connexion et droits.*
| Champ de l'interface (Description) | ID Colonne (Grist JS) | Type Grist Recommandé | Notes |
|---|---|---|---|
| Email de connexion | `Email` | Text | Unique, sert pour l'authentification |
| Nom complet | `Nom_Complet` | Text | |
| Rôle de l'utilisateur | `Role` | Choice | Valeurs : `citoyen`, `association`, `agent` |
| Téléphone | `Telephone` | Text | |

---

### Table : `Salles`
*Rôle : Catalogue des ressources louables.*
| Champ de l'interface (Description) | ID Colonne (Grist JS) | Type Grist Recommandé | Notes |
|---|---|---|---|
| Nom de la salle | `Nom_Salle` | Text | |
| Capacité (personnes) | `Capacite` | Int | |
| Adresse / Bâtiment | `Adresse` | Text | |
| Actif / Réservable | `Est_Reservable`| Toggle (Bool) | |
| Taille| `Taille`| Int | |
| Prix| `Prix`| Int | |

---

### Table : `Associations`
*Rôle : Registre des associations.*
| Champ de l'interface (Description) | ID Colonne (Grist JS) | Type Grist Recommandé | Notes |
|---|---|---|---|
| Nom de l'asso | `Nom_Asso` | Text | |
| Représentant (Lien Utilisateur) | `Representant` | Reference | Pointe vers `Utilisateurs` |
| Numéro RNA | `Numero_RNA` | Text | Identifiant officiel |

---

### Table : `Reservations`
*Rôle : Historique des locations de salles.*
| Champ de l'interface (Description) | ID Colonne (Grist JS) | Type Grist Recommandé | Notes |
|---|---|---|---|
| Salle concernée | `Salle_Ref` | Reference | Pointe vers `Salles` |
| Demandeur | `Demandeur_Ref` | Reference | Pointe vers `Utilisateurs` |
| Date de début | `Date_Debut` | Date/DateTime | |
| Date de fin | `Date_Fin` | Date/DateTime | |
| Statut | `Statut` | Choice | `En_attente`, `Validee`, `Refusee` |

---

### Table : `Subventions`
*Rôle : Suivi des versements aux associations.*
| Champ de l'interface (Description) | ID Colonne (Grist JS) | Type Grist Recommandé | Notes |
|---|---|---|---|
| Association | `Asso_Ref` | Reference | Pointe vers `Associations` |
| Montant accordé | `Montant` | Numeric | |
| Statut | `Statut` | Choice | `En_cours`, `Validee`, `Cloturee` |
| Catégorie | `Categorie` | Choice | Sport, Culture, etc. |

---

### Table : `RendezVous`
*Rôle : Agendas des agents.*
| Champ de l'interface (Description) | ID Colonne (Grist JS) | Type Grist Recommandé | Notes |
|---|---|---|---|
| Demandeur | `Demandeur_Ref` | Reference | Pointe vers `Utilisateurs` |
| Agent assigné | `Agent_Ref` | Reference | Pointe vers `Utilisateurs` (Role=agent) |
| Objet du RDV | `Objet` | Text | |
| Date et Heure | `Date_Heure` | DateTime | |

---

### Table : `Guichet_Demandes`
*Rôle : Ticketing / Suivi des sollicitations diverses.*
| Champ de l'interface (Description) | ID Colonne (Grist JS) | Type Grist Recommandé | Notes |
|---|---|---|---|
| Demandeur | `Demandeur_Ref` | Reference | Pointe vers `Utilisateurs` |
| Canal d'arrivée | `Canal` | Choice | `Email`, `Tel`, `Guichet`, `Courrier` |
| Nature du problème | `Description` | Text | |
| Statut | `Statut` | Choice | `Recue`, `En_cours`, `Resolue` |
| Priorité | `Priorite` | Choice | `Urgente`, `Normale`, `Basse` |
| Agent en charge | `Agent_Traiteur`| Reference | Pointe vers `Utilisateurs` (Role=agent)|

---

### Table : `Reunions`
*Rôle : Centraliser l'ordre du jour et les PDF.*
| Champ de l'interface (Description) | ID Colonne (Grist JS) | Type Grist Recommandé | Notes |
|---|---|---|---|
| Titre de la réunion | `Titre` | Text | |
| Date | `Date` | Date | |
| Ordre du jour | `Ordre_Jour` | Text | |
| Décisions actées | `Decisions` | Text | |

---

### Table : `Actions_Reunions`
*Rôle : Les actions découlant d'une réunion (To-Do).*
| Champ de l'interface (Description) | ID Colonne (Grist JS) | Type Grist Recommandé | Notes |
|---|---|---|---|
| Réunion source | `Reunion_Ref` | Reference | Pointe vers `Reunions` |
| Description à faire | `Action` | Text | |
| Statut | `Statut` | Choice | `A_faire`, `En_cours`, `Termine` |
| Échéance | `Date_Echeance` | Date | |

