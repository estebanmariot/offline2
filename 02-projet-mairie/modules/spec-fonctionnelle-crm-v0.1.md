# Spec fonctionnelle — Portail Mairie v0.1

## 1. Contexte global
Le Portail Mairie centralise sur une même interface plusieurs services administratifs. L'affichage s'adapte au rôle de l'utilisateur : Citoyen, Association, ou Agent de mairie.

## 2. Module : Location des Salles et Matériel
**Accès :** Tout le monde
* **Base de données :** Fiches caractéristiques pour chaque salle (capacité, adresse, tarif, jours disponibles).
* **Processus :** Réservation liée automatiquement à une salle.
* **Fonctionnalités :** * Vue calendrier avec disponibilités en temps réel (pour éviter les conflits).
  * Calcul automatique du taux d'occupation.
  * Formulaire public pour soumission directe des demandes (sans email/téléphone).

## 3. Module : Suivi des Associations et Subventions
**Accès :** Associations + Agents de Mairie
* **Base de données :** Registre complet (coordonnées, représentants, statuts).
* **Processus :** Chaque association possède une fiche reliée à un historique de demandes (subventions, événements).
* **Fonctionnalités :**
  * Table des versements (montants, dates, conditions).
  * Tableaux de bord synthétiques (budget par asso, par année, par catégorie).
  * Suivi d'état des dossiers par les agents (En cours, Validé, Clôturé).

## 4. Module : Gestion des Rendez-vous
**Accès :** Tout le monde
* **Base de données :** RDV liant un Agent, un Demandeur, et un Objet précis.
* **Fonctionnalités :**
  * Vue calendrier (hebdomadaire/mensuelle) par service.
  * RLS (Sécurité) : Un agent ne voit que ses propres RDV, le manager voit tout.
  * Formulaire de demande en ligne pour le public.

## 5. Module : Suivi des Demandes (Guichet unique)
**Accès :** Agents de Mairie uniquement
* **Base de données :** Traçabilité des interactions (email, tel, courrier, guichet physique).
* **Champs requis :** Date, Canal, Demandeur, Nature du problème, Agent responsable, Statut (Reçue, En cours, Résolue, Urgente).
* **Fonctionnalités :**
  * Tableau de bord avec système de drapeaux/priorités (mise en avant des urgences).
  * KPIs : mesure des délais de traitement, identification des problèmes récurrents.

## 6. Module : Gestion des Réunions et Comptes Rendus (CR)
**Accès :** Agents de Mairie uniquement
* **Base de données :** Fiches de réunions liant des Participants (agents/externes) et des Projets.
* **Champs requis :** Ordre du jour, Décisions, Actions à suivre (avec statut : à faire, en cours, terminé et date d'échéance).
* **Fonctionnalités avancées :**
  * Remplacement des CR Word : édition et gestion native sur la plateforme.
  * **Intégration IA :** Enregistrement audio de la réunion transcrit et résumé automatiquement en texte dans Grist.
  * **Export :** Génération et transmission de PDF pour les personnes extérieures.