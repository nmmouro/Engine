/**
 * ============================================================
 * FORM — VALIDATION
 * ============================================================
 *
 * Responsável por:
 *
 * - Validar campos obrigatórios
 * - Validar selects relacionais
 * - Exibir mensagem de erro
 * - Posicionar o foco no campo inválido
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * ============================================================
 * VALIDAR FORMULÁRIO
 * ============================================================
 *
 * @param {Object} config
 *
 * config.schema
 * config.dados
 * config.obterInput
 * config.deveExibirCampo
 *
 * @returns {Boolean}
 * ============================================================
 */

export function validar(config = {}) {

    const {
        schema,
        dados,
        obterInput,
        deveExibirCampo
    } = config;


    // ============================================================
    // VALIDAÇÕES INICIAIS
    // ============================================================

    if (!schema) {

        console.error(
            "validation.js: schema não foi fornecido."
        );

        return false;

    }


    if (!Array.isArray(schema.fields)) {

        console.error(
            "validation.js: schema.fields não é um array."
        );

        return false;

    }


    if (!dados) {

        console.error(
            "validation.js: dados não foram fornecidos."
        );

        return false;

    }


    // ============================================================
    // VERIFICA CAMPOS
    // ============================================================

    for (const campo of schema.fields) {


        // ========================================================
        // CAMPO OCULTO
        // ========================================================

        if (
            typeof deveExibirCampo === "function" &&
            !deveExibirCampo(campo)
        ) {

            continue;

        }


        // ========================================================
        // CAMPO NÃO OBRIGATÓRIO
        // ========================================================

        if (!campo.required) {

            continue;

        }


        // ========================================================
        // SELECT RELACIONAL
        // ========================================================

        if (
            campo.type === "select" &&
            campo.source &&
            campo.idField
        ) {

            const valor =
                dados[campo.idField];


            if (
                valor === undefined ||
                valor === null ||
                String(valor).trim() === ""
            ) {

                return mostrarErroValidacao(
                    campo,
                    obterInput
                );

            }


            continue;

        }


        // ========================================================
        // CAMPO NORMAL
        // ========================================================

        const valor =
            dados[campo.name];


        if (
            valor === undefined ||
            valor === null ||
            String(valor).trim() === ""
        ) {

            return mostrarErroValidacao(
                campo,
                obterInput
            );

        }

    }


    // ============================================================
    // FORMULÁRIO VÁLIDO
    // ============================================================

    return true;

}


/**
 * ============================================================
 * MOSTRAR ERRO DE VALIDAÇÃO
 * ============================================================
 */

function mostrarErroValidacao(
    campo,
    obterInput
) {

    const nome =
        campo.label ||
        campo.name;


    const mensagem =
        `O campo "${nome}" é obrigatório.`;


    console.error(
        "Form:",
        mensagem
    );


    alert(
        mensagem
    );


    // ============================================================
    // FOCAR CAMPO
    // ============================================================

    if (
        typeof obterInput ===
        "function"
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
