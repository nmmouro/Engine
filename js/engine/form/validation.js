/**
 * ============================================================
 * FORM — VALIDATION
 * ============================================================
 *
 * Responsável pelas validações dos campos do formulário.
 * ============================================================
 */


/**
 * ============================================================
 * VALIDAR FORMULÁRIO
 * ============================================================
 */

export function validar({
    schema,
    dados,
    obterInput,
    deveExibirCampo,
    mostrarErro
}) {

    if (!schema) {

        throw new Error(
            "validation.js: schema não informado."
        );

    }


    if (!dados) {

        return false;

    }


    for (const campo of schema.fields) {

        // --------------------------------------------------------
        // Campo não visível
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


        // --------------------------------------------------------
        // Select relacional
        // --------------------------------------------------------

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

                const mensagem =
                    `O campo "${campo.label || campo.name}" é obrigatório.`;

                if (
                    typeof mostrarErro === "function"
                ) {

                    mostrarErro(mensagem);

                }


                focarCampo(
                    campo.name,
                    obterInput
                );

                return false;

            }


            continue;

        }


        // --------------------------------------------------------
        // Campo normal
        // --------------------------------------------------------

        const valor =
            dados[campo.name];


        if (
            valor === undefined ||
            valor === null ||
            String(valor).trim() === ""
        ) {

            const mensagem =
                `O campo "${campo.label || campo.name}" é obrigatório.`;

            if (
                typeof mostrarErro === "function"
            ) {

                mostrarErro(mensagem);

            }


            focarCampo(
                campo.name,
                obterInput
            );

            return false;

        }

    }


    return true;

}


/**
 * ============================================================
 * FOCAR CAMPO
 * ============================================================
 */

function focarCampo(
    nome,
    obterInput
) {

    if (
        typeof obterInput !== "function"
    ) {

        return;

    }


    const input =
        obterInput(nome);


    if (input) {

        input.focus();

    }

}
