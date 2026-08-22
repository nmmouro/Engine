/**
 * ============================================================
 * FORM VALUES
 * ============================================================
 *
 * Responsável por:
 * - Preencher formulário
 * - Ler formulário
 * - Limpar formulário
 * - Aplicar valores padrão
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * ============================================================
 * SET FORM DATA
 * ============================================================
 */
export async function setFormData(
    schema,
    dados = {},
    options = {}
) {

    const {
        obterInput,
        deveExibirCampo,
        configurarCampoSelect,
        formatarValor
    } = options;


    if (typeof obterInput !== "function") {

        throw new Error(
            "values.js: obterInput não foi fornecida."
        );

    }


    if (typeof deveExibirCampo !== "function") {

        throw new Error(
            "values.js: deveExibirCampo não foi fornecida."
        );

    }


    if (typeof formatarValor !== "function") {

        throw new Error(
            "values.js: formatarValor não foi fornecida."
        );

    }


    // ============================================================
    // SELECTS RELACIONAIS
    // ============================================================

    for (const campo of schema.fields) {

        if (!deveExibirCampo(campo)) {
            continue;
        }


        if (
            campo.type !== "select" ||
            !campo.source
        ) {
            continue;
        }


        const input =
            obterInput(campo.name);


        if (!input) {
            continue;
        }


        let valorAtual = "";


        if (campo.idField) {

            valorAtual =
                dados[campo.idField] ?? "";

        } else {

            valorAtual =
                dados[campo.name] ?? "";

        }


        if (
            typeof configurarCampoSelect ===
            "function"
        ) {

            await configurarCampoSelect(
                campo,
                input,
                valorAtual
            );

        }

    }


    // ============================================================
    // DEMAIS CAMPOS
    // ============================================================

    schema.fields.forEach(campo => {

        if (!deveExibirCampo(campo)) {
            return;
        }


        // --------------------------------------------------------
        // Select relacional
        // --------------------------------------------------------

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


        // --------------------------------------------------------
        // Checkbox
        // --------------------------------------------------------

        if (
            input.type === "checkbox"
        ) {

            input.checked =
                Boolean(valor);

            return;

        }


        // --------------------------------------------------------
        // Demais campos
        // --------------------------------------------------------

        input.value =
            formatarValor(
                campo,
                valor
            );

    });

}


/**
 * ============================================================
 * GET FORM DATA
 * ============================================================
 */
export function getFormData(
    schema,
    options = {}
) {

    const {
        obterInput,
        deveExibirCampo
    } = options;


    if (typeof obterInput !== "function") {

        throw new Error(
            "values.js: obterInput não foi fornecida."
        );

    }


    if (typeof deveExibirCampo !== "function") {

        throw new Error(
            "values.js: deveExibirCampo não foi fornecida."
        );

    }


    const dados = {};


    schema.fields.forEach(campo => {

        if (!deveExibirCampo(campo)) {
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


            // ID técnico
            dados[campo.idField] =
                id;


            // Valor visual
            dados[campo.name] =
                id
                    ? label.trim()
                    : "";


            return;

        }


        // ========================================================
        // DEMAIS CAMPOS
        // ========================================================

        let valor =
            input.value;


        // --------------------------------------------------------
        // Checkbox
        // --------------------------------------------------------

        if (
            input.type === "checkbox"
        ) {

            valor =
                input.checked;

        }


        // --------------------------------------------------------
        // Data
        // --------------------------------------------------------

        if (
            campo.type === "date"
        ) {

            valor =
                input.value || "";

        }


        // --------------------------------------------------------
        // Hora
        // --------------------------------------------------------

        if (
            campo.type === "time"
        ) {

            valor =
                input.value || "";

        }


        dados[campo.name] =
            valor;

    });


    return dados;

}


/**
 * ============================================================
 * RESET FORM DATA
 * ============================================================
 */
export function resetFormData(
    schema,
    options = {}
) {

    const {
        obterInput,
        deveExibirCampo
    } = options;


    if (typeof obterInput !== "function") {

        throw new Error(
            "values.js: obterInput não foi fornecida."
        );

    }


    if (typeof deveExibirCampo !== "function") {

        throw new Error(
            "values.js: deveExibirCampo não foi fornecida."
        );

    }


    // ============================================================
    // LIMPA CAMPOS
    // ============================================================

    schema.fields.forEach(campo => {

        if (!deveExibirCampo(campo)) {
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

            input.checked = false;

        } else {

            input.value = "";

        }

    });


    // ============================================================
    // APLICA DEFAULT VALUE
    // ============================================================

    schema.fields.forEach(campo => {

        if (!deveExibirCampo(campo)) {
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

    });

}
