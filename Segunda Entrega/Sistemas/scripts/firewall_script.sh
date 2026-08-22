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


openPort() {
    read -p "Puerto a abrir: " port
    read -p "Protocolo (tcp/udp): " protocol
    read -p "Abrir permanentemente? (s/n): " permanent

    firewall-cmd --add-port="$port/$protocol"

    if [[ $permanent == "s" ]]; then
            firewall-cmd --permanent --add-port="$port/$protocol"
    fi
}

closePort() {
    read -p "Puerto a cerrar: " port
    read -p "Protocolo (tcp/udp): " protocol
    read -p "Cerrar permanentemente? (s/n): " permanent

    firewall-cmd --remove-port="$port/$protocol"

    if [[ $permanent == "s" ]]; then
            firewall-cmd --permanent --remove-port="$port/$protocol"
    fi
}

addService(){
    read -p "Servicio: " service
    read -p "Hacer permanente? (s/n): " permanent

    firewall-cmd --add-service="$service"

    if [[ $permanent == "s" ]]; then
            firewall-cmd --permanent --add-service="$service"
    fi
}

deleteService(){
    read -p "Servicio: " service
    read -p "Hacer permanente? (s/n): " permanent

    firewall-cmd --remove-service="$service"

    if [[ $permanent == "s" ]]; then
            firewall-cmd --permanent --remove-service="$service"
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
    echo "0) Salir."

    read -p "Seleccione una opción: " option

    case $option in
        1) showRules ;;
        2) openPort ;;
        3) closePort ;;
        4) addService ;;
        5) deleteService ;;
        0) echo "Saliendo..."; exit 0;;
        *) echo "Opción inválida." ;;
    esac

    read -p "Presiona enter para continuar"
    clear
done