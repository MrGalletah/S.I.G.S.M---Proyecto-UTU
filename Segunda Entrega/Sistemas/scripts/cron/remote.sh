#!/bin/bash

REMOTE_IP="192.168.56.102"
REMOTE_USER="admin"
REMOTE_DIR="/home/admin/Backups"

DOCUMENTOS="/home/admin/sigsm/backend/api/public/documents"

fecha=$(date +"%d-%m-%Y_%H-%M")

TEMP="/tmp/backup_sigsm"
ARCHIVO="/tmp/sigsm_${fecha}.tar.gz"

mkdir -p "$TEMP"

/opt/lampp/bin/mysqldump -u root sigsm > "$TEMP/sigsm.sql"

if [ $? -ne 0 ]; then
    echo "Error al respaldar la base de datos."
    rm -rf "$TEMP"
    exit 1
fi

cp -r "$DOCUMENTOS" "$TEMP/documentos"

tar -czf "$ARCHIVO" -C "$TEMP" .

if [ $? -ne 0 ]; then
    echo "Error al crear el respaldo."
    rm -rf "$TEMP"
    exit 1
fi

scp "$ARCHIVO" "$REMOTE_USER@$REMOTE_IP:$REMOTE_DIR"

if [ $? -eq 0 ]; then
    echo "Respaldo remoto realizado correctamente."
else
    echo "Error al enviar el respaldo."
fi

rm -rf "$TEMP"
rm -f "$ARCHIVO"