/**
 * ============================================================
 * FORM / VALIDATION
 * ============================================================
 */

export function validar(config = {}) {

    const {
        schema,
        dados,
        obterInput,
        deveExibirCampo
    } = config;


    for (const campo of schema.fields) {

        // ========================================================
        // CAMPO OCULTO
        // ========================================================

        if (
            !deveExibirCampo(campo)
        ) {

            continue;

        }


        // ========================================================
        // NÃO OBRIGATÓRIO
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

            const id =
                dados[campo.idField];


            if (
                id === undefined ||
                id === null ||
                String(id).trim() === ""
            ) {

                mostrarErro(
                    campo
                );


                focarCampo(
                    campo,
                    obterInput
                );


                return false;

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

            mostrarErro(
                campo
            );


            focarCampo(
                campo,
                obterInput
            );


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

function mostrarErro(campo) {

    const mensagem =
        `O campo "${campo.label || campo.name}" é obrigatório.`;


    console.error(
        "Form:",
        mensagem
    );


    alert(
        mensagem
    );

}


/**
 * ============================================================
 * FOCAR CAMPO
 * ============================================================
 */

function focarCampo(
    campo,
    obterInput
) {

    const input =
        obterInput(
            campo.name
        );


    if (input) {

        input.focus();

    }

}
