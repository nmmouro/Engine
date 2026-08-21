export function deveExibirCampo(campo) {

    if (!campo) {
        return false;
    }

    const nome =
        String(campo.name || "");

    // Campos técnicos
    if (
        nome === "ID" ||
        nome.startsWith("ID ")
    ) {
        return false;
    }

    // Campos explicitamente ocultos
    if (
        campo.hidden === true ||
        campo.visible === false
    ) {
        return false;
    }

    return true;
}
