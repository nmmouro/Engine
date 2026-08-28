/**
 * ============================================================
 * FORM / FIELD
 * ============================================================
 */

export async function criarCampo(config = {}) {

    const {
        campo,
        gerarIdCampo,
        configurarCampoSelect,
        listar,
        aplicarCaixaAlta
    } = config;


    if (!campo) {

        return null;

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

            gerarIdCampo,

            aplicarCaixaAlta

        });


    if (!input) {

        return null;

    }


    // ============================================================
    // SELECT RELACIONAL
    // ============================================================

    if (
        campo.type === "select" &&
        campo.source
    ) {

        await configurarCampoSelect({

            field: campo,

            input,

            listar

        });

    }


    grupo.appendChild(
        label
    );


    grupo.appendChild(
        input
    );


    return grupo;

}


/**
 * ============================================================
 * CRIAR INPUT
 * ============================================================
 */

function criarInput(config = {}) {

    const {
        campo,
        gerarIdCampo,
        aplicarCaixaAlta
    } = config;


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


    if (campo.required) {

        input.required =
            true;

    }


    if (campo.readonly) {

        input.readOnly =
            true;

    }


    if (campo.placeholder) {

        input.placeholder =
            campo.placeholder;

    }


    // ============================================================
    // DEFAULT
    // ============================================================

    if (
        campo.defaultValue !== undefined &&
        campo.defaultValue !== null
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

    if (
        typeof aplicarCaixaAlta ===
        "function"
    ) {

        aplicarCaixaAlta(
            input,
            campo
        );

    }


    return input;

}


/**
 * ============================================================
 * SELECT
 * ============================================================
 */

function criarSelect(campo) {

    const select =
        document.createElement(
            "select"
        );


    select.className =
        "form-control";


    const vazio =
        document.createElement(
            "option"
        );


    vazio.value =
        "";


    vazio.textContent =
        campo.placeholder ||
        "Selecione...";


    select.appendChild(
        vazio
    );


    const options =
        Array.isArray(
            campo.options
        )
            ? campo.options
            : [];


    options.forEach(
        opcao => {

            const option =
                document.createElement(
                    "option"
                );


            if (
                typeof opcao ===
                    "object" &&
                opcao !== null
            ) {

                option.value =
                    opcao.value ?? "";


                option.textContent =
                    opcao.label ??
                    opcao.value ??
                    "";


                option.dataset.label =
                    opcao.label ??
                    opcao.value ??
                    "";

            } else {

                option.value =
                    String(opcao);


                option.textContent =
                    String(opcao);


                option.dataset.label =
                    String(opcao);

            }


            select.appendChild(
                option
            );

        }
    );


    return select;

}
