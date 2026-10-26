FROM alpine:3.21 AS source

RUN apk add --no-cache git ca-certificates

ARG GIT_REF=main

RUN git clone --depth 1 --filter=blob:none --sparse --single-branch \
    --branch "$GIT_REF" \
    https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git /repo \
    && cd /repo \
    && git sparse-checkout set prototipos/backend/database \
    && git rev-parse HEAD > /repo/.sigsm-commit


FROM mariadb:11.4

COPY --from=source /repo/prototipos/backend/database/dbSchema_01.sql /docker-entrypoint-initdb.d/01-schema.sql

COPY --from=source /repo/prototipos/backend/database/dbSchema_02.sql /docker-entrypoint-initdb.d/02-schema.sql

COPY --from=source /repo/prototipos/backend/database/dbSchema_03.sql /docker-entrypoint-initdb.d/03-schema.sql

COPY --from=source /repo/prototipos/backend/database/dbSchema_04.sql /docker-entrypoint-initdb.d/04-schema.sql

# Seed opcional para instalaciones de demostración
COPY --from=source /repo/prototipos/backend/database/data/seedDemo.sql /opt/sigsm/seedDemo.sql

COPY --from=source /repo/.sigsm-commit /etc/sigsm-commit
