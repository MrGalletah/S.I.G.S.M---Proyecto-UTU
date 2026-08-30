#!/bin/bash

BACKUP_DIR="/home/admin/Backups"
DOCUMENTOS="/home/admin/sigsm/backend/api/public/documents"

fecha=$(date +"%d-%m-%Y_%H-%M")

TEMP="/tmp/backup_sigsm"

mkdir -p "$BACKUP_DIR"
mkdir -p "$TEMP"

/opt/lampp/bin/mysqldump -u root sigsm > "$TEMP/sigsm.sql"

if [ $? -ne 0 ]; then
    echo "Error al respaldar la base de datos."
    rm -rf "$TEMP"
    exit 1
fi

cp -r "$DOCUMENTOS" "$TEMP/documentos" # copiar documentos

tar -czf "$BACKUP_DIR/sigsm_${fecha}.tar.gz" -C "$TEMP" . # comprimir todo

if [ $? -eq 0 ]; then
    echo "Respaldo local realizado correctamente."
else
    echo "Error al crear el respaldo."
fi

rm -rf "$TEMP"