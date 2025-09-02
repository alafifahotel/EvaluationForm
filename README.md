# Al Afifa Hotel - Système d'Évaluation du Personnel

Application web pour gérer les évaluations du personnel de l'Al Afifa Hotel avec génération automatique de fiches d'évaluation en PDF.

## 🚀 Fonctionnalités

- ✅ **8 postes différents** avec critères spécifiques
- ✅ **Formulaire dynamique** adapté à chaque poste
- ✅ **Prévisualisation A4 en temps réel**
- ✅ **Génération PDF** pour impression
- ✅ **Sauvegarde sur GitHub** via API
- ✅ **Historique des évaluations** avec filtres
- ✅ **Calcul automatique** des scores et appréciations

## 📋 Postes disponibles

1. Réception
2. Housekeeping
3. Restauration (Serveurs/Commis)
4. Cuisine
5. Maintenance/Techniciens
6. Portiers (Doormen/Bagagistes)
7. Équipiers (Room Attendants/Public Areas)
8. Plongeurs (Stewards)

## 🛠️ Installation

### Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Token GitHub avec permissions de lecture/écriture sur le repo

### Étapes d'installation

1. Cloner le repository
```bash
git clone https://github.com/wissamyah/EvaluationForm.git
cd EvaluationForm
```

2. Installer les dépendances
```bash
npm install
```

3. Lancer l'application en développement
```bash
npm run dev
```

4. Ouvrir dans le navigateur
```
http://localhost:5173
```

## 🔐 Configuration GitHub

Au premier lancement, l'application demandera votre token GitHub. Ce token doit avoir les permissions suivantes :
- `repo` (accès complet aux repositories privés)
- `write:packages` (optionnel)

Le token est stocké localement dans le navigateur (localStorage).

### Créer un token GitHub

1. Aller sur GitHub → Settings → Developer settings → Personal access tokens
2. Cliquer sur "Generate new token (classic)"
3. Sélectionner les permissions `repo`
4. Générer et copier le token

## 📱 Utilisation

### Créer une nouvelle évaluation

1. Sélectionner le poste dans le menu déroulant
2. Remplir les informations générales de l'employé
3. Noter chaque critère sur 5
4. Les scores et l'appréciation se calculent automatiquement
5. Cliquer sur "Enregistrer l'évaluation"
6. Télécharger le PDF si nécessaire

### Consulter l'historique

1. Cliquer sur l'onglet "Historique"
2. Utiliser les filtres pour rechercher
3. Voir ou télécharger les évaluations passées

## 🏗️ Structure du projet

```
EvaluationForm/
├── src/
│   ├── components/
│   │   ├── EvaluationForm.jsx     # Formulaire principal
│   │   ├── PreviewA4.jsx          # Prévisualisation PDF
│   │   └── HistoryTab.jsx         # Historique des évaluations
│   ├── data/
│   │   └── criteriaConfig.js      # Configuration des critères
│   ├── services/
│   │   └── githubService.js       # API GitHub
│   └── App.jsx                    # Composant principal
├── evaluations/                   # Dossier des évaluations (GitHub)
│   └── [YYYY]/[MM]/              # Organisation par date
└── package.json
```

## 📊 Format des données

Les évaluations sont sauvegardées en JSON avec la structure suivante :
```json
{
  "nom": "Nom de l'employé",
  "matricule": "12345",
  "service": "Réception",
  "commonScores": { ... },
  "specificScores": { ... },
  "totalScore": 85,
  "percentage": "85.0",
  "appreciation": "Très Bon",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🚀 Déploiement

### GitHub Pages

1. Build l'application
```bash
npm run build
```

2. Déployer sur GitHub Pages
```bash
npm run deploy
```

L'application sera accessible à : `https://wissamyah.github.io/EvaluationForm`

## 📝 Notes de développement

- **Framework**: React avec Vite
- **Styling**: Tailwind CSS
- **PDF**: jsPDF + html2canvas
- **GitHub API**: Octokit.js
- **Dates**: date-fns

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est développé pour l'Al Afifa Hotel.

## 📧 Contact

Pour toute question ou support, veuillez contacter l'équipe de développement.