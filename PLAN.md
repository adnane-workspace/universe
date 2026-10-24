# Plan de réalisation — Application de gestion des absences

## Objectif
Créer une application mobile avec React Native et Expo pour permettre aux enseignants de gérer les absences, aux étudiants de consulter leur situation et à l’administration de gérer les comptes, les groupes et les statistiques.

## Profils et fonctionnalités
- **Enseignant** : connexion, consultation des étudiants d’un groupe, saisie et modification des absences, historique, taux d’absence par étudiant, traitement des justificatifs.
- **Étudiant** : connexion, consultation de l’emploi du temps et des absences, détails d’une absence, dépôt d’un justificatif et suivi de son statut.
- **Administration** : gestion des étudiants, enseignants et groupes, consultation des statistiques.

## Architecture proposée
- Application mobile : React Native avec Expo, TypeScript et Expo Router.
- Interface : composants réutilisables, navigation organisée par rôle, formulaires avec validation.
- Données : API backend séparée à définir (authentification, utilisateurs, groupes, cours, absences, justificatifs).
- Fichiers justificatifs : stockage sécurisé via le backend, avec contrôle d’accès.

## Phases
1. **Cadrage** : confirmer règles de gestion, statuts des absences/justificatifs et maquettes.
2. **Socle mobile** : initialiser Expo, configurer TypeScript et Expo Router, créer l’interface de connexion et les tableaux de bord par rôle.
3. **Référentiels** : intégrer les utilisateurs, groupes, cours et emplois du temps via l’API.
4. **Absences** : saisie enseignant, historique et détails étudiant, calcul du taux d’absence.
5. **Justificatifs** : dépôt étudiant, consultation et décision de l’enseignant, affichage du statut.
6. **Administration** : gestion des utilisateurs/groupes et statistiques.
7. **Finalisation** : sécurisation des accès, vérification des parcours, préparation de la démonstration et documentation.

## Première version (MVP)
Priorité : connexion et navigation par rôle, liste des groupes/étudiants, saisie d’absence, consultation étudiant et dépôt/suivi d’un justificatif. Les statistiques avancées et la gestion complète des référentiels viennent ensuite.

## Modèle de données initial
- Utilisateur (nom, prénom, e-mail, rôle, identifiant étudiant/enseignant)
- Groupe (nom, membres, enseignants associés)
- Cours (matière, groupe, enseignant, horaire)
- Absence (étudiant, cours, date, durée, motif, statut, auteur)
- Justificatif (absence, fichier, date de dépôt, statut, commentaire de décision)

## Décisions à confirmer pendant le développement
- Backend et méthode d’authentification.
- Valeurs exactes des statuts et règles de validation des justificatifs.
- Format des taux d’absence (heures, séances ou jours) et règles de calcul.
