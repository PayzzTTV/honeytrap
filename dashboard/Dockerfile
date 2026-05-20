FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
RUN addgroup -S honeytrap && adduser -S honeytrap -G honeytrap
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=honeytrap:honeytrap /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER honeytrap
EXPOSE 3000
CMD ["npm", "start"]
