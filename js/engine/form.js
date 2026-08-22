/**
 * ============================================================
 * FORM ENGINE
 * ============================================================
 *
 * Ponto central do formulário.
 *
 * Responsável por integrar:
 *
 * - field.js
 * - select.js
 * - visibility.js
 * - values.js
 * - validation.js
 * - formatters.js
 * - uppercase.js
 *
 * O arquivo mantém a API pública:
 *
 *     createForm()
 *
 * ============================================================
 */

import {
    criarCampo
} from "./form/field.js";

import {
    configurarCampoSelect
} from "./form/select.js";

import {
    deveExibirCampo
} from "./form/visibility.js";

import {
    getFormData,
    setFormData,
    resetFormData
} from "./form/values.js";

import {
    validar
} from "./form/validation.js";

import {
    formatarValor
} from "./form/formatters.js";

import {
    aplicarCaixaAlta
} from "./form/uppercase.js";


/**
 * ============================================================
 * CREATE FORM
 * ============================================================
 */

export function createForm(config = {}) {

    const {
        schema,
        container,
        onSubmit,
        onCancel
    } = config;


    // ============================================================
    // VALIDAÇÕES
    // ============================================================

    if (!schema) {

        throw new Error(
            "Form: schema não informado."
        );

    }


    if (!Array.isArray(schema.fields)) {

        throw new Error(
            `Form ${schema.entity}: fields inválido.`
        );

    }


    const elemento =
        resolverElemento(container);


    if (!elemento) {

        throw new Error(
            `Form: container não encontrado: ${container}`
        );

    }


    // ============================================================
    // ESTADO
    // ============================================================

    let registroAtual = null;

    let modo = "novo";


    // ============================================================
    // RENDER
    // ============================================================

    async function render() {

        elemento.innerHTML = "";


        const form =
            document.createElement("form");


        form.className =
            "engine-form";


        form.noValidate = true;


        // ========================================================
        // CAMPOS
        // ========================================================

       for (
    const campo of schema.fields
) {

    if (
        !deveExibirCampo(campo)
    ) {

        continue;

    }


    const grupo =
        await criarCampo(
            campo,
            {
                gerarIdCampo,
                configurarCampoSelect
            }
        );


    if (grupo) {

        form.appendChild(
            grupo
        );

    }

}


        // ========================================================
        // BOTÕES
        // ========================================================

        const actions =
            document.createElement("div");


        actions.className =
            "engine-form-actions";


        const btnSalvar =
            document.createElement("button");


        btnSalvar.type =
            "submit";


        btnSalvar.className =
            "btn btn-primary";


        btnSalvar.textContent =
            modo === "edicao"
                ? "Atualizar"
                : "Salvar";


        const btnCancelar =
            document.createElement("button");


        btnCancelar.type =
            "button";


        btnCancelar.className =
            "btn btn-secondary";


        btnCancelar.textContent =
            "Cancelar";


        actions.appendChild(
            btnSalvar
        );


        actions.appendChild(
            btnCancelar
        );


        form.appendChild(
            actions
        );


        // ========================================================
        // SUBMIT
        // ========================================================

        form.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();


                const dados =
                    getFormData({

                        schema,

                        elemento,

                        gerarIdCampo

                    });


                if (
                    !validarFormulario({

                        schema,

                        dados,

                        elemento,

                        gerarIdCampo

                    })
                ) {

                    return;

                }


                if (
                    typeof onSubmit ===
                    "function"
                ) {

                    onSubmit(
                        dados,
                        registroAtual
                    );

                }

            }
        );


        // ========================================================
        // CANCELAR
        // ========================================================

        btnCancelar.addEventListener(
            "click",
            () => {

                if (
                    typeof onCancel ===
                    "function"
                ) {

                    onCancel();

                }

            }
        );


        elemento.appendChild(
            form
        );


        // ========================================================
        // CAIXA ALTA
        // ========================================================

        aplicarCaixaAlta(
            form,
            schema
        );


        atualizarBotaoSalvar();

    }


    // ============================================================
    // SET DATA
    // ============================================================

    async function setData(dados = {}) {

        registroAtual =
            dados || {};


        modo =
            dados &&
            Object.keys(dados).length > 0
                ? "edicao"
                : "novo";


        if (!elemento) {

            return;

        }


        // --------------------------------------------------------
        // SELECTS RELACIONAIS
        // --------------------------------------------------------

        for (const campo of schema.fields) {

            if (!deveExibirCampo(campo)) {

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


            let valorAtual = "";


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


            await configurarCampoSelect(

                campo,

                input,

                valorAtual

            );

        }


        // --------------------------------------------------------
        // DEMAIS VALORES
        // --------------------------------------------------------

        setFormData({

            schema,

            dados,

            elemento,

            gerarIdCampo

        });


        atualizarBotaoSalvar();

    }


    // ============================================================
    // GET DATA
    // ============================================================

    function getData() {

        return getFormData({

            schema,

            elemento,

            gerarIdCampo

        });

    }


    // ============================================================
    // RESET
    // ============================================================

    function reset() {

        registroAtual =
            null;


        modo =
            "novo";


        resetFormData({

            schema,

            elemento,

            gerarIdCampo

        });


        atualizarBotaoSalvar();

    }


    // ============================================================
    // VALIDAÇÃO
    // ============================================================

    function validar(dados) {

        return validarFormulario({

            schema,

            dados,

            elemento,

            gerarIdCampo

        });

    }


    // ============================================================
    // OBTER INPUT
    // ============================================================

    function obterInput(nome) {

        const id =
            gerarIdCampo(nome);


        return elemento.querySelector(
            `#${CSS.escape(id)}`
        );

    }


    // ============================================================
    // GERAR ID
    // ============================================================

    function gerarIdCampo(nome) {

        return (
            `campo-${schema.entity}-${nome}`
        )
            .toLowerCase()
            .replace(
                /[^a-z0-9_-]/gi,
                "-"
            );

    }


    // ============================================================
    // BOTÃO
    // ============================================================

    function atualizarBotaoSalvar() {

        const botao =
            elemento.querySelector(
                'button[type="submit"]'
            );


        if (!botao) {

            return;

        }


        botao.textContent =
            modo === "edicao"
                ? "Atualizar"
                : "Salvar";

    }


    // ============================================================
    // RENDER INICIAL
    // ============================================================

    render();


    // ============================================================
    // API PÚBLICA
    // ============================================================

    return {

        render,

        setData,

        getData,

        reset,

        validar,

        getRegistroAtual() {

            return registroAtual;

        },

        getModo() {

            return modo;

        }

    };

}


/**
 * ============================================================
 * RESOLVE ELEMENTO
 * ============================================================
 */

function resolverElemento(valor) {

    if (!valor) {

        return null;

    }


    if (
        valor instanceof HTMLElement
    ) {

        return valor;

    }


    if (
        typeof valor === "string"
    ) {

        return document.querySelector(
            valor
        );

    }


    return null;

}
