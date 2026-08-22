/**
 * ============================================================
 * FORM - UPPERCASE
 * ============================================================
 */

export function aplicarCaixaAlta(input, campo) {

    if (!input || !campo) {
        return;
    }

    const tiposTexto = [
        "text",
        "textarea",
        "email"
    ];

    if (!tiposTexto.includes(campo.type)) {
        return;
    }

    input.addEventListener("input", () => {

        const inicio =
            input.selectionStart;

        const fim =
            input.selectionEnd;

        input.value =
            input.value.toLocaleUpperCase("pt-BR");

        try {

            input.setSelectionRange(
                inicio,
                fim
            );

        } catch (erro) {

            // Alguns elementos não suportam
            // controle de seleção.

        }

    });
}
