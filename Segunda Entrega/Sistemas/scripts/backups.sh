#!/bin/bash

# Local

backupLocal(){
    BACKUP_DIR="/home/admin/Backups"

    read -p "Ingrese la ruta del archivo o carpeta a respaldar: " ruta

    if [ ! -e "$ruta" ]; then
        echo "Error: la ruta indicada no existe."
        return 1
    fi

    mkdir -p "$BACKUP_DIR" # Home del que ejecuta si existe no hace na

    nombre=$(basename "$ruta") # basename agarra el ultimo dir de la ruta proporcionada 
    fecha=$(date +"%d-%m-%Y_%H-%M")

    tar -czf "$BACKUP_DIR/${nombre}_${fecha}.tar.gz" "$ruta"

    if [ $? -eq 0 ]; then
        echo "Se realizó el respaldo en $BACKUP_DIR."
    else
        echo "Ocurrió un error al crear el backup."
    fi
}

# Remoto

backupRemote() {
    BACKUP_DIR="/home/admin/Backups"
    REMOTE_IP="192.168.56.102"

    read -p "Ingrese la ruta del archivo o carpeta a respaldar: " ruta

    if [ ! -e "$ruta" ]; then
        echo "Error: la ruta indicada no existe."
        return 1
    fi

    nombre=$(basename "$ruta") 
    fecha=$(date +"%d-%m-%Y_%H-%M")

    archivo="/tmp/${nombre}_${fecha}.tar.gz" # ruta en tmp

    tar -czf "$archivo" "$ruta"

    scp "$archivo" "admin@$REMOTE_IP:$BACKUP_DIR"

    rm "$archivo" # lo borramos 

    if [ $? -eq 0 ]; then
        echo "Se realizó el respaldo remoto correctamente."
    else
        echo "Ocurrió un error al crear el respaldo."
    fi
}

# Backup manual db 

backupDB(){

    mkdir -p "/home/admin/Backups"

    fecha=$(date +"%d-%m-%Y_%H-%M")
    temporal="/tmp/sigsm_${fecha}.sql"
    backup="/home/admin/Backups/sigsmDB_${fecha}.tar.gz"

    /opt/lampp/bin/mysqldump -u root sigsm > "$temporal"

    if [ $? -eq 0 ]; then

        tar -czf "$backup" "$temporal"
        rm "$temporal"

        echo "Respaldo de la base de datos realizado correctamente."

    else

        echo "Error al respaldar la base de datos."
        rm -f "$temporal"

    fi
}


# Programar respaldo automático
createCron(){
    echo "Ingrese la configuración de cron."

    read -p "Minuto (*, 0-59): " minuto
    read -p "Hora (*, 0-23): " hora
    read -p "Día del mes (*, 1-31): " dia
    read -p "Mes (*, 1-12): " mes
    read -p "Día de la semana (*, 0-6): " semana

    CRON="$minuto $hora $dia $mes $semana"

    echo "¿Qué desea respaldar?"
    echo "1) XAMPP (MariaDB y documentos)"
    echo "2) Docker (MariaDB y volumen de documentos)"
    read -p "Seleccione una opción: " origen

    echo "Tipo de respaldo:"
    echo "1) Local"
    echo "2) Remoto"
    read -p "Seleccione una opción: " destino

    if [ "$origen" == "1" ]; then
        if [ "$destino" == "1" ]; then
            SCRIPT="/home/admin/scripts/cron/local.sh"
        elif [ "$destino" == "2" ]; then
            SCRIPT="/home/admin/scripts/cron/remote.sh"
        else
            echo "Opción incorrecta."
            return 1
        fi
    elif [ "$origen" == "2" ]; then
        if [ "$destino" == "1" ]; then
            SCRIPT="bash -c 'source /home/admin/scripts/backups.sh; backupDocker'"
        elif [ "$destino" == "2" ]; then
            SCRIPT="bash -c 'source /home/admin/scripts/backups.sh; backupDocker && scp \"\$archivo\" admin@192.168.56.102:/home/admin/Backups/'"
        else
            echo "Opción incorrecta."
            return 1
        fi
    else
        echo "Opción incorrecta."
        return 1
    fi

    (crontab -l 2>/dev/null; echo "$CRON $SCRIPT") | crontab -

    if [ $? -eq 0 ]; then
        echo "Respaldo programado correctamente."
    else
        echo "Error al programar el respaldo."
    fi
}

# Backup de Docker (MariaDB + volumen de documentos)
backupDocker() {
    umask 077  # Restringir acceso a los respaldos y archivos temporales

    BACKUP_DIR="/home/admin/Backups"
    DOCKER_DIR="/home/admin/sigsm/docker"

    fecha=$(date +"%d-%m-%Y_%H-%M")
    TEMP="/tmp/backup_docker_$$" # $$ = PID
    archivo="$BACKUP_DIR/sigsmDocker_${fecha}.tar.gz"

    mkdir -p "$BACKUP_DIR"
    mkdir -p "$TEMP/documentos"

    cd "$DOCKER_DIR" || return 1

    # Exportar la base de datos del contenedor
    docker compose exec -T db sh -c \
        'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" mariadb-dump -u root --single-transaction sigsm' \
        > "$TEMP/sigsm.sql"

    if [ $? -ne 0 ]; then
        echo "Error al respaldar MariaDB de Docker."
        rm -rf "$TEMP"
        return 1
    fi

    # Copiar documentos almacenados en el volumen
    docker compose cp backend:/var/www/api/storage/. "$TEMP/documentos/"

    if [ $? -ne 0 ]; then
        echo "Error al respaldar documentos de Docker."
        rm -rf "$TEMP"
        return 1
    fi

    # Comprimir base de datos y documentos
    tar -czf "$archivo" -C "$TEMP" sigsm.sql documentos

    if [ $? -ne 0 ]; then
        echo "Error al comprimir el respaldo de Docker."
        rm -f "$archivo"
        rm -rf "$TEMP"
        return 1
    fi

    rm -rf "$TEMP"
    echo "Respaldo Docker realizado correctamente: $archivo"
    return 0
}


if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
    option=-1

    while [ "$option" != "0" ]; do
        echo "1) Crear un backup local."
        echo "2) Crear un backup remoto."
        echo "3) Crear un backup de la base de datos (XAMPP)."
        echo "4) Establecer una norma de backups automáticos."
        echo "5) Mostrar lista de cron."
        echo "6) Crear un backup de Docker."
        echo "0) Salir."

        read -p "Seleccione una opción: " option

        case "$option" in
            1) backupLocal ;;
            2) backupRemote ;;
            3) backupDB ;;
            4) createCron ;;
            5) crontab -l ;;
            6) backupDocker ;;
            0) echo "Saliendo..."; exit 0 ;;
            *) echo "Opción inválida." ;;
        esac

        read -p "Presiona enter para continuar"
        clear
    done
fi
