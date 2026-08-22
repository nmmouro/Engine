/**
 * ============================================================
 * FORM VALUES
 * ============================================================
 *
 * Responsável por:
 * - Ler valores do formulário
 * - Preencher formulário
 * - Limpar formulário
 * ============================================================
 */


/**
 * ============================================================
 * GET FORM DATA
 * ============================================================
 */

export function getFormData({
    schema,
    obterInput,
    deveExibirCampo
}) {

    if (
        typeof obterInput !==
        "function"
    ) {

        throw new Error(
            "values.js: obterInput não foi fornecida."
        );

    }


    const dados = {};


    schema.fields.forEach(
        campo => {

            // ----------------------------------------------------
            // Campos técnicos
            // ----------------------------------------------------

            if (
                typeof deveExibirCampo ===
                "function" &&
                !deveExibirCampo(campo)
            ) {

                return;

            }


            const input =
                obterInput(
                    campo.name
                );


            if (!input) {

                return;

            }


            // ====================================================
            // SELECT RELACIONAL
            // ====================================================

            if (
                campo.type === "select" &&
                campo.source &&
                campo.idField
            ) {

                const option =
                    input.selectedOptions[0];


                const id =
                    input.value || "";


                const label =
                    option?.dataset?.label ||
                    option?.textContent ||
                    "";


                dados[
                    campo.idField
                ] = id;


                dados[
                    campo.name
                ] =
                    id
                        ? label.trim()
                        : "";


                return;

            }


            // ====================================================
            // CHECKBOX
            // ====================================================

            if (
                input.type === "checkbox"
            ) {

                dados[
                    campo.name
                ] =
                    input.checked;


                return;

            }


            // ====================================================
            // CAMPOS NORMAIS
            // ====================================================

            dados[
                campo.name
            ] =
                input.value;

        }
    );


    return dados;

}


/**
 * ============================================================
 * SET FORM DATA
 * ============================================================
 */

export function setFormData({
    schema,
    dados = {},
    obterInput,
    deveExibirCampo,
    formatarValor
}) {

    if (
        typeof obterInput !==
        "function"
    ) {

        throw new Error(
            "values.js: obterInput não foi fornecida."
        );

    }


    schema.fields.forEach(
        campo => {

            // ----------------------------------------------------
            // Campos técnicos
            // ----------------------------------------------------

            if (
                typeof deveExibirCampo ===
                "function" &&
                !deveExibirCampo(campo)
            ) {

                return;

            }


            // ----------------------------------------------------
            // Select relacional
            //
            // É tratado pelo select.js.
            // ----------------------------------------------------

            if (
                campo.type === "select" &&
                campo.source
            ) {

                return;

            }


            const input =
                obterInput(
                    campo.name
                );


            if (!input) {

                return;

            }


            const valor =
                dados[
                    campo.name
                ];


            if (
                valor === undefined ||
                valor === null
            ) {

                return;

            }


            // ----------------------------------------------------
            // Checkbox
            // ----------------------------------------------------

            if (
                input.type === "checkbox"
            ) {

                input.checked =
                    Boolean(valor);

                return;

            }


            // ----------------------------------------------------
            // Formatação
            // ----------------------------------------------------

            if (
                typeof formatarValor ===
                "function"
            ) {

                input.value =
                    formatarValor(
                        campo,
                        valor
                    );

            } else {

                input.value =
                    String(valor);

            }

        }
    );

}


/**
 * ============================================================
 * RESET FORM DATA
 * ============================================================
 */

export function resetFormData({
    schema,
    obterInput,
    deveExibirCampo
}) {

    if (
        typeof obterInput !==
        "function"
    ) {

        throw new Error(
            "values.js: obterInput não foi fornecida."
        );

    }


    schema.fields.forEach(
        campo => {

            // ----------------------------------------------------
            // Campos técnicos
            // ----------------------------------------------------

            if (
                typeof deveExibirCampo ===
                "function" &&
                !deveExibirCampo(campo)
            ) {

                return;

            }


            const input =
                obterInput(
                    campo.name
                );


            if (!input) {

                return;

            }


            // ----------------------------------------------------
            // Checkbox
            // ----------------------------------------------------

            if (
                input.type === "checkbox"
            ) {

                input.checked =
                    false;

                return;

            }


            // ----------------------------------------------------
            // Demais campos
            // ----------------------------------------------------

            input.value = "";

        }
    );


    // ============================================================
    // VALORES PADRÃO
    // ============================================================

    schema.fields.forEach(
        campo => {

            if (
                typeof deveExibirCampo ===
                "function" &&
                !deveExibirCampo(campo)
            ) {

                return;

            }


            if (
                campo.defaultValue ===
                undefined
            ) {

                return;

            }


            const input =
                obterInput(
                    campo.name
                );


            if (!input) {

                return;

            }


            if (
                input.type === "checkbox"
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
    );

}
