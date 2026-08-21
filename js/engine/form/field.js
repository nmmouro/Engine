import {
    aplicarCaixaAlta
} from "./uppercase.js";

import {
    criarSelect
} from "./select.js";

export async function criarCampo(
    campo,
    schema
) {

    if (!campo) {
        return null;
    }

    const grupo =
        document.createElement("div");

    grupo.className =
        "form-group";

    const label =
        document.createElement("label");

    const input =
        criarInput(campo, schema);

    if (!input) {
        return null;
    }

    label.htmlFor =
        input.id;

    label.textContent =
        campo.label ||
        campo.name;

    grupo.appendChild(label);
    grupo.appendChild(input);

    return grupo;
}

function criarInput(
    campo,
    schema
) {

    let input;

    switch (campo.type) {

        case "textarea":
            input =
                document.createElement(
                    "textarea"
                );
            break;

        case "select":
            input =
                criarSelect(
                    campo,
                    schema
                );
            break;

        default:
            input =
                document.createElement(
                    "input"
                );

            input.type =
                campo.type || "text";
    }

    input.id =
        gerarIdCampo(
            schema.entity,
            campo.name
        );

    input.name =
        campo.name;

    input.className =
        campo.type === "checkbox"
            ? "form-checkbox"
            : "form-control";

    if (campo.required) {
        input.required = true;
    }

    if (campo.readonly) {
        input.readOnly = true;
    }

    if (campo.placeholder) {
        input.placeholder =
            campo.placeholder;
    }

    aplicarCaixaAlta(
        input,
        campo
    );

    return input;
}

function gerarIdCampo(
    entity,
    nome
) {

    return (
        `campo-${entity}-${nome}`
    )
        .toLowerCase()
        .replace(
            /[^a-z0-9_-]/gi,
            "-"
        );
}
