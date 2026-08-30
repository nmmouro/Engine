// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(valor) {

    return String(
        valor ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


// ============================================================
// ESCAPAR ATRIBUTO
// ============================================================

function escaparAtributo(valor) {

    return escaparHTML(
        valor
    );

}
