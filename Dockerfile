# syntax=docker/dockerfile:1

# ---- client build ----
FROM node:22-alpine AS client
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
# Firebase web API key is public config, but it is still supplied at build time, not committed.
ARG VITE_FIREBASE_API_KEY=""
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
RUN npm run build

# ---- api runtime ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY api/ ./api/
RUN rm -rf ./api/__tests__
COPY --from=client /app/client/dist ./client/dist

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "api/index.js"]
