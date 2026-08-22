/**
 * ============================================================
 * FORM / FORMATTERS
 * ============================================================
 */

export function formatarValor(
    campo,
    valor
) {

    if (
        campo.type === "date"
    ) {

        return converterData(
            valor
        );

    }


    if (
        campo.type === "datetime"
    ) {

        return converterDataHora(
            valor
        );

    }


    return String(valor);

}


/**
 * ============================================================
 * DATA
 * ============================================================
 */

export function converterData(valor) {

    if (!valor) {

        return "";

    }


    const texto =
        String(valor);


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            texto
        )
    ) {

        return texto;

    }


    const partes =
        texto.split("/");


    if (
        partes.length === 3
    ) {

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
 * DATA / HORA
 * ============================================================
 */

export function converterDataHora(
    valor
) {

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
