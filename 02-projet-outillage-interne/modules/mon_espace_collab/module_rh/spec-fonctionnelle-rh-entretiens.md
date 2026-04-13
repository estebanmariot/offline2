# Spec fonctionnelle — Module RH : Entretiens annuels
**Version :** 1.2  
**Date :** 2026-04  
**Destinataires :** Référent RH, parties prenantes métier  
**Statut :** Bloc 0 validé — Bloc 1 en cours

**Changelog v1.1 :**
- §3 : workflow conditionnel selon `avec_etape_manager` sur la campagne
- §4.2 : action "Valider" disponible sans étape manager
- §4.5 : Admin RH peut configurer `avec_etape_manager` sur une campagne
- §6 : notifications conditionnelles selon `avec_etape_manager`
- §7 (nouveau) : dates de planification par entretien

**Changelog v1.2 :**
- §3 : précision sur la sauvegarde à la volée (remplace le bouton Sauv)
- §4.2 : précision sur l'affichage colonne manager (masquée si sans étape manager)

---

## 1. Contexte et objectifs

Remplacer Lucca pour la gestion des campagnes d'entretiens annuels.

L'outil couvre environ 50 collaborateurs, avec une campagne par an. Il permet à chaque collaborateur de préparer son entretien, à son manager de compléter sa partie, puis au collaborateur de valider le document final.

Le suivi des objectifs est indépendant du cycle d'entretien : il est accessible toute l'année.

**Hors périmètre v1 :**
- Export PDF de l'entretien
- Modèles de campagne réutilisables d'une année sur l'autre
- Comparaison des entretiens entre années
- Pondération des objectifs
- Évaluation par plusieurs managers
- Entretiens intermédiaires (mi-année)

---

## 2. Acteurs et rôles

Quatre rôles sont définis. Un même collaborateur peut en cumuler plusieurs (ex : être manager de son équipe et référent de son pôle).

| Rôle | Qui ? |
|---|---|
| **Collaborateur** | Tout salarié de l'entreprise |
| **Manager** | Tout collaborateur responsable d'au moins une personne |
| **Référent pôle** | Un collaborateur désigné par pôle, rôle de consultation élargie |
| **Admin RH** | Personne(s) en charge de la gestion RH — droits étendus sur l'ensemble du module |

> Le rôle Admin RH est spécifique à ce module. Il ne donne pas accès aux autres outils (timesheets, CRM).

---

## 3. Cycle de vie d'un entretien

Le workflow dépend du paramètre **"Avec étape manager"** défini sur la campagne.

**Campagne avec étape manager (défaut) :**
```
Planifié → En préparation (collab) → En préparation (manager) → Publié → Validé
```

