# Spec fonctionnelle — CRM Interne v2.2
**Destinataires :** Référent métier, managers, commerciaux

---

## Contexte et objectifs

L'entreprise (ESN ~50 personnes) utilise Salesforce comme CRM. L'objectif est de le remplacer par un outil interne hébergé sur notre infrastructure, présenté comme une application web complète intégrée dans Grist.

L'outil remplace : gestion des clients, des contacts et des opportunités commerciales.

---

## Hors périmètre v1

- Notifications et alertes automatiques
- Intégration messagerie (Gmail, Outlook)
- Automatisation des relances commerciales
- Vue Kanban du pipeline
- Import Salesforce en continu

---

## Acteurs et rôles

| Rôle | Qui ? | Nombre |
|---|---|---|
| Admin | Administrateur technique unique | 1 |
| Commercial | Chargés d'affaires et responsables commerciaux | N |

---

## Droits par rôle

| Action | Commercial | Admin |
|---|---|---|
| Voir tous les enregistrements (Comptes, Contacts, Opportunités) | ✅ | ✅ |
| Créer une opportunité | ✅ | ✅ |
| Modifier une opportunité | ✅ si Responsable uniquement | ✅ toutes |
| Supprimer une opportunité | ✅ si Responsable uniquement | ✅ toutes |
| Créer / modifier / supprimer un Compte | ✅ | ✅ |
| Créer / modifier / supprimer un Contact | ✅ | ✅ |
| Clôturer une opportunité comme Perdue | ✅ si Responsable (raison obligatoire) | ✅ |
| Tableau de bord | ✅ Lecture | ✅ Complet |
| Ajouter des champs personnalisés | ✗ | ✅ |
| Gérer les accès utilisateurs | ✗ | ✅ |

**Règle de périmètre :** un commercial peut modifier et supprimer uniquement les opportunités pour lesquelles il est désigné Responsable. Il voit toutes les opportunités en lecture.

**Cas particulier :** un commercial sans opportunité assignée accède à l'outil en lecture seule sur les opportunités.

---

## Cycle de vie / Workflow

Le commercial fait avancer une opportunité en changeant son étape. Aucune étape n'est bloquante — il est possible de revenir en arrière ou de sauter des étapes.

| Ordre | Étape | Ce qui se passe | Qui agit |
|---|---|---|---|
| — | Aucune | Créée, non qualifiée | Commercial responsable |
| 1 | Qualification | Premier contact établi, intérêt confirmé | Commercial responsable |
| 2 | Découverte | Besoins identifiés | Commercial responsable |
| 3 | Solution | Solution proposée oralement ou en atelier | Commercial responsable |
| 4 | Proposition | Offre formelle envoyée | Commercial responsable |
| 5 | Négociation | Discussions contractuelles en cours | Commercial responsable |
| 6 | Closing | Accord verbal obtenu, signature en cours | Commercial responsable |
| 7 | Commit | Signé, démarrage imminent | Commercial responsable |
| ✓ | Closed Won | Deal gagné et mission démarrée | Commercial responsable |
| ✗ | Closed Lost | Deal perdu — raison de perte obligatoire | Commercial responsable |

### Clôture d'une opportunité

**Closed Won :** le commercial passe l'étape à « Gagné ». Aucun champ supplémentaire obligatoire.

**Closed Lost :** le commercial passe l'étape à « Perdu ». Le champ **Raison de perte** devient obligatoire — la sauvegarde est bloquée tant qu'il n'est pas renseigné.

---

## Règles métier / fonctionnelles

| # | Titre | Description |
|---|---|---|
| R-01 | Confirmation de suppression | Toute suppression déclenche une fenêtre de confirmation. Le message indique le nom de l'élément. |
| R-02 | Suppression d'un Compte | Les Contacts et Opportunités liés restent en base — pas de suppression en cascade. |
| R-03 | Responsable obligatoire | Chaque opportunité doit avoir un responsable commercial identifié (sélectionné dans la liste des utilisateurs). |
| R-04 | Champs obligatoires | Compte : nom. Contact : prenom, nom, compte rattaché. Opportunité : titre, compte, responsable, statut. |
| R-05 | Raison de perte obligatoire | Le passage à Closed Lost est bloqué si la raison de perte n'est pas renseignée. |
| R-06 | Montants | Une opportunité porte trois champs financiers indépendants et optionnels : Montant global, Montant N (part facturable année en cours), Montant N+1 (part facturable année suivante). |
| R-07 | Champs custom | L'admin peut ajouter des colonnes sur n'importe quelle entité directement dans Grist, sans développement. |
| R-08 | Pagination | Les listes affichent 20 enregistrements par page. |
| R-09 | Identification utilisateur | L'outil identifie automatiquement l'utilisateur connecté pour appliquer les droits d'édition sur les opportunités. |
| R-10 | Historique activités | Chaque activité est horodatée (date et heure). Le compte rattaché est déduit automatiquement de l'opportunité — il n'est pas saisi manuellement. |

---

## Notifications

Aucune notification en v1.
