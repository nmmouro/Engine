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
/**
 * ============================================================
 * FORM VALIDATION
 * ============================================================
 */

export function validarFormulario({
    schema,
    dados,
    deveExibirCampo,
    obterInput
}) {

    if (!schema) {
        return false;
    }

    for (const campo of schema.fields) {

        // --------------------------------------------------------
        // Ignora campos que não aparecem no formulário
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

        const valor =
            dados?.[campo.name];

        // --------------------------------------------------------
        // Verifica vazio
        // --------------------------------------------------------

        if (
            valor === undefined ||
            valor === null ||
            String(valor).trim() === ""
        ) {

            const mensagem =
                `O campo "${campo.label || campo.name}" é obrigatório.`;

            console.error(
                "Form:",
                mensagem
            );

            alert(mensagem);

            // ----------------------------------------------------
            // Coloca foco no campo
            // ----------------------------------------------------

            if (typeof obterInput === "function") {

                const input =
                    obterInput(campo.name);

                if (input) {
                    input.focus();
                }
            }

            return false;
        }
    }

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
