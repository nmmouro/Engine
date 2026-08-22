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

/**
 * ============================================================
 * DATA E HORA ATUAIS
 * ============================================================
 */

/**
 * Retorna a data atual no formato:
 *
 * yyyy-mm-dd
 *
 * Compatível com input type="date".
 */
export function dataAtualInput() {

    const agora = new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            agora.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


/**
 * Retorna a hora atual no formato:
 *
 * HH:mm
 *
 * Compatível com input type="time".
 */
export function horaAtualInput() {

    const agora = new Date();

    const hora =
        String(
            agora.getHours()
        ).padStart(2, "0");

    const minuto =
        String(
            agora.getMinutes()
        ).padStart(2, "0");

    return `${hora}:${minuto}`;
}
