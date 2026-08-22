/**
 * ============================================================
 * FORM VALIDATION
 * ============================================================
 *
 * Responsável por:
 * - Validar campos obrigatórios
 * - Exibir mensagens de erro
 * - Focar o campo com problema
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * ============================================================
 * VALIDAR FORMULÁRIO
 * ============================================================
 *
 * @param {Object} params
 * @param {Object} params.schema
 * @param {Object} params.dados
 * @param {Function} params.deveExibirCampo
 * @param {Function} params.obterInput
 *
 * @returns {Boolean}
 */
export function validar({
    schema,
    dados,
    deveExibirCampo,
    obterInput
}) {

    // ============================================================
    // VALIDAÇÃO BÁSICA
    // ============================================================

    if (
        !schema ||
        !Array.isArray(schema.fields)
    ) {

        console.error(
            "Validation: schema inválido."
        );

        return false;

    }


    // ============================================================
    // PERCORRE CAMPOS
    // ============================================================

    for (const campo of schema.fields) {

        // --------------------------------------------------------
        // Campos técnicos/ocultos
        // --------------------------------------------------------

        if (
            typeof deveExibirCampo === "function" &&
            !deveExibirCampo(campo)
        ) {

            continue;

        }


        // --------------------------------------------------------
        // Campo não obrigatório
        // --------------------------------------------------------

        if (!campo.required) {

            continue;

        }


        // ========================================================
        // VALOR
        // ========================================================

        const valor =
            dados?.[campo.name];


        // ========================================================
        // VERIFICA VAZIO
        // ========================================================

        const vazio =
            valor === undefined ||
            valor === null ||
            String(valor).trim() === "";


        if (!vazio) {

            continue;

        }


        // ========================================================
        // MENSAGEM
        // ========================================================

        const mensagem =
            `O campo "${campo.label || campo.name}" é obrigatório.`;


        mostrarErro(
            mensagem
        );


        // ========================================================
        // FOCO NO CAMPO
        // ========================================================

        if (
            typeof obterInput === "function"
        ) {

            const input =
                obterInput(
                    campo.name
                );


            if (input) {

                input.focus();

            }

        }


        return false;

    }


    // ============================================================
    // FORMULÁRIO VÁLIDO
    // ============================================================

    return true;

}


/**
 * ============================================================
 * MOSTRAR ERRO
 * ============================================================
 */
export function mostrarErro(mensagem) {

    console.error(
        "Form:",
        mensagem
    );


    window.alert(
        mensagem
    );

}
