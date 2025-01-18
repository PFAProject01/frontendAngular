# Étape 1 : Utiliser une image de base Node.js légère
FROM node:14-alpine

# Étape 2 : Créer un répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Étape 4 : Installer Angular CLI et les dépendances de l'application
RUN npm install -g @angular/cli && npm install

# Étape 5 : Copier le code source de l'application Angular
COPY . .

# Étape 6 : Construire l'application Angular pour la production
RUN npm run build --prod

# Étape 7 : Exposer le port utilisé par Angular
EXPOSE 4200

# Étape 8 : Démarrer l'application Angular en mode développement
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]

