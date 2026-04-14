# Jeu de données de test — Portail Mairie

Pour importer ces données, vous pouvez **copier les tableaux ci-dessous** et les **coller directement dans vos tables Grist** (en sélectionnant la première cellule d'une ligne vide). Alternativement, vous pouvez créer vous-même les lignes en vous inspirant de ce contenu.

---

### 1. Table : `Utilisateurs`
*(Attention : Assurez-vous de créer ces utilisateurs en premier, car les autres tables feront référence à leurs noms)*

| Email | Nom_Complet | Role | Telephone |
|---|---|---|---|
| jean.dupont@email.com | Jean Dupont | citoyen | 0601020304 |
| marie.curie@asso-science.org | Marie Curie | association | 0611223344 |
| agent.accueil@mairie.fr | Agent Accueil | agent | 0140506070 |
| responsable.salles@mairie.fr| Paul Responsable | agent | 0140506071 |
| foot.club@email.com | Club de Football | association | 0699887766 |

---

### 2. Table : `Salles`

| Nom_Salle | Capacite | Adresse | Est_Reservable | Taille | Prix |
|---|---|---|---|---|---|
| Salle Polyvalente | 250 | 1 Place de la Mairie | true | 300 | 150 |
| Gymnase Jean Jaurès | 500 | 12 Rue des Sports | true | 800 | 300 |
| Salle de Réunion A | 15 | 1 Place de la Mairie | true | 40 | 0 |
| Salle de Réunion B | 20 | 1 Place de la Mairie | false | 50 | 0 |
| Espace Culturel | 100 | 5 Rue des Arts | true | 150 | 80 |

---

### 3. Table : `Associations`
*(Pour la colonne Representant, j'inscris le Nom Complet. Dans Grist, s'il s'agit d'une colonne de type "Reference", tapez simplement le nom et Grist fera le lien).*

| Nom_Asso | Representant | Numero_RNA |
|---|---|---|
| Association Science & Avenir | Marie Curie | W123456789 |
| Football Club Municipal | Club de Football | W987654321 |

---

### 4. Table : `Reservations`

| Salle_Ref | Demandeur_Ref | Date_Debut | Date_Fin | Statut |
|---|---|---|---|---|
| Salle Polyvalente | Marie Curie | `2026-05-15 18:00` | `2026-05-15 23:00` | Validee |
| Gymnase Jean Jaurès | Club de Football | `2026-05-20 14:00` | `2026-05-20 18:00` | En_attente |
| Espace Culturel | Jean Dupont | `2026-06-01 09:00` | `2026-06-01 12:00` | Refusee |

---

### 5. Table : `Subventions`

| Asso_Ref | Montant | Statut | Categorie |
|---|---|---|---|
| Association Science & Avenir | 2500 | Validee | Culture |
| Football Club Municipal | 8000 | En_cours | Sport |
| Football Club Municipal | 1500 | Cloturee | Sport |

---

### 6. Table : `RendezVous`

| Demandeur_Ref | Agent_Ref | Objet | Date_Heure |
|---|---|---|---|
| Jean Dupont | Agent Accueil | Demande passeport | `2026-04-20 10:30` |
| Marie Curie | Paul Responsable | Visite Salle Polyvalente| `2026-04-22 14:00` |

---

### 7. Table : `Guichet_Demandes`

| Demandeur_Ref | Canal | Description | Statut | Priorite | Agent_Traiteur |
|---|---|---|---|---|---|
| Jean Dupont | Email | Problème d'éclairage rue principale | En_cours | Normale | Agent Accueil |
| Club de Football | Tel | Infiltration d'eau au gymnase | Recue | Urgente | Paul Responsable |
| Marie Curie | Guichet | Dépôt dossier subvention papier | Resolue | Basse | Agent Accueil |

---

### 8. Table : `Reunions`

| Titre | Date | Ordre_Jour | Decisions |
|---|---|---|---|
| Commission Subventions | `2026-04-10` | Examen des dossiers T2 | Budget alloué au club de foot. |
| Réunion de Chantier Gymnase| `2026-04-15` | Point sur les infiltrations | Lancer expertise toiture. |

---

### 9. Table : `Actions_Reunions`

| Reunion_Ref | Action | Statut | Date_Echeance |
|---|---|---|---|
| Commission Subventions | Éditer notification Club de Foot | Termine | `2026-04-12` |
| Réunion de Chantier Gymnase| Appeler couvreur pour devis | A_faire | `2026-04-20` |
| Réunion de Chantier Gymnase| Poser bâche temporaire | En_cours | `2026-04-16` |
