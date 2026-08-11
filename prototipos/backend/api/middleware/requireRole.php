<?php

declare(strict_types=1);

require_once __DIR__ . '/requireAuth.php';

function requireRole(array $allowedRoles): array
{
    $user = requireAuth();

    $userRoles = $user['roles'] ?? [];

    foreach ($userRoles as $role) {
        if (in_array($role, $allowedRoles, true)) {
            return $user;
        }
    }

    sendJson(403, [
        'ok' => false,
        'mensaje' => 'No tiene permisos para realizar esta acción.',
    ]);

    exit;
}