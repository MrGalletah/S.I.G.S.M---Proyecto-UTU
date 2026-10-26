FROM alpine:3.21 AS source

RUN apk add --no-cache git ca-certificates

ARG GIT_REF=main

RUN git clone --depth 1 --filter=blob:none --sparse --single-branch \
    --branch "$GIT_REF" \
    https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git /repo \
    && cd /repo \
    && git sparse-checkout set prototipos/backend/api \
    && git rev-parse HEAD > /repo/.sigsm-commit


FROM php:8.2-apache-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql mbstring \
    && rm -rf /var/lib/apt/lists/* \
    && a2enmod rewrite headers

COPY --from=source /repo/prototipos/backend/api/ /var/www/api/

COPY bootstrap-admin.php /usr/local/bin/bootstrap-admin.php

COPY --from=source /repo/.sigsm-commit /etc/sigsm-commit

COPY apache.conf /etc/apache2/sites-available/000-default.conf

COPY php.ini /usr/local/etc/php/conf.d/99-sigsm.ini

RUN mkdir -p /var/www/api/storage/documents \
    && chown -R www-data:www-data /var/www/api/storage

EXPOSE 80
