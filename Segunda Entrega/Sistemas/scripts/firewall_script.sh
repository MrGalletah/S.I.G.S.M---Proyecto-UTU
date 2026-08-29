#!/bin/bash 

if [ "$EUID" -ne 0 ]; then
    echo "Este script debe ejecutarse como superusuario"
    exit 1
fi

echo "Bienvenido al script de manejo del firewall "

showRules() {
    echo "Configuración actual del firewall: "
    firewall-cmd --list-all
}

managePort() {
    action=$1
    text=$2

    read -p "Puerto a $text: " port
    read -p "Protocolo (tcp/udp): " protocol
    read -p "Hacer permanentemente? (s/n): " permanent

    firewall-cmd "--$action-port=$port/$protocol"

    if [[ $permanent == "s" ]]; then
        firewall-cmd --permanent "--$action-port=$port/$protocol"
    fi
}


manageService() {
    action=$1
    text=$2

    read -p "Servicio a $text: " service
    read -p "Hacer permanentemente? (s/n): " permanent

    firewall-cmd "--$action-service=$service"

    if [[ $permanent == "s" ]]; then
        firewall-cmd --permanent "--$action-service=$service"
    fi
}

manageIpPort() {
    action=$1

    read -p "IP: " ip
    read -p "Puerto: " port
    read -p "Protocolo (tcp/udp): " protocol
    read -p "Hacer permanente? (s/n): " permanent

    rule="rule family='ipv4' source address='$ip' port port='$port' protocol='$protocol' accept"

    if [[ $action == "add" ]]; then
        firewall-cmd --add-rich-rule="$rule"

        if [[ $permanent == "s" ]]; then
            firewall-cmd --permanent --add-rich-rule="$rule"
        fi

    elif [[ $action == "remove" ]]; then
        firewall-cmd --remove-rich-rule="$rule"

        if [[ $permanent == "s" ]]; then
            firewall-cmd --permanent --remove-rich-rule="$rule"
        fi
    fi
}

option=-1

while [ $option != "0" ]
do
    echo "1) Mostrar la configuración actual."
    echo "2) Abrir un puerto."
    echo "3) Cerrar un puerto."
    echo "4) Añadir un servicio."
    echo "5) Eliminar un servicio."
    echo "6) Permitir una IP en un puerto."
    echo "7) Quitar permiso de una IP en un puerto."
    echo "0) Salir."

    read -p "Seleccione una opción: " option

    case $option in
        1) showRules ;;
        2) managePort "add" "abrir" ;;
        3) managePort "remove" "cerrar" ;;
        4) manageService "add" "añadir" ;;
        5) manageService "remove" "eliminar" ;;
        6) manageIpPort "add";;
        7) manageIpPort "remove" ;;
        0) echo "Saliendo..."; exit 0;;
        *) echo "Opción inválida." ;;
    esac

    read -p "Presiona enter para continuar"
    clear
done