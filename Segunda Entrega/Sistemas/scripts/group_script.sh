#! /bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "Este script debe ejecutarse como superusuario"
    exit 1
fi

echo "Bienvenido al script de manejo de grupos!";

createGroup() {
    read -p "Ingresa el nombre del grupo: " name

    if getent group "$name" > /dev/null; then
        echo "El grupo ya existe."
        return
    fi

    groupadd "$name"

    if [ $? -eq 0 ]; then
        echo "Grupo creado correctamente."
    else
        echo "Error: no se pudo crear el grupo."
    fi
}

deleteGroup() {
    read -p "Ingresa el nombre del grupo: " name

    protected=("root" "wheel" "sudo" "adm" "systemd-journal")

    for item in "$protected[@]"
    do
        if [ "$name" == "$item" ]; then
            echo "Este grupo no se puede eliminar. No te hagas el vivo"
            return
        fi
    done

    if ! getent group "$name" > /dev/null; then
        echo "El grupo no existe."
        return
    fi

    read -p "Estas seguro de que deseas eliminar el grupo $name ? (s/n)" option

    if [[ "$option" == "s" || "$option" == "S" ]]; then 

        groupdel "$name"

        if [ $? -eq 0 ]; then
            echo "Grupo eliminado correctamente."
        else
            echo "Error: no se pudo eliminar el grupo."
            return
        fi

    else
        echo "Operación cancelada"
    fi
}

addUser() {
    read -p "Ingrese el nombre del usuario: " user
    read -p "Ingrese el nombre del grupo: " group

    if ! id "$user" &>/dev/null; then
        echo "El usuario no existe."
        return
    fi

    if ! getent group "$group" > /dev/null; then
        echo "El grupo no existe."
        return
    fi

    usermod -aG "$group" "$user"

    if [ $? -eq 0 ]; then
        echo "Usuario agregado al grupo correctamente."
    else
        echo "Error: no se pudo agregar el usuario al grupo."
    fi
}

deleteUser() {
    read -p "Ingrese el nombre del usuario: " user
    read -p "Ingrese el nombre del grupo: " group

    if [ "$user" = "root" ]; then
        echo "No se puede modificar la pertenencia a grupos del usuario root."
        return
    fi

    if ! id "$user" &>/dev/null; then
        echo "El usuario no existe."
        return
    fi

    if ! getent group "$group" > /dev/null; then
        echo "El grupo no existe."
        return
    fi

    gpasswd -d "$user" "$group"

    if [  $? -ne 0 ]; then
        echo "Error: no se pudo quitar el usuario del grupo."
    fi
}

listAll() {
    echo "Grupos del sistema: "
    getent group | cut -d: -f1
}

listMembers() {
    read -p "Ingrese el nombre del grupo: " group

    if ! getent group "$group" > /dev/null; then
        echo "El grupo no existe."
        return
    fi

    echo "Información del grupo:"
    getent group "$group"
}

option=-1

while [ $option != "0" ]
do
    echo "1) Crear grupo."
    echo "2) Eliminar grupo."
    echo "3) Agregar usuario a un grupo."
    echo "4) Eliminar usuario de un grupo."
    echo "5) Listar grupos del sistema."
    echo "6) Listar miembros de un grupo."
    echo "0) Salir."

    read -p "Seleccione una opción: " option

    case $option in
        1) createGroup ;;
        2) deleteGroup ;;
        3) addUser ;;
        4) deleteUser ;;
        5) listAll ;;
        6) listMembers ;;
        0) echo "Saliendo..."; exit 0;;
        *) echo "Opción inválida." ;;
    esac

    read -p "Presiona enter para continuar"
    clear
done