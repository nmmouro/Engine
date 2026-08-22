/**
 * ============================================================
 * FORM ENGINE - FIELD
 * ============================================================
 *
 * Responsável por:
 * - Criar campos do formulário
 * - Criar inputs
 * - Criar selects
 * - Aplicar propriedades do Schema
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * ============================================================
 * CRIAR CAMPO
 * ============================================================
 */

export async function criarCampo(
    campo,
    config = {}
) {

    const {
        gerarIdCampo,
        configurarCampoSelect
    } = config;


    // ==========================================================
    // VALIDAÇÃO
    // ==========================================================

    if (
        typeof gerarIdCampo !== "function"
    ) {

        throw new Error(
            "field.js: gerarIdCampo não foi fornecida."
        );

    }


    if (
        !campo ||
        !campo.name
    ) {

        return null;

    }


    // ==========================================================
    // GRUPO
    // ==========================================================

    const grupo =
        document.createElement("div");

    grupo.className =
        "form-group";


    // ==========================================================
    // LABEL
    // ==========================================================

    const label =
        document.createElement("label");


    label.htmlFor =
        gerarIdCampo(
            campo.name
        );


    label.textContent =
        campo.label ||
        campo.name;


    // ==========================================================
    // INPUT
    // ==========================================================

    const input =
        criarInput(
            campo,
            {
                gerarIdCampo
            }
        );


    if (!input) {

        return null;

    }


    // ==========================================================
    // SELECT RELACIONAL
    // ==========================================================

    if (
        campo.type === "select" &&
        campo.source &&
        typeof configurarCampoSelect === "function"
    ) {

        await configurarCampoSelect(
            campo,
            input
        );

    }


    // ==========================================================
    // MONTA CAMPO
    // ==========================================================

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

export function criarInput(
    campo,
    config = {}
) {

    const {
        gerarIdCampo
    } = config;


    if (
        typeof gerarIdCampo !== "function"
    ) {

        throw new Error(
            "field.js: gerarIdCampo não foi fornecida."
        );

    }


    if (!campo) {

        return null;

    }


    const id =
        gerarIdCampo(
            campo.name
        );


    let input;


    // ==========================================================
    // TIPO DO CAMPO
    // ==========================================================

    switch (campo.type) {


        // ------------------------------------------------------
        // TEXT
        // ------------------------------------------------------

        case "text":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "text";

            break;


        // ------------------------------------------------------
        // DATE
        // ------------------------------------------------------

        case "date":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "date";

            break;


        // ------------------------------------------------------
        // DATETIME
        // ------------------------------------------------------

        case "datetime":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "datetime-local";

            break;


        // ------------------------------------------------------
        // TIME
        // ------------------------------------------------------

        case "time":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "time";

            break;


        // ------------------------------------------------------
        // NUMBER
        // ------------------------------------------------------

        case "number":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "number";

            break;


        // ------------------------------------------------------
        // EMAIL
        // ------------------------------------------------------

        case "email":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "email";

            break;


        // ------------------------------------------------------
        // TEXTAREA
        // ------------------------------------------------------

        case "textarea":

            input =
                document.createElement(
                    "textarea"
                );

            break;


        // ------------------------------------------------------
        // SELECT
        // ------------------------------------------------------

        case "select":

            input =
                criarSelect(
                    campo
                );

            break;


        // ------------------------------------------------------
        // CHECKBOX
        // ------------------------------------------------------

        case "checkbox":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "checkbox";

            break;


        // ------------------------------------------------------
        // FILE
        // ------------------------------------------------------

        case "file":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "file";

            break;


        // ------------------------------------------------------
        // PADRÃO
        // ------------------------------------------------------

        default:

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "text";

            break;

    }


    // ==========================================================
    // ATRIBUTOS
    // ==========================================================

    input.id =
        id;


    input.name =
        campo.name;


    input.className =
        campo.type === "checkbox"
            ? "form-checkbox"
            : "form-control";


    // ==========================================================
    // REQUIRED
    // ==========================================================

    if (
        campo.required
    ) {

        input.required =
            true;

    }


    // ==========================================================
    // READONLY
    // ==========================================================

    if (
        campo.readonly
    ) {

        input.readOnly =
            true;

    }


    // ==========================================================
    // DISABLED
    // ==========================================================

    if (
        campo.disabled
    ) {

        input.disabled =
            true;

    }


    // ==========================================================
    // PLACEHOLDER
    // ==========================================================

    if (
        campo.placeholder
    ) {

        input.placeholder =
            campo.placeholder;

    }


    // ==========================================================
    // MIN
    // ==========================================================

    if (
        campo.min !== undefined
    ) {

        input.min =
            campo.min;

    }


    // ==========================================================
    // MAX
    // ==========================================================

    if (
        campo.max !== undefined
    ) {

        input.max =
            campo.max;

    }


    // ==========================================================
    // STEP
    // ==========================================================

    if (
        campo.step !== undefined
    ) {

        input.step =
            campo.step;

    }


    // ==========================================================
    // VALOR PADRÃO
    // ==========================================================

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


    return input;

}


/**
 * ============================================================
 * CRIAR SELECT
 * ============================================================
 */

export function criarSelect(
    campo
) {

    const select =
        document.createElement(
            "select"
        );


    select.className =
        "form-control";


    // ==========================================================
    // OPÇÃO VAZIA
    // ==========================================================

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


    // ==========================================================
    // OPÇÕES
    // ==========================================================

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


            // Guarda o texto visual

            option.dataset.label =
                option.textContent;


            select.appendChild(
                option
            );

        }
    );


    return select;

}
