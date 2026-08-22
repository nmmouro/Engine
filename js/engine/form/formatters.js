/**
 * ============================================================
 * FORM FORMATTERS
 * ============================================================
 */

export function formatarValor(
    campo,
    valor
) {

    if (
        campo.type === "date"
    ) {

        return converterDataParaInput(
            valor
        );

    }


    if (
        campo.type === "datetime"
    ) {

        return converterDataHoraParaInput(
            valor
        );

    }


    if (
        campo.type === "time"
    ) {

        return String(valor);

    }


    return String(valor);

}


// ============================================================
// DATA
// ============================================================

export function converterDataParaInput(
    valor
) {

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


// ============================================================
// DATA/HORA
// ============================================================

export function converterDataHoraParaInput(
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
        .replace(
            " ",
            "T"
        )
        .substring(
            0,
            16
        );

}


// ============================================================
// HORA
// ============================================================

export function horaAtual() {

    const agora =
        new Date();


    return (
        String(
            agora.getHours()
        ).padStart(2, "0") +
        ":" +
        String(
            agora.getMinutes()
        ).padStart(2, "0")
    );

}


// ============================================================
// DATA ATUAL
// ============================================================

export function dataAtual() {

    const agora =
        new Date();


    return (
        agora.getFullYear() +
        "-" +
        String(
            agora.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            agora.getDate()
        ).padStart(2, "0")
    );

}
