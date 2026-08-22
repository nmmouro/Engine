/**
 * ============================================================
 * FORM VALIDATION
 * ============================================================
 */

export function validarFormulario(
    config = {}
) {

    const {
        schema,
        dados,
        obterInput
    } = config;


    for (
        const campo of schema.fields
    ) {

        // ========================================================
        // CAMPO OCULTO
        // ========================================================

        if (
            campo.hidden === true ||
            campo.visible === false
        ) {

            continue;

        }


        const nome =
            campo.name || "";


        if (
            nome === "ID" ||
            nome.startsWith("ID ")
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
                dados[
                    campo.idField
                ];


            if (
                !valorValido(id)
            ) {

                return mostrarErroCampo({

                    campo,

                    obterInput

                });

            }


            continue;

        }


        // ========================================================
        // CAMPO NORMAL
        // ========================================================

        const valor =
            dados[
                campo.name
            ];


        if (
            !valorValido(valor)
        ) {

            return mostrarErroCampo({

                campo,

                obterInput

            });

        }

    }


    return true;

}


// ============================================================
// VALOR VÁLIDO
// ============================================================

function valorValido(valor) {

    if (
        valor === undefined ||
        valor === null
    ) {

        return false;

    }


    if (
        typeof valor === "boolean"
    ) {

        return true;

    }


    return (
        String(valor).trim() !== ""
    );

}


// ============================================================
// MOSTRAR ERRO
// ============================================================

function mostrarErroCampo(
    config
) {

    const {
        campo,
        obterInput
    } = config;


    const mensagem =
        `O campo "${campo.label || campo.name}" é obrigatório.`;


    console.error(
        "Form:",
        mensagem
    );


    alert(
        mensagem
    );


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
