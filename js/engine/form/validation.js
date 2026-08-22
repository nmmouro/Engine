/**
 * ============================================================
 * FORM - VALIDATION
 * ============================================================
 */

export function validarFormulario(
    schema,
    dados,
    obterInput,
    mostrarErro
) {

    for (const campo of schema.fields) {

        // Campos ocultos/técnicos não são validados
        if (
            campo.hidden === true ||
            campo.visible === false
        ) {
            continue;
        }

        if (
            campo.name === "ID" ||
            campo.name?.startsWith("ID ")
        ) {
            continue;
        }

        if (!campo.required) {
            continue;
        }

        const valor =
            dados[campo.name];

        if (
            valor === undefined ||
            valor === null ||
            String(valor).trim() === ""
        ) {

            const mensagem =
                `O campo "${campo.label || campo.name}" é obrigatório.`;

            mostrarErro(mensagem);

            const input =
                obterInput(campo.name);

            if (input) {
                input.focus();
            }

            return false;
        }
    }

    return true;
}


export function mostrarErroFormulario(mensagem) {

    console.error(
        "Form:",
        mensagem
    );

    window.alert(mensagem);
}
