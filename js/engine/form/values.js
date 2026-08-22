/**
 * ============================================================
 * VALUES
 * ============================================================
 *
 * Responsável por:
 * - Ler valores do formulário
 * - Preencher valores
 * - Limpar valores
 * - Aplicar valores padrão
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * ============================================================
 * GET FORM DATA
 * ============================================================
 */
export function getFormData(
    schema,
    container,
    obterInput
) {

    const dados = {};


    if (
        !schema ||
        !Array.isArray(schema.fields)
    ) {

        return dados;

    }


    schema.fields.forEach(
        campo => {

            // ----------------------------------------------------
            // Campo oculto/técnico
            // ----------------------------------------------------

            if (
                campo.hidden === true ||
                campo.visible === false ||
                campo.name === "ID" ||
                campo.name?.startsWith("ID ")
            ) {

                return;

            }


            const input =
                obterInput(campo.name);


            if (!input) {

                return;

            }


            // ====================================================
            // CHECKBOX
            // ====================================================

            if (
                input.type === "checkbox"
            ) {

                dados[campo.name] =
                    input.checked;

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
                    input.selectedOptions?.[0];


                const id =
                    input.value || "";


                const label =
                    option?.dataset?.label ||
                    option?.textContent ||
                    "";


                dados[campo.idField] =
                    id;


                dados[campo.name] =
                    id
                        ? label.trim()
                        : "";


                return;

            }


            // ====================================================
            // CAMPOS NORMAIS
            // ====================================================

            dados[campo.name] =
                input.value ?? "";

        }
    );


    return dados;

}


/**
 * ============================================================
 * SET FORM DATA
 * ============================================================
 */
export function setFormData(
    schema,
    dados = {},
    obterInput,
    formatarValor
) {

    if (
        !schema ||
        !Array.isArray(schema.fields)
    ) {

        return;

    }


    schema.fields.forEach(
        campo => {

            // ----------------------------------------------------
            // Campo técnico
            // ----------------------------------------------------

            if (
                campo.hidden === true ||
                campo.visible === false ||
                campo.name === "ID" ||
                campo.name?.startsWith("ID ")
            ) {

                return;

            }


            // ----------------------------------------------------
            // Select relacional é tratado pelo select.js
            // ----------------------------------------------------

            if (
                campo.type === "select" &&
                campo.source
            ) {

                return;

            }


            const input =
                obterInput(campo.name);


            if (!input) {

                return;

            }


            const valor =
                dados[campo.name];


            if (
                valor === undefined ||
                valor === null
            ) {

                return;

            }


            // ====================================================
            // CHECKBOX
            // ====================================================

            if (
                input.type === "checkbox"
            ) {

                input.checked =
                    Boolean(valor);

                return;

            }


            // ====================================================
            // VALOR
            // ====================================================

            input.value =
                typeof formatarValor === "function"
                    ? formatarValor(
                        campo,
                        valor
                    )
                    : String(valor);

        }
    );

}


/**
 * ============================================================
 * RESET FORM
 * ============================================================
 */
export function resetForm(
    schema,
    obterInput
) {

    if (
        !schema ||
        !Array.isArray(schema.fields)
    ) {

        return;

    }


    schema.fields.forEach(
        campo => {

            if (
                campo.hidden === true ||
                campo.visible === false ||
                campo.name === "ID" ||
                campo.name?.startsWith("ID ")
            ) {

                return;

            }


            const input =
                obterInput(campo.name);


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
    // APLICA VALORES PADRÃO
    // ============================================================

    schema.fields.forEach(
        campo => {

            if (
                campo.hidden === true ||
                campo.visible === false ||
                campo.name === "ID" ||
                campo.name?.startsWith("ID ")
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
                obterInput(campo.name);


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
