FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

COPY frontend/package*.json frontend/
RUN npm run install-client --only=production

COPY backend/package*.json backend/
RUN npm run install-server --only=production

COPY frontend/ frontend/
RUN npm run build --prefix client

COPY backend/ backend/

USER node

CMD [ "npm", "start", "--prefix", "server" ]

EXPOSE 8000