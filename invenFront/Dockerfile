FROM node:22-alpine AS build-frontend

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY angular.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src
COPY public ./public

# Build for SSR
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY --from=build-frontend /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy SSR server and built files
COPY --from=build-frontend /app/dist/invenFront ./dist

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/server/server.mjs"]