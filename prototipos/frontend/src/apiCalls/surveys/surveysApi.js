import { processResponse } from "../../components/utils/processApiResponse";

const surveysUrl = "/api/surveys";

export async function getAllSurveys() {
    const response = await fetch(`${surveysUrl}/?includeInactive=true`, {
        method: "GET",
        credentials: "include",
    });

    return processResponse(response);
}

export async function getSurveyDetail(idEncuesta) {
    const response = await fetch(
        `${surveysUrl}/detail.php?id=${idEncuesta}&includeInactive=true`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return processResponse(response);
}


export async function createSurvey(data) {
    const response = await fetch(`${surveysUrl}/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return processResponse(response);
}


export async function updateSurvey(idEncuesta, data) {
    const response = await fetch(
        `${surveysUrl}/?id=${idEncuesta}`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    return processResponse(response);
}


export async function createSurveyQuestion(data) {
    const response = await fetch("/api/surveys/questions.php", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return processResponse(response);
}

export async function updateSurveyQuestion(idPregunta, data) {
    const response = await fetch(
        `/api/surveys/questions.php?id=${idPregunta}`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    return processResponse(response);
}

export async function reorderSurveyQuestions(idEncuesta, preguntas) {
    const response = await fetch("/api/surveys/reorder.php", {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id_encuesta: idEncuesta,
            preguntas,
        }),
    });

    return processResponse(response);
}

export async function getPublicSurveys() {

    const response = await fetch("/api/surveys/", {
        method: "GET",
    });

    return processResponse(response);
}

export async function getPublicSurveyDetail(surveyId) {

    const response = await fetch(
        `/api/surveys/detail.php?id=${surveyId}`,
        {
            method: "GET",
        }
    );

    return processResponse(response);
}

export async function submitPublicSurvey(data) {

    const response = await fetch("/api/surveys/responses.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return processResponse(response);
}

export async function getSurveyResults(surveyId) {
    const response = await fetch(
        `/api/surveys/results.php?id=${surveyId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return processResponse(response);
}
