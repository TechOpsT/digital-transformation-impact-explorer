FROM node:24.17.0-alpine AS build
WORKDIR /app
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci
COPY apps/web ./
RUN npm run build

FROM node:24.17.0-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json /app/vite.config.ts ./
USER node
EXPOSE 4173
CMD ["npm", "exec", "vite", "--", "preview", "--host", "0.0.0.0", "--port", "4173"]
