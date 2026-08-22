/**
 * ============================================================
 * FORM / VALUES
 * ============================================================
 */


/**
 * ============================================================
 * GET FORM DATA
 * ============================================================
 */

export function getFormData(config = {}) {

    const {
        schema,
        obterInput
    } = config;


    if (
        typeof obterInput !==
        "function"
    ) {

        throw new Error(
            "values.js: obterInput não foi fornecida."
        );

    }


    const dados = {};


    schema.fields.forEach(
        campo => {

            if (
                campo.hidden === true ||
                campo.visible === false ||
                campo.name === "ID" ||
                campo.name?.startsWith("ID ")
            ) {

                return;

            }


            const input =
                obterInput(
                    campo.name
                );


            if (!input) {

                return;

            }


            // ====================================================
            // SELECT RELACIONAL
            // ====================================================

            if (
                campo.type === "select" &&
                campo.source &&
                campo.idField
            ) {

                const option =
                    input.selectedOptions[0];


                const id =
                    input.value || "";


                const label =
                    option?.dataset?.label ||
                    option?.textContent ||
                    "";


                dados[
                    campo.idField
                ] = id;


                dados[
                    campo.name
                ] =
                    id
                        ? label.trim()
                        : "";


                return;

            }


            // ====================================================
            // VALOR
            // ====================================================

            let valor =
                input.value;


            if (
                input.type ===
                "checkbox"
            ) {

                valor =
                    input.checked;

            }


            // ====================================================
            // CAIXA ALTA
            // ====================================================

            if (
                campo.type === "text" ||
                campo.type === "textarea" ||
                campo.type === "email"
            ) {

                valor =
                    String(valor)
                        .toLocaleUpperCase(
                            "pt-BR"
                        );

            }


            dados[
                campo.name
            ] = valor;

        }
    );


    return dados;

}


/**
 * ============================================================
 * SET FORM DATA
 * ============================================================
 */

export async function setFormData(config = {}) {

    const {
        schema,
        dados = {},
        obterInput,
        configurarCampoSelect
    } = config;


    if (
        typeof obterInput !==
        "function"
    ) {

        throw new Error(
            "values.js: obterInput não foi fornecida."
        );

    }


    // ============================================================
    // SELECTS RELACIONAIS
    // ============================================================

    for (const campo of schema.fields) {

        if (
            campo.type !== "select" ||
            !campo.source
        ) {

            continue;

        }


        const input =
            obterInput(
                campo.name
            );


        if (!input) {

            continue;

        }


        const valorAtual =
            campo.idField
                ? dados[campo.idField] ?? ""
                : dados[campo.name] ?? "";


        await configurarCampoSelect({

            field: campo,

            input,

            valorAtual

        });

    }


    // ============================================================
    // CAMPOS NORMAIS
    // ============================================================

    schema.fields.forEach(
        campo => {

            if (
                campo.hidden === true ||
                campo.visible === false ||
                campo.name === "ID" ||
                campo.name?.startsWith("ID ")
            ) {

                return;

            }


            if (
                campo.type === "select" &&
                campo.source
            ) {

                return;

            }


            const input =
                obterInput(
                    campo.name
                );


            if (!input) {

                return;

            }


            const valor =
                dados[campo.name];


            if (
                valor === undefined ||
                valor === null
            ) {

                return;

            }


            if (
                input.type ===
                "checkbox"
            ) {

                input.checked =
                    Boolean(valor);

                return;

            }


            input.value =
                formatarValorInterno(
                    campo,
                    valor
                );

        }
    );

}


/**
 * ============================================================
 * RESET
 * ============================================================
 */

export function resetFormData(config = {}) {

    const {
        schema,
        obterInput
    } = config;


    if (
        typeof obterInput !==
        "function"
    ) {

        throw new Error(
            "values.js: obterInput não foi fornecida."
        );

    }


    schema.fields.forEach(
        campo => {

            const input =
                obterInput(
                    campo.name
                );


            if (!input) {

                return;

            }


            if (
                input.type ===
                "checkbox"
            ) {

                input.checked =
                    false;

            } else {

                input.value =
                    "";

            }

        }
    );


    // ============================================================
    // VALORES PADRÃO
    // ============================================================

    schema.fields.forEach(
        campo => {

            if (
                campo.defaultValue ===
                undefined
            ) {

                return;

            }


            const input =
                obterInput(
                    campo.name
                );


            if (!input) {

                return;

            }


            if (
                input.type ===
                "checkbox"
            ) {

                input.checked =
                    Boolean(
                        campo.defaultValue
                    );

            } else {

                input.value =
                    campo.defaultValue;

            }

        }
    );

}


/**
 * ============================================================
 * FORMATAÇÃO INTERNA
 * ============================================================
 */

function formatarValorInterno(
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

function converterData(valor) {

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

function converterDataHora(valor) {

    if (!valor) {

        return "";

    }


    return String(valor)
        .replace(" ", "T")
        .substring(0, 16);

}
