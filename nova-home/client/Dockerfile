FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY . .
RUN npm install --legacy-peer-deps --production=false || true
RUN npm run build:client

FROM node:18-alpine AS runtime
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist /app/dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
