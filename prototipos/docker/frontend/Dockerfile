FROM alpine:3.21 AS source

RUN apk add --no-cache git ca-certificates

ARG GIT_REF=main

RUN git clone --depth 1 --filter=blob:none --sparse --single-branch \
    --branch "$GIT_REF" \
    https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git /repo \
    && cd /repo \
    && git sparse-checkout set prototipos/frontend \
    && git rev-parse HEAD > /repo/.sigsm-commit


FROM node:22-alpine AS build

WORKDIR /app

COPY --from=source /repo/prototipos/frontend/package.json /repo/prototipos/frontend/package-lock.json ./

RUN npm ci

COPY --from=source /repo/prototipos/frontend/ ./

RUN npm run build


FROM nginx:1.28-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/ /usr/share/nginx/html/

COPY --from=source /repo/.sigsm-commit /etc/sigsm-commit

EXPOSE 80
