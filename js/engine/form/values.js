/**
 * ============================================================
 * FORM VALUES
 * ============================================================
 *
 * Responsável por:
 * - Ler os valores do formulário
 * - Preencher o formulário
 * - Limpar os valores
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * ============================================================
 * GET FORM DATA
 * ============================================================
 *
 * Lê os valores dos campos visíveis do formulário.
 *
 * @param {Object} params
 * @param {Object} params.schema
 * @param {HTMLElement} params.elemento
 * @param {Function} params.deveExibirCampo
 * @param {Function} params.obterInput
 * @param {Function} params.formatarValor
 *
 * @returns {Object}
 */
export function getFormData({
    schema,
    elemento,
    deveExibirCampo,
    obterInput
}) {

    const dados = {};


    if (!schema || !Array.isArray(schema.fields)) {

        return dados;

    }


    schema.fields.forEach(campo => {

        // ========================================================
        // CAMPOS OCULTOS / TÉCNICOS
        // ========================================================

        if (
            typeof deveExibirCampo === "function" &&
            !deveExibirCampo(campo)
        ) {

            return;

        }


        const input =
            obterInput(campo.name);


        if (!input) {

            return;

        }


        // ========================================================
        // SELECT RELACIONAL
        // ========================================================

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


            // ----------------------------------------------------
            // ID técnico
            // ----------------------------------------------------

            dados[campo.idField] =
                id;


            // ----------------------------------------------------
            // Valor apresentado
            // ----------------------------------------------------

            dados[campo.name] =
                id
                    ? label.trim()
                    : "";


            return;

        }


        // ========================================================
        // CHECKBOX
        // ========================================================

        if (
            input.type === "checkbox"
        ) {

            dados[campo.name] =
                input.checked;

            return;

        }


        // ========================================================
        // DEMAIS CAMPOS
        // ========================================================

        dados[campo.name] =
            input.value ?? "";

    });


    return dados;

}


/**
 * ============================================================
 * SET FORM DATA
 * ============================================================
 *
 * Preenche o formulário com os dados recebidos.
 *
 * @param {Object} params
 */
export function setFormData({
    schema,
    dados = {},
    deveExibirCampo,
    obterInput,
    formatarValor
}) {

    if (!schema || !Array.isArray(schema.fields)) {

        return;

    }


    schema.fields.forEach(campo => {

        // ========================================================
        // CAMPOS OCULTOS / TÉCNICOS
        // ========================================================

        if (
            typeof deveExibirCampo === "function" &&
            !deveExibirCampo(campo)
        ) {

            return;

        }


        // ========================================================
        // SELECT RELACIONAL
        //
        // É tratado pelo select.js.
        // ========================================================

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


        // ========================================================
        // CHECKBOX
        // ========================================================

        if (
            input.type === "checkbox"
        ) {

            input.checked =
                Boolean(valor);

            return;

        }


        // ========================================================
        // FORMATAÇÃO
        // ========================================================

        if (
            typeof formatarValor === "function"
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

    });

}


/**
 * ============================================================
 * RESET FORM DATA
 * ============================================================
 *
 * Limpa todos os campos visíveis do formulário.
 *
 * Depois reaplica os valores padrão definidos no Schema.
 *
 * @param {Object} params
 */
export function resetFormData({
    schema,
    deveExibirCampo,
    obterInput
}) {

    if (!schema || !Array.isArray(schema.fields)) {

        return;

    }


    // ============================================================
    // LIMPAR CAMPOS
    // ============================================================

    schema.fields.forEach(campo => {

        if (
            typeof deveExibirCampo === "function" &&
            !deveExibirCampo(campo)
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
                false;

        } else {

            input.value =
                "";

        }

    });


    // ============================================================
    // APLICAR VALORES PADRÃO
    // ============================================================

    schema.fields.forEach(campo => {

        if (
            typeof deveExibirCampo === "function" &&
            !deveExibirCampo(campo)
        ) {

            return;

        }


        if (
            campo.defaultValue === undefined
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

    });

}
