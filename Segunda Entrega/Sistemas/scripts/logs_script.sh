#!/bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "Este script debe ejecutarse como superusuario"
    exit 1
fi


showLogs() {
    mode=$1
    sudo journalctl -u "$mode"
}

showSudo() {
    sudo journalctl _COMM=sudo
}


option=-1

while [ $option != "0" ]
do
    echo "1) Mostrar los logs de ssh."
    echo "2) Mostrar los logs de inicio de sesión."
    echo "3) Mostrar los logs del uso del comando sudo."
    echo "0) Salir."

    read -p "Seleccione una opción: " option

    case $option in
        1) showLogs "sshd" ;;
        2) showLogs "systemd-logind" ;;
        3) showSudo ;;
        0) echo "Saliendo..."; exit 0;;
        *) echo "Opción inválida." ;;
    esac
    clear
done