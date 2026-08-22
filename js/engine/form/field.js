/**
 * ============================================================
 * FORM FIELD
 * ============================================================
 *
 * Criação dos campos do formulário.
 * ============================================================
 */

import {
    criarSelect
} from "./select.js";

import {
    aplicarCaixaAlta
} from "./uppercase.js";


export async function criarCampo(config = {}) {

    const {
        campo,
        schema,
        gerarIdCampo,
        configurarCampoSelect
    } = config;


    if (!campo) {

        return null;

    }


    if (
        typeof gerarIdCampo !==
        "function"
    ) {

        throw new Error(
            "field.js: gerarIdCampo não foi fornecida."
        );

    }


    const grupo =
        document.createElement("div");


    grupo.className =
        "form-group";


    const label =
        document.createElement("label");


    label.htmlFor =
        gerarIdCampo(
            campo.name
        );


    label.textContent =
        campo.label ||
        campo.name;


    const input =
        criarInput({

            campo,

            gerarIdCampo

        });


    if (!input) {

        return null;

    }


    // ============================================================
    // SELECT RELACIONAL
    // ============================================================

    if (
        campo.type === "select" &&
        campo.source &&
        typeof configurarCampoSelect ===
        "function"
    ) {

        await configurarCampoSelect(
            campo,
            input
        );

    }


    grupo.appendChild(
        label
    );


    grupo.appendChild(
        input
    );


    return grupo;

}


// ============================================================
// CRIAR INPUT
// ============================================================

export function criarInput(config = {}) {

    const {
        campo,
        gerarIdCampo
    } = config;


    if (
        typeof gerarIdCampo !==
        "function"
    ) {

        throw new Error(
            "field.js: gerarIdCampo não foi fornecida."
        );

    }


    const id =
        gerarIdCampo(
            campo.name
        );


    let input;


    switch (campo.type) {

        case "text":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "text";

            break;


        case "date":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "date";

            break;


        case "datetime":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "datetime-local";

            break;


        case "time":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "time";

            break;


        case "number":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "number";

            break;


        case "email":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "email";

            break;


        case "textarea":

            input =
                document.createElement(
                    "textarea"
                );

            break;


        case "select":

            input =
                criarSelect(
                    campo
                );

            break;


        case "checkbox":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "checkbox";

            break;


        case "file":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "file";

            break;


        default:

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "text";

            break;

    }


    // ============================================================
    // ATRIBUTOS
    // ============================================================

    input.id =
        id;


    input.name =
        campo.name;


    input.className =
        campo.type === "checkbox"
            ? "form-checkbox"
            : "form-control";


    // ============================================================
    // REQUIRED
    // ============================================================

    if (campo.required) {

        input.required =
            true;

    }


    // ============================================================
    // READONLY
    // ============================================================

    if (campo.readonly) {

        input.readOnly =
            true;

    }


    // ============================================================
    // PLACEHOLDER
    // ============================================================

    if (campo.placeholder) {

        input.placeholder =
            campo.placeholder;

    }


    // ============================================================
    // VALOR PADRÃO
    // ============================================================

    if (
        campo.defaultValue !==
        undefined &&
        campo.defaultValue !==
        null
    ) {

        if (
            campo.type === "checkbox"
        ) {

            input.checked =
                Boolean(
                    campo.defaultValue
                );

        } else {

            input.value =
                campo.defaultValue;

        }

    }


    // ============================================================
    // CAIXA ALTA
    // ============================================================

    aplicarCaixaAlta(
        input,
        campo
    );


    return input;

}
