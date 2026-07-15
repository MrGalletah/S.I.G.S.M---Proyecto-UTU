<?php

declare(strict_types=1);

function startAppSession(): void
{
    // si la sesion ya esta activa return
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_name('sigsm_session'); // nombre de la cookie de sesion 

    session_set_cookie_params([ // config de la cookie 
        'lifetime' => 0,  // dura hasta que cierre el navegador
        'path' => '/',  // envia la cookie a todas las rutas 
        'domain' => '', // asocia al dominio que lo crea 
        'secure' => false, // dice si se puede mandar solo por HTTPS
        'httponly' => true, // impide que js lea la cookie 
        'samesite' => 'Lax', // controla cuando se envia desde otros sitios
    ]);

    session_start(); // inicia o recupera la sesion 
}
