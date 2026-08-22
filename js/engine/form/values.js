/**
 * ============================================================
 * FORM - VALUES
 * ============================================================
 */

import {
    deveExibirCampo
} from "./visibility.js";

import {
    formatarValor
} from "./formatters.js";


/**
 * ============================================================
 * PREENCHER FORMULÁRIO
 * ============================================================
 */
export async function preencherFormulario({
    schema,
    dados = {},
    obterInput,
    configurarCampoSelect,
    setRegistroAtual
}) {

    setRegistroAtual(
        dados || {},
        dados && Object.keys(dados).length
            ? "edicao"
            : "novo"
    );


    // ============================================================
    // SELECTS RELACIONAIS
    // ============================================================

    for (const campo of schema.fields) {

        if (
            !deveExibirCampo(campo)
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
            obterInput(campo.name);

        if (!input) {
            continue;
        }

        let valorAtual = "";

        if (campo.idField) {

            valorAtual =
                dados[campo.idField] ?? "";

        } else {

            valorAtual =
                dados[campo.name] ?? "";

        }

        await configurarCampoSelect(
            campo,
            input,
            valorAtual
        );
    }


    // ============================================================
    // DEMAIS CAMPOS
    // ============================================================

    schema.fields.forEach(campo => {

        if (
            !deveExibirCampo(campo)
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
            obterInput(campo.name);

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
            input.type === "checkbox"
        ) {

            input.checked =
                Boolean(valor);

            return;
        }

        input.value =
            formatarValor(
                campo,
                valor
            );
    });
}


/**
 * ============================================================
 * LER FORMULÁRIO
 * ============================================================
 */
export function obterDadosFormulario({
    schema,
    obterInput
}) {

    const dados = {};

    schema.fields.forEach(campo => {

        if (
            !deveExibirCampo(campo)
        ) {
            return;
        }

        const input =
            obterInput(campo.name);

        if (!input) {
            return;
        }


        // ========================================================
        // SELECT RELACIONAL
        // ========================================================

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

            dados[campo.idField] =
                id;

            dados[campo.name] =
                id
                    ? label.trim()
                    : "";

            return;
        }


        // ========================================================
        // DEMAIS CAMPOS
        // ========================================================

        let valor =
            input.value;

        if (
            input.type === "checkbox"
        ) {

            valor =
                input.checked;
        }

        dados[campo.name] =
            valor;
    });

    return dados;
}


/**
 * ============================================================
 * LIMPAR FORMULÁRIO
 * ============================================================
 */
export function limparFormulario({
    schema,
    obterInput,
    setRegistroAtual
}) {

    setRegistroAtual(
        null,
        "novo"
    );

    schema.fields.forEach(campo => {

        if (
            !deveExibirCampo(campo)
        ) {
            return;
        }

        const input =
            obterInput(campo.name);

        if (!input) {
            return;
        }

        if (
            campo.type === "checkbox"
        ) {

            input.checked = false;

        } else {

            input.value = "";
        }
    });


    // ============================================================
    // VALORES PADRÃO
    // ============================================================

    schema.fields.forEach(campo => {

        if (
            !deveExibirCampo(campo)
        ) {
            return;
        }

        if (
            campo.defaultValue === undefined
        ) {
            return;
        }

        const input =
            obterInput(campo.name);

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
    });
}
