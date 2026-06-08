#! /bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "Este script debe ejecutarse como superusuario"
    exit 1
fi

echo "Bienvenido al script de manejo de usuarios!";


createUser() {
    read -p "Ingresa el nombre de usuario: " n

    if id "$n" &>/dev/null
    then
        echo "El usuario ya existe"
        return
    fi

    read -p "Crear directorio personal? (s/n) " option

    if [[ "$option" == "s" || "$option" == "S" ]]
    then
        useradd -m "$n"
    else
        useradd -M "$n"
    fi

    echo "$n:$n" | chpasswd # setea la pwd
    passwd -e "$n" # obliga a cambiarla una vez se loguea

    echo "Usuario creado correctamente."
    echo "Se ha asignado una contraseña temporal igual al nombre de usuario."
    echo "El usuario deberá cambiarla una vez inicie sesión."
}

deleteUser() {
    read -p "Ingrese el nombre del usuario a eliminar: " n

    if ! id "$n" &>/dev/null
    then
        echo "El usuario no existe."
        return
    fi

    read -p "Eliminar directorio personal? (s/n) " option

    if [[ "$option" == "s" || "$option" == "S" ]]
    then
        userdel -r "$n"
    else
        userdel "$n"
    fi

    echo "Usuario eliminado correctamente"
}

listAll() {
    echo "Usuarios normales del sistema: "
    awk -F: '$3 >= 1000 && $3 < 60000 {print $1}' /etc/passwd
}


while true
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

done