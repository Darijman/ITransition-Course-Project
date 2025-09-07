FROM node:20-alpine AS DEPS
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS BUILDER
WORKDIR /app

COPY . .
COPY --from=DEPS /app/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS RUNNER
WORKDIR /app

COPY --from=BUILDER /app/.next/standalone ./
COPY --from=BUILDER /app/.next/static ./.next/static
COPY --from=BUILDER /app/public ./public

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
