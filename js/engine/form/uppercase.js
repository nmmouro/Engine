/**
 * ============================================================
 * FORM UPPERCASE
 * ============================================================
 *
 * Converte campos de texto para CAIXA ALTA.
 * ============================================================
 */

const TIPOS_TEXTO = [

    "text",

    "textarea",

    "email"

];


// ============================================================
// APLICAR CAIXA ALTA
// ============================================================

export function aplicarCaixaAlta(
    input,
    campo
) {

    if (
        !input ||
        !campo
    ) {

        return;

    }


    if (
        !TIPOS_TEXTO.includes(
            campo.type
        )
    ) {

        return;

    }


    input.addEventListener(
        "input",
        () => {

            const inicio =
                input.selectionStart;


            const fim =
                input.selectionEnd;


            input.value =
                input.value.toLocaleUpperCase(
                    "pt-BR"
                );


            try {

                input.setSelectionRange(
                    inicio,
                    fim
                );

            } catch {

                // Alguns elementos não
                // suportam seleção.

            }

        }
    );

}


// ============================================================
// CONVERTER VALOR
// ============================================================

export function converterParaCaixaAlta(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return valor;

    }


    return String(
        valor
    ).toLocaleUpperCase(
        "pt-BR"
    );

}
