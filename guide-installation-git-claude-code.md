# Guide d'installation de Git pour Claude Code + GitHub Desktop

## 📋 Prérequis

- **Windows 10 ou 11**
- **Claude Desktop** installé
- **GitHub Desktop** installé (recommandé)
- Droits d'administration sur votre PC

## 🎯 Objectif

Installer Git de manière optimale pour utiliser **Claude Code** dans Claude Desktop, tout en restant compatible avec **GitHub Desktop** et sans avoir à utiliser la ligne de commande manuellement.

---

## 📥 Étape 1 : Télécharger Git

1. Rendez-vous sur : **https://gitforwindows.org/**
2. Cliquez sur **"Download"**
3. Le fichier d'installation se télécharge (environ 50 MB)
4. Lancez l'exécutable téléchargé

---

## ⚙️ Étape 2 : Configuration de l'installation

Suivez l'assistant d'installation avec les paramètres recommandés ci-dessous.

### 🔹 Écran 1 : Select Components

**Composants à cocher :**
- ☐ Additional icons (décoché)
- ☐ On the Desktop (décoché)
- ☐ Windows Explorer integration (décoché - vous avez GitHub Desktop)
- ☐ Open Git Bash here (décoché)
- ☐ Open Git GUI here (décoché)
- ☐ Git LFS (décoché sauf si vous travaillez avec de gros fichiers)
- ☐ Associate .git* configuration files (décoché)
- ✅ **Associate .sh files to be run with Bash** (coché)
- ☐ Check daily for Git for Windows updates (optionnel mais recommandé)
- ☐ Add a Git Bash Profile to Windows Terminal (optionnel)
- ☐ Scalar (décoché - inutile sauf pour très gros repos)

> **💡 Conseil :** Pour une installation minimale, seul "Associate .sh files" est vraiment nécessaire pour Claude Code.

**Cliquez sur "Next"**

---

### 🔹 Écran 2 : Choosing the default editor

**Choix recommandé :** 
- Sélectionnez **"Use Notepad as Git's default editor"** (Bloc-notes Windows)

> **Pourquoi ?** Vous n'éditerez presque jamais de fichiers Git manuellement. Le Bloc-notes est simple et déjà installé.

**Cliquez sur "Next"**

---

### 🔹 Écran 3 : Adjusting the name of the initial branch

**Choix recommandé :**
- ⚫ **"Let Git decide"** (option par défaut)

> **Pourquoi ?** Compatible avec tous les outils. GitHub Desktop et Claude Code s'adaptent automatiquement.

**Cliquez sur "Next"**

---

### 🔹 Écran 4 : Adjusting your PATH environment

**⚠️ CRUCIAL POUR CLAUDE CODE**

**Choix obligatoire :**
- ⚫ **"Git from the command line and also from 3rd-party software"** (Recommended)

> **Pourquoi ?** C'est ce qui permet à Claude Code d'utiliser Git automatiquement en arrière-plan.

**Cliquez sur "Next"**

---

### 🔹 Écran 5 : Choosing the SSH executable

**Choix recommandé :**
- ⚫ **"Use bundled OpenSSH"** (option par défaut)

> **Pourquoi ?** Tout est prêt à l'emploi, compatible avec GitHub Desktop.

**Cliquez sur "Next"**

---

### 🔹 Écran 6 : Choosing HTTPS transport backend

**Choix recommandé :**
- ⚫ **"Use the native Windows Secure Channel library"** (option par défaut)

> **Pourquoi ?** Meilleure intégration Windows, utilise les certificats système, plus sécurisé.

**Cliquez sur "Next"**

---

### 🔹 Écran 7 : Configuring the line ending conversions

**Choix recommandé :**
- ⚫ **"Checkout Windows-style, commit Unix-style line endings"** (option par défaut)

> **Pourquoi ?** Standard recommandé sur Windows. Compatible avec les équipes multi-plateformes.

**Cliquez sur "Next"**

---

### 🔹 Écran 8 : Configuring the terminal emulator

**Choix recommandé :**
- ⚫ **"Use MinTTY (the default terminal of MSYS2)"** (option par défaut)

> **Note :** Vous n'utiliserez probablement jamais Git Bash directement. Ce paramètre n'affecte pas Claude Code.

**Cliquez sur "Next"**

---

### 🔹 Écran 9 : Choose the default behavior of 'git pull'

**Choix recommandé :**
- ⚫ **"Fast-forward or merge"** (option par défaut)

> **Pourquoi ?** Comportement standard et automatique. Compatible avec GitHub Desktop.

**Cliquez sur "Next"**

---

### 🔹 Écran 10 : Choose a credential helper

**Choix recommandé :**
- ⚫ **"Git Credential Manager"** (option par défaut)

> **Pourquoi ?** Stocke vos identifiants GitHub de manière sécurisée. Vous ne retaperez pas votre token à chaque fois.

**Cliquez sur "Next"**

---

### 🔹 Écran 11 : Configuring extra options

**Options recommandées :**
- ✅ **Enable file system caching** (coché par défaut) ← **Gardez coché !**
- ☐ **Enable symbolic links** (décoché) ← **Laissez décoché**

> **File system caching** = Boost de performance gratuit
> **Symbolic links** = Inutile pour votre usage, peut poser des problèmes

**Cliquez sur "Install"**

---

### 🔹 Écran 12 : Completing the Git Setup Wizard

**Options finales :**
- ☐ **Launch Git Bash** (décoché - vous n'en avez pas besoin)
- ☐ **View Release Notes** (décoché - pas utile)

**Cliquez sur "Finish"**

---

## ✅ Étape 3 : Vérification de l'installation

### Option A : Vérification rapide (ligne de commande)

1. Ouvrez **Command Prompt** (Invite de commandes)
   - Tapez `cmd` dans la barre de recherche Windows
2. Tapez la commande :
   ```bash
   git --version
   ```
3. Vous devriez voir :
   ```
   git version 2.53.0.2
   ```

### Option B : Vérification dans Claude Desktop

1. **Fermez complètement** Claude Desktop (si ouvert)
2. **Relancez** Claude Desktop
3. Claude Code détectera automatiquement Git
4. Vous pouvez maintenant utiliser Claude Code pour coder ! 🎉

---

## 🔧 Configuration post-installation (optionnel)

### Configurer votre identité Git

Même si GitHub Desktop gère déjà ça, vous pouvez configurer votre identité globale :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@exemple.com"
```

> **Note :** Utilisez la même adresse email que votre compte GitHub.

---

## 🧪 Tester Claude Code

1. Ouvrez **Claude Desktop**
2. Créez un nouveau chat
3. Demandez à Claude : *"Peux-tu créer un petit projet Python avec Git ?"*
4. Claude Code devrait automatiquement :
   - Initialiser un dépôt Git
   - Créer les fichiers
   - Faire des commits

---

## 🤝 Compatibilité avec GitHub Desktop

**Bonne nouvelle :** Cette installation est 100% compatible avec GitHub Desktop !

- ✅ GitHub Desktop continuera de fonctionner normalement
- ✅ Les deux outils partagent la même installation de Git
- ✅ Les identifiants sont partagés via Git Credential Manager
- ✅ Aucun conflit, aucune configuration supplémentaire nécessaire

---

## ❓ FAQ - Questions fréquentes

### Est-ce que Git donne accès à tout mon PC ?

**Non.** Git est juste un outil de versioning. Claude Code ne voit que les dossiers/projets que **vous lui partagez explicitement**. C'est comme installer Microsoft Word - ça ne donne pas accès à tous vos documents.

### Dois-je apprendre les commandes Git ?

**Non.** Vous utilisez GitHub Desktop pour l'interface graphique et Claude Code gère Git automatiquement en arrière-plan. Vous ne taperez jamais de commandes manuellement.

### Que faire si Claude Code ne détecte pas Git ?

1. Vérifiez que Git est bien installé : `git --version` dans Command Prompt
2. Redémarrez complètement Claude Desktop
3. Redémarrez votre ordinateur (pour que le PATH soit mis à jour)

### Puis-je désinstaller Git après ?

Oui, mais Claude Code ne fonctionnera plus. Git est nécessaire pour que Claude Code puisse gérer les versions de votre code.

### Git prend-il beaucoup d'espace disque ?

Non, environ **320 MB** avec la configuration minimale recommandée ci-dessus.

---

## 📝 Résumé de la configuration optimale

| Paramètre | Choix recommandé | Pourquoi |
|-----------|------------------|----------|
| **Components** | Minimal (juste .sh files) | Pas de bloat, juste l'essentiel |
| **Editor** | Notepad | Simple, déjà installé |
| **Initial branch** | Let Git decide | Compatible avec tout |
| **PATH** | Command line + 3rd-party | **CRUCIAL pour Claude Code** |
| **SSH** | Bundled OpenSSH | Prêt à l'emploi |
| **HTTPS** | Windows Secure Channel | Intégration Windows |
| **Line endings** | Windows-style checkout | Standard Windows |
| **Terminal** | MinTTY | Par défaut (peu importe) |
| **git pull** | Fast-forward or merge | Standard et automatique |
| **Credentials** | Git Credential Manager | Sécurité + pas de re-saisie |
| **File caching** | Enabled | Performance boost |
| **Symbolic links** | Disabled | Pas nécessaire |

---

## 🆘 Support et ressources

- **Documentation Git officielle :** https://git-scm.com/doc
- **GitHub Desktop :** https://desktop.github.com/
- **Claude Code :** Disponible dans Claude Desktop
- **Support Anthropic :** https://support.anthropic.com/

---

## 📄 Licence

Ce guide est libre d'utilisation et de partage au sein de votre organisation.

**Version :** 1.0  
**Date :** Avril 2026  
**Testé avec :** Git 2.53.0.2, Claude Desktop, GitHub Desktop

---

**✨ Bon développement avec Claude Code ! ✨**
