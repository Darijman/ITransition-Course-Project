FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl bash
RUN curl -Lo /usr/local/bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x /usr/local/bin/wait-for-it.sh

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 9000

CMD sh -c ' \
  echo "⏳ Ожидание базы данных..." && \
  wait-for-it.sh "$DATABASE_HOST:$DATABASE_PORT" --timeout=30 --strict -- \
  echo "✅ База данных доступна. Запуск приложения..." && \
  node dist/main.js \
'
