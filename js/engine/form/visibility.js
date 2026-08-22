/**
 * ============================================================
 * FORM / VISIBILITY
 * ============================================================
 */

export function deveExibirCampo(campo) {

    if (!campo) {

        return false;

    }


    const nome =
        campo.name || "";


    // ============================================================
    // CAMPOS TÉCNICOS
    // ============================================================

    if (
        nome === "ID" ||
        nome.startsWith("ID ")
    ) {

        return false;

    }


    // ============================================================
    // HIDDEN / VISIBLE
    // ============================================================

    if (
        campo.hidden === true ||
        campo.visible === false
    ) {

        return false;

    }


    return true;

}
