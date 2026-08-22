/**
 * ============================================================
 * FORM FIELD
 * ============================================================
 *
 * Responsável por:
 * - Criar campos
 * - Criar inputs
 * - Criar selects
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * ============================================================
 * CRIAR CAMPO
 * ============================================================
 */
export async function criarCampo({
    campo,
    gerarIdCampo,
    configurarCampoSelect,
    aplicarCaixaAlta
}) {

    if (!campo) {
        return null;
    }


    if (
        typeof gerarIdCampo !== "function"
    ) {

        throw new Error(
            "field.js: gerarIdCampo não foi fornecida."
        );

    }


    // ============================================================
    // CONTAINER DO CAMPO
    // ============================================================

    const grupo =
        document.createElement("div");

    grupo.className =
        "form-group";


    // ============================================================
    // LABEL
    // ============================================================

    const label =
        document.createElement("label");


    label.htmlFor =
        gerarIdCampo(
            campo.name
        );


    label.textContent =
        campo.label ||
        campo.name;


    // ============================================================
    // INPUT
    // ============================================================

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

        if (
            typeof configurarCampoSelect ===
            "function"
        ) {

            await configurarCampoSelect(
                campo,
                input
            );

        }

    }


    // ============================================================
    // MONTAGEM
    // ============================================================

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
export function criarInput({
    campo,
    gerarIdCampo,
    aplicarCaixaAlta
}) {

    if (!campo) {
        return null;
    }


    const id =
        gerarIdCampo(
            campo.name
        );


    let input;


    // ============================================================
    // TIPO DO CAMPO
    // ============================================================

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
 * CRIAR SELECT
 * ============================================================
 */
export function criarSelect(campo) {

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


    vazio.selected =
        true;


    select.appendChild(
        vazio
    );


    const options =
        Array.isArray(
            campo.options
        )
            ? campo.options
            : [];


    options.forEach(opcao => {

        const option =
            document.createElement(
                "option"
            );


        if (
            typeof opcao === "object" &&
            opcao !== null
        ) {

            option.value =
                opcao.value ?? "";


            option.textContent =
                opcao.label ??
                opcao.value ??
                "";

        } else {

            option.value =
                String(opcao);


            option.textContent =
                String(opcao);

        }


        option.dataset.label =
            option.textContent;


        select.appendChild(
            option
        );

    });


    return select;

}
