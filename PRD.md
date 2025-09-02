# 📋 Product Requirements Document (PRD)
## Al Afifa Hotel - Système d'Évaluation du Personnel

### 📅 Date de création: 02/09/2025
### 📝 Version: 1.0

---

## 1. Vue d'ensemble

### Objectif du Projet
Créer une application web monopage pour gérer les évaluations du personnel de l'Al Afifa Hotel, avec génération automatique de fiches d'évaluation en PDF.

### Contexte
L'Al Afifa Hotel nécessite un système digital pour remplacer les évaluations papier du personnel, permettant une meilleure traçabilité et efficacité dans le processus d'évaluation.

### Utilisateurs cibles
- Managers et superviseurs de l'hôtel
- Département RH
- Direction de l'hôtel

---

## 2. Fonctionnalités Principales

### 2.1 Page d'Accueil
- **Dropdown principal** pour sélection du service/poste
- **Navigation par onglets** (Nouvelle Évaluation / Historique)
- **Interface entièrement en français**
- **Gestion du token GitHub** (première utilisation)

### 2.2 Formulaire d'Évaluation

#### Champs Généraux (tous postes)
- Nom & Prénom (requis)
- Matricule (requis)
- Service (auto-rempli selon sélection)
- Poste (auto-rempli selon sélection)
- Supérieur hiérarchique (requis)
- Période d'évaluation (date picker, requis)

#### Critères Communs (notation /5)
1. Ponctualité & Assiduité
2. Présentation & Hygiène
3. Discipline & Respect des règles
4. Esprit d'équipe
5. Attitude client

#### Critères Spécifiques
4-5 critères selon le poste sélectionné parmi:
- Réception (4 critères)
- Housekeeping (4 critères)
- Restauration (4 critères)
- Cuisine (4 critères)
- Maintenance/Techniciens (5 critères)
- Portiers (5 critères)
- Équipiers (4 critères)
- Plongeurs (5 critères)

#### Section Finale
- Calcul automatique du score total
- Pourcentage de réussite
- Appréciation générale (auto-calculée):
  - Excellent (90-100%)
  - Très Bon (80-89%)
  - Bon (70-79%)
  - À améliorer (60-69%)
  - Insuffisant (0-59%)
- Cases à cocher pour décisions/recommandations
- Champs signature avec date

### 2.3 Prévisualisation A4
- **Mise à jour en temps réel** lors de la saisie
- **Format A4 standard** (210mm x 297mm)
- **Mise en page professionnelle**
- **Logo de l'hôtel** (optionnel)
- **Bouton de génération PDF**

### 2.4 Sauvegarde & Export
- **Bouton "Enregistrer en PDF"** avec téléchargement automatique
- **Sauvegarde sur GitHub** via API
- **Structure de fichiers organisée** par année/mois
- **Génération nom fichier automatique**: `EVAL_[Service]_[Nom]_[Date].pdf`
- **Format de sauvegarde JSON** pour les données

### 2.5 Onglet Historique
- **Liste toutes les évaluations** sauvegardées
- **Filtres disponibles**:
  - Par Service
  - Par Date (from/to)
  - Par Score minimum
- **Actions disponibles**:
  - Voir (ouvre en preview)
  - Télécharger (PDF)
  - Dupliquer (préremplir nouveau formulaire)
- **Affichage tableau** avec tri possible

---

## 3. Exigences Techniques

### 3.1 Architecture
- **Single Page Application (SPA)** avec React
- **Responsive design** (desktop priorité)
- **Performance optimisée** (lazy loading des composants)

### 3.2 Intégrations
- **GitHub API integration** via Octokit.js
- **PDF generation côté client** (jsPDF + html2canvas)
- **Local storage** pour:
  - Token GitHub
  - Drafts temporaires
  - Cache des évaluations

### 3.3 Sécurité
- **Token GitHub sécurisé** (stockage localStorage)
- **Validation des formulaires** côté client
- **Sanitization des données** avant sauvegarde

### 3.4 Compatibilité
- **Navigateurs supportés**:
  - Chrome (dernières 2 versions)
  - Firefox (dernières 2 versions)
  - Safari (dernières 2 versions)
  - Edge (dernières 2 versions)
- **Résolution minimale**: 1280x720

---

## 4. Exigences Non-Fonctionnelles

### 4.1 Performance
- Temps de chargement initial < 3 secondes
- Génération PDF < 2 secondes
- Sauvegarde GitHub < 5 secondes

### 4.2 Utilisabilité
- Interface intuitive sans formation requise
- Messages d'erreur clairs en français
- Feedback visuel sur les actions

### 4.3 Accessibilité
- Navigation au clavier possible
- Labels appropriés pour tous les champs
- Contraste suffisant pour lisibilité

### 4.4 Maintenabilité
- Code modulaire et réutilisable
- Documentation technique complète
- Tests unitaires pour fonctions critiques

---

## 5. Contraintes

### 5.1 Techniques
- Dépendance au token GitHub pour sauvegarde
- Limite de taille des fichiers GitHub (100MB)
- Connexion internet requise pour synchronisation

### 5.2 Business
- Interface exclusivement en français
- Respect du format d'évaluation existant
- Compatibilité avec processus RH actuel

---

## 6. Critères de Succès

### 6.1 Métriques Quantitatives
- ✅ 100% des 8 postes configurés
- ✅ Génération PDF fonctionnelle
- ✅ Sauvegarde GitHub opérationnelle
- ✅ Interface responsive sur desktop

### 6.2 Métriques Qualitatives
- Adoption par les managers
- Réduction du temps d'évaluation
- Amélioration de la traçabilité
- Satisfaction utilisateur

---

## 7. Risques & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Token GitHub expiré | Haut | Moyen | Gestion d'erreur + notification |
| Perte de connexion | Moyen | Moyen | Cache local + retry automatique |
| Incompatibilité navigateur | Bas | Bas | Polyfills + tests cross-browser |
| Volume de données | Moyen | Bas | Pagination + archivage annuel |

---

## 8. Évolutions Futures (Phase 2)

- 📊 **Dashboard analytique** avec statistiques
- 📱 **Version mobile** responsive
- 📧 **Envoi par email** automatique
- 🔄 **Synchronisation temps réel** multi-utilisateurs
- 📈 **Export Excel** pour analyses RH
- 🔐 **Authentification** multi-utilisateurs
- 📝 **Templates personnalisables** par département
- 🌍 **Support multi-langues** (Arabe, Anglais)
- 📷 **Signature digitale** avec capture
- 🔔 **Notifications** de rappel d'évaluation

---

## 9. Approbations

| Rôle | Nom | Date | Statut |
|------|-----|------|--------|
| Product Owner | - | 02/09/2025 | ✅ Approuvé |
| Tech Lead | - | 02/09/2025 | ✅ Approuvé |
| UX/UI Designer | - | - | En attente |
| QA Lead | - | - | En attente |

---

## 10. Historique des Modifications

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | 02/09/2025 | Système | Document initial créé |

---

*Ce document est un document vivant et sera mis à jour au fur et à mesure de l'évolution du projet.*