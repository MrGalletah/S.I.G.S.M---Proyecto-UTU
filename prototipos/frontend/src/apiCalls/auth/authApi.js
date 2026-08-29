import { processResponse } from "../../components/utils/processApiResponse";

const authUrl = "/api/auth";

export async function login(mail, pwd) {
    const req = await fetch(`${authUrl}/login.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // por si existe ya la cookie
        body: JSON.stringify({
            correo: mail,
            password: pwd
        }),
    });

    return processResponse(req);
}


export async function getCurrentUser() {
    const req = await fetch(`${authUrl}/me.php`,
        {
            credentials: "include"
        }
    );

    if (req.status === 401) {
        return null;
    }

    const data = await processResponse(req);

    return data.usuario;
}

export async function logout() {
    const req = await fetch(`${authUrl}/logout.php`, {
        method: "POST",
        credentials: "include"
    });

    return processResponse(req);
}