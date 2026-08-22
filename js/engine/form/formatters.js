/**
 * ============================================================
 * FORM - FORMATTERS
 * ============================================================
 */

/**
 * Formata um valor para o input.
 */
export function formatarValor(campo, valor) {

    if (!campo) {
        return "";
    }

    if (campo.type === "date") {

        return converterDataParaInput(valor);
    }

    if (campo.type === "datetime") {

        return converterDataHoraParaInput(valor);
    }

    return String(valor);
}


/**
 * ============================================================
 * DATA → YYYY-MM-DD
 * ============================================================
 */
export function converterDataParaInput(valor) {

    if (!valor) {
        return "";
    }

    const texto =
        String(valor);

    // Já está correto
    if (
        /^\d{4}-\d{2}-\d{2}$/.test(texto)
    ) {
        return texto;
    }

    // DD/MM/YYYY
    const partes =
        texto.split("/");

    if (partes.length === 3) {

        const [
            dia,
            mes,
            ano
        ] = partes;

        return (
            `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`
        );
    }

    return "";
}


/**
 * ============================================================
 * DATA/HORA → DATETIME-LOCAL
 * ============================================================
 */
export function converterDataHoraParaInput(valor) {

    if (!valor) {
        return "";
    }

    const texto =
        String(valor);

    if (
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
            .test(texto)
    ) {
        return texto;
    }

    return texto
        .replace(" ", "T")
        .substring(0, 16);
}
