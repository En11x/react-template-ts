ARG NGINX_IMAGE_TAG=latest

FROM node as deps
RUN npm i -g pnpm

FROM deps as dependencies
WORKDIR /usr/app
COPY package.json ./
RUN pnpm install

FROM dependencies as build
WORKDIR /usr/app
COPY . .
COPY --from=dependencies /usr/app/node_modules /usr/app/node_modules
RUN pnpm run build:prod

FROM nginx:${NGINX_IMAGE_TAG}
WORKDIR /usr/share/nginx/html/
COPY build /usr/share/nginx/html/
EXPOSE 80
