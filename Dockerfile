FROM node:24-alpine



LABEL description="Automated Bug Testing & Deployment System"


ENV NODE_ENV=production


WORKDIR /app


COPY package.json package-lock.json* ./
RUN npm ci --only=production


COPY . .


EXPOSE 3000


CMD ["node", "server.js"]
