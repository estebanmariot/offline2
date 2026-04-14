# Spécification Technique — Portail Mairie SPA (Grist Widget)

## 1. Architecture "Single Page"

Le widget sera conçu de manière monolithique (idéalement centralisé dans un fichier `index.html` ou séparé de manière très minimale en 3 fichiers purs : `.html`, `.js`, et un brin de CSS personnalisé si Tailwind ne suffit pas). Nous utiliserons la stack suivante :
- **HTML5** : Structure sémantique du DOM.
- **Tailwind CSS (CDN)** : `<script src="https://cdn.tailwindcss.com"></script>` pour un rendu premium, moderne et responsive directement en classe HTML sans étape de compilation (build-step).
- **Vanilla JavaScript ES6+** : Gestion de l'état, de la navigation entre les vues et manipulation du DOM dynamique.
- **Grist Plugin API** : `<script src="https://docs.getgrist.com/grist-plugin-api.js"></script>`

## 2. Structure du DOM (Vues et Routage)

N'ayant pas de routeur frontend (comme React Router), la navigation se fera par l'affichage/masquage conditionnel de conteneurs de vues.

```html
<!-- Squelette HTML typique d'une SPA Vanilla -->
<div id="app" class="min-h-screen bg-slate-50 flex">
  
  <!-- Sidebar de navigation (Menus générés dynamiquement selon le Rôle) -->
  <nav id="app-sidebar" class="w-64 bg-slate-900 text-white hidden md:block">
     <!-- Liens de navigation -->
  </nav>
  
  <!-- Conteneur principal -->
  <main class="flex-1 p-6 overflow-y-auto">
    <!-- Vues masquables via la classe .hidden de Tailwind -->
    <section id="view-dashboard" class="app-view active">...</section>
    <section id="view-salles" class="app-view hidden">...</section>
    <section id="view-assos" class="app-view hidden">...</section>
    <section id="view-rdv" class="app-view hidden">...</section>
    <section id="view-guichet" class="app-view hidden">...</section>
    <section id="view-reunions" class="app-view hidden">...</section>
  </main>

</div>
```

## 3. Gestion de l'état global (State Management)

Toute l'information vitale (données provenant de Grist, rôle de l'utilisateur, état de l'UI) sera centralisée dans un objet JavaScript global pour avoir l'équivalent d'un "Store".

```javascript
const AppState = {
  currentUser: { email: '', role: 'visiteur' }, // 'citoyen', 'association', 'agent'
  currentView: 'dashboard',
  gristData: {
    salles: [],
    associations: [],
    // Données mises en cache pour limiter les appels docApi
  }
};
```

## 4. Cycle de Vie et Grist API

Le cycle de vie de l'application s'appuiera fortement sur Grist.

**Cinématique d'initialisation :**
1. `grist.ready({ requiredAccess: 'full' })` informe Grist que le widget est prêt.
2. `grist.onRecord((record) => { ... })` captera le changement de ligne si le widget est lié à une table Grist spécifique, pour actualiser des composants contextuels (ex: détail d'une salle sélectionnée).
3. Lors de l'initialisation, lecture des droits via `grist.docApi` pour connaître l'utilisateur courant et ses permissions.
4. Le moteur JS mettra à jour l'interface via une collection de petites fonctions DOM génératrices.

## 5. Composants UI (Vanilla)

Pour simuler des "composants" et éviter du code spaghetti, l'interface sera construite via des fonctions retournant un Template Literal HTML.

```javascript
// Exemple de fonction composant UI
function renderCard(title, value, iconTemplate) {
  return `
    <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div class="flex items-center space-x-4">
        ${iconTemplate}
        <div>
          <h3 class="text-slate-500 text-sm font-medium">${title}</h3>
          <p class="text-2xl font-bold text-slate-800">${value}</p>
        </div>
      </div>
    </div>
  `;
}
```

## 6. Intégration Tailwind CSS et Charte

Nous configurerons Tailwind via la balise script pour inclure les couleurs officielles du Portail Mairie (ex: Bleu et Rouge "République"). Pas besoin de NPM ou PostCSS.

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          mairieBlue: '#0055A4',
          mairieRed: '#EF4135'
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'], // Import via Google Fonts
        }
      }
    }
  }
</script>
```
