/**
 * ============================================================
 * FORM VALUES
 * ============================================================
 *
 * Responsável por:
 *
 * - Ler dados
 * - Preencher dados
 * - Resetar dados
 * ============================================================
 */

import {
    formatarValor
} from "./formatters.js";

import {
    converterParaCaixaAlta
} from "./uppercase.js";


// ============================================================
// GET FORM DATA
// ============================================================

export function getFormData(
    config = {}
) {

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

            // ====================================================
            // CAMPOS TÉCNICOS
            // ====================================================

            const nome =
                campo.name || "";


            if (
                nome === "ID" ||
                nome.startsWith("ID ")
            ) {

                return;

            }


            if (
                campo.hidden === true ||
                campo.visible === false
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
            // CHECKBOX
            // ====================================================

            if (
                input.type === "checkbox"
            ) {

                dados[
                    campo.name
                ] =
                    input.checked;


                return;

            }


            // ====================================================
            // VALOR
            // ====================================================

            let valor =
                input.value;


            // ====================================================
            // CAIXA ALTA
            // ====================================================

            if (
                campo.type === "text" ||
                campo.type === "textarea" ||
                campo.type === "email"
            ) {

                valor =
                    converterParaCaixaAlta(
                        valor
                    );

            }


            dados[
                campo.name
            ] = valor;

        }
    );


    return dados;

}


// ============================================================
// SET FORM DATA
// ============================================================

export async function setFormData(
    config = {}
) {

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

    for (
        const campo of schema.fields
    ) {

        if (
            campo.hidden === true ||
            campo.visible === false
        ) {

            continue;

        }


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


        let valorAtual =
            "";


        if (campo.idField) {

            valorAtual =
                dados[
                    campo.idField
                ] ?? "";

        } else {

            valorAtual =
                dados[
                    campo.name
                ] ?? "";

        }


        if (
            typeof configurarCampoSelect ===
            "function"
        ) {

            await configurarCampoSelect(

                campo,

                input,

                valorAtual

            );

        }

    }


    // ============================================================
    // DEMAIS CAMPOS
    // ============================================================

    schema.fields.forEach(
        campo => {

            if (
                campo.hidden === true ||
                campo.visible === false
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
                dados[
                    campo.name
                ];


            if (
                valor === undefined ||
                valor === null
            ) {

                return;

            }


            // ====================================================
            // CHECKBOX
            // ====================================================

            if (
                input.type === "checkbox"
            ) {

                input.checked =
                    Boolean(valor);

                return;

            }


            // ====================================================
            // VALOR
            // ====================================================

            input.value =
                formatarValor(
                    campo,
                    valor
                );

        }
    );

}


// ============================================================
// RESET FORM DATA
// ============================================================

export function resetFormData(
    config = {}
) {

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

            const nome =
                campo.name || "";


            if (
                nome === "ID" ||
                nome.startsWith("ID ")
            ) {

                return;

            }


            if (
                campo.hidden === true ||
                campo.visible === false
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
                input.type === "checkbox"
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
    // DEFAULT VALUES
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
                campo.type === "checkbox"
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