**Campagne sans étape manager (ex : Rapport d'étonnement) :**
```
Planifié → En préparation (collab) → Validé
```

| Étape | Qui agit | Ce qui se passe |
|---|---|---|
| **Planifié** | Admin RH | L'entretien est créé. Le collaborateur reçoit une notification par email. |
| **En préparation (collab)** | Collaborateur | Il remplit sa partie de l'entretien et la soumet quand il est prêt. |
| **En préparation (manager)** | Manager | *(si avec étape manager)* Il consulte les réponses du collaborateur, complète sa partie et publie. |
| **Publié** | Collaborateur | *(si avec étape manager)* Il consulte l'entretien complet (sa partie + celle du manager) et le valide. |
| **Validé** | — | L'entretien est clôturé. Plus aucune modification possible. |

**Règles importantes :**
- La sauvegarde est automatique à la volée pendant la saisie — il n'y a pas de bouton "Enregistrer". Un indicateur discret confirme chaque sauvegarde.
- Le collaborateur peut interrompre sa saisie et reprendre plus tard ; ses réponses sont conservées.
- Une fois soumis, le collaborateur ne peut plus modifier ses réponses.
- Une fois publié, le manager ne peut plus modifier sa partie.
- Pour les campagnes sans étape manager, la colonne manager n'est pas affichée dans le formulaire.

---

## 4. Droits par rôle

### 4.1 Qui voit quoi ?

| Ce que je vois dans l'outil | Collaborateur | Manager | Référent pôle | Admin RH |
|---|:---:|:---:|:---:|:---:|
| Mon propre entretien | ✅ | ✅ | ✅ | ✅ |
| Les entretiens de mes collaborateurs directs | — | ✅ | — | ✅ |
| Les entretiens de mon pôle | — | — | ✅ | ✅ |
| Tous les entretiens | — | — | — | ✅ |
| Mes propres objectifs | ✅ | ✅ | ✅ | ✅ |
| Les objectifs de mes collaborateurs directs | — | ✅ | — | ✅ |
| Les objectifs de mon pôle | — | — | ✅ | ✅ |
| Tous les objectifs | — | — | — | ✅ |

> Un collaborateur qui est aussi manager voit son propre entretien **et** ceux de ses directs.

---

### 4.2 Que puis-je faire sur un entretien ?

| Action | Collaborateur | Manager | Référent pôle | Admin RH |
|---|:---:|:---:|:---:|:---:|
| Remplir ma partie (réponses, auto-évaluation) | ✅ si "En préparation collab" | — | — | — |
| Soumettre mon entretien | ✅ si "En préparation collab" | — | — | — |
| Lire les réponses du collaborateur | — | ✅ dès soumission | ✅ | ✅ |
| Remplir la partie manager | — | ✅ si "En préparation manager" | — | — |
| Publier l'entretien (le rendre visible au collab) | — | ✅ si "En préparation manager" | — | — |
| Valider l'entretien (clore définitivement) | ✅ si "Publié" **ou si campagne sans étape manager** | — | — | — |
| Consulter un entretien finalisé | ✅ | ✅ | ✅ | ✅ |

> Pour les campagnes sans étape manager, la colonne manager n'est pas affichée dans le formulaire.

---

### 4.3 Que puis-je faire sur les objectifs ?

Les objectifs sont accessibles toute l'année, indépendamment du cycle d'entretien.

| Action | Collaborateur | Manager | Référent pôle | Admin RH |
|---|:---:|:---:|:---:|:---:|
| Consulter mes objectifs / ceux de mon périmètre | ✅ | ✅ | ✅ | ✅ |
| Créer un objectif | ✅ | ✅ | ✅ | ✅ |
| Modifier le titre, le statut (réalisable / à risque) | — | ✅ | ✅ | ✅ |
| Saisir mon % d'avancement | ✅ (ma part) | ✅ (sa part manager) | — | — |
| Copier le % du collaborateur vers la part manager | — | ✅ | — | — |
| Supprimer un objectif | — | ✅ | ✅ | ✅ |

> **Séparation des évaluations :** chaque partie (collaborateur et manager) dispose de son propre % d'avancement. Le manager a le dernier mot sur le % final retenu.

---

### 4.4 Que puis-je faire sur les critères de réussite d'un objectif ?

Un critère de réussite est associé à un objectif. Il comporte un libellé et un seuil de % cible.

| Action | Collaborateur | Manager | Référent pôle | Admin RH |
|---|:---:|:---:|:---:|:---:|
| Consulter les critères | ✅ | ✅ | ✅ | ✅ |
| Ajouter un critère (libellé + seuil %) | ✅ | ✅ | ✅ | ✅ |
| Modifier le libellé ou le seuil d'un critère | ✅ | ✅ | ✅ | ✅ |
| Cocher "critère atteint" — ma propre évaluation | ✅ (ma case) | ✅ (sa case manager) | — | — |
| Supprimer un critère | — | ✅ | ✅ | ✅ |

> **Règle du plancher :** cocher un critère relève automatiquement le % d'avancement minimum à son seuil. Par exemple, cocher un critère à 75 % empêche de saisir un % inférieur à 75.

---

### 4.5 Ce que seul l'Admin RH peut faire

Les éléments de configuration du module sont réservés à l'Admin RH. Les autres rôles peuvent les consulter dans l'outil (pour que l'interface fonctionne) mais ne peuvent pas les créer, modifier ou supprimer.

| Élément | Ce que peut faire l'Admin RH |
|---|---|
| **Pôles** | Créer, modifier, supprimer un pôle ; désigner son référent |
| **Collaborateurs** | Gérer les fiches (manager, pôle, activation du rôle Admin RH) |
| **Campagnes** | Créer une campagne, définir ses dates limites, l'ouvrir ou la clôturer, paramétrer si l'étape manager est requise |
| **Sections et questions** | Composer le questionnaire d'une campagne |
| **Entretiens** | Créer les entretiens (associer un collaborateur à une campagne), saisir les dates de planification |

---

## 5. Suivi des objectifs — vue annuelle

Pour chaque entretien, les objectifs sont présentés sur trois années :

| Période | Contenu |
|---|---|
| **Bilan N-1** | Objectifs de l'année précédente — avec % d'avancement final |
| **Suivi N** | Objectifs de l'année en cours — avec % d'avancement |
| **Objectifs N+1** | Objectifs de l'année suivante — sans % d'avancement |

---

## 6. Notifications email

Les personnes concernées reçoivent automatiquement un email à chaque étape clé. Certaines notifications ne s'appliquent que si la campagne inclut l'étape manager.

| Événement | Destinataire | Objet du mail | Condition |
|---|---|---|---|
| Entretien ouvert | Collaborateur | "Votre entretien annuel est ouvert" | Toujours |
| Collaborateur a soumis | Manager | "[Prénom Nom] a soumis son entretien" | Si `avec_etape_manager` |
| Entretien publié par le manager | Collaborateur | "Votre entretien a été publié — à valider" | Si `avec_etape_manager` |

---

## 7. Dates de planification d'un entretien

Chaque entretien dispose de deux dates individuelles, saisies par l'Admin RH via l'IHM native Grist :

| Champ | Rôle | Caractère |
|---|---|---|
| **Date limite de préparation** | Indique au collaborateur jusqu'à quand préparer son entretien | Informatif uniquement — ne bloque pas la soumission |
| **Date de l'entretien** | Date physique du rendez-vous | Informatif |

Ces dates sont affichées dans l'en-tête du formulaire à titre indicatif. Elles n'ont pas d'effet bloquant sur le workflow.
