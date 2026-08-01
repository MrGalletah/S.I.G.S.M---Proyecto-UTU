#! /bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "Este script debe ejecutarse como superusuario"
    exit 1
fi

echo "Bienvenido al script de manejo de usuarios!";


createUser() {
    read -p "Ingresa el nombre de usuario: " name

    if id "$name" &>/dev/null
    then
        echo "El usuario ya existe"
        return
    fi

    read -p "Crear directorio personal? (s/n) " option

    if [[ "$option" == "s" || "$option" == "S" ]]
    then
        useradd -m "$name"
    else
        useradd -M "$name"
    fi

    echo "$name:$name" | chpasswd # setea la pwd
    passwd -e "$name" # obliga a cambiarla una vez se loguea

    echo "Usuario creado correctamente."
    echo "Se ha asignado una contraseña temporal igual al nombre de usuario."
    echo "El usuario deberá cambiarla una vez inicie sesión."
}

deleteUser() {
    read -p "Ingrese el nombre del usuario a eliminar: " name

    if ! id "$name" &>/dev/null
    then
        echo "El usuario no existe."
        return
    fi

    read -p "Eliminar directorio personal? (s/n) " option

    if [[ "$option" == "s" || "$option" == "S" ]]
    then
        userdel -r "$name"
    else
        userdel "$name"
    fi

    echo "Usuario eliminado correctamente"
}

listAll() {
    echo "Usuarios normales del sistema: "
    awk -F: '$3 >= 1000 && $3 < 60000 {print $1}' /etc/passwd
}


option=-1

while [ $option != "0" ]
do
    echo "1) Crear un usuario"
    echo "2) Eliminar un usuario"
    echo "3) Listar todos los usuarios"
    echo "0) Salir"
    read -p "Selecciona una opción: " option

    case "$option" in
        1) createUser ;;
        2) deleteUser ;;
        3) listAll ;;
        0) echo "Saliendo..."; exit 0 ;;
        *) echo "Opción inválida" ;;
    esac

    read -p "Presiona enter para continuar"
    clear
done