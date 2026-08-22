/**
 * ============================================================
 * FORM ENGINE
 * ============================================================
 *
 * Orquestrador principal dos formulários.
 *
 * Responsabilidades:
 *
 * - Criar formulário
 * - Renderizar campos
 * - Controlar modo NOVO / EDIÇÃO
 * - Ler dados
 * - Preencher dados
 * - Resetar formulário
 * - Validar formulário
 * - Controlar submit
 * - Controlar cancelamento
 *
 * Os detalhes dos campos são delegados aos módulos:
 *
 * form/
 * ├── field.js
 * ├── select.js
 * ├── visibility.js
 * ├── values.js
 * ├── validation.js
 * ├── formatters.js
 * └── uppercase.js
 *
 * ============================================================
 */

import {
    listar
} from "../services/crudService.js";


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
    setFormData,
    getFormData,
    resetFormData
} from "./form/values.js";


import {
    validar as validarFormulario
} from "./form/validation.js";



/**
 * ============================================================
 * CREATE FORM
 * ============================================================
 */

export function createForm(config = {}) {

    // ==========================================================
    // CONFIGURAÇÃO
    // ==========================================================

    const {
        schema,
        container,
        onSubmit,
        onCancel
    } = config;


    // ==========================================================
    // VALIDAÇÃO DO SCHEMA
    // ==========================================================

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


    // ==========================================================
    // RESOLVER CONTAINER
    // ==========================================================

    const elemento =
        resolverElemento(container);


    if (!elemento) {

        throw new Error(
            `Form: container não encontrado: ${container}`
        );

    }


    // ==========================================================
    // ESTADO
    // ==========================================================

    let registroAtual = null;

    let modo = "novo";



    // ==========================================================
    // GERAR ID DO CAMPO
    // ==========================================================

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



    // ==========================================================
    // OBTER INPUT
    // ==========================================================

    function obterInput(nome) {

        const id =
            gerarIdCampo(nome);


        return elemento.querySelector(
            `#${CSS.escape(id)}`
        );

    }



    // ==========================================================
    // RENDERIZAR FORMULÁRIO
    // ==========================================================

    async function render() {

        // ------------------------------------------------------
        // Limpa container
        // ------------------------------------------------------

        elemento.innerHTML = "";


        // ------------------------------------------------------
        // Cria formulário
        // ------------------------------------------------------

        const form =
            document.createElement("form");


        form.className =
            "engine-form";


        form.noValidate =
            true;



        // ======================================================
        // CAMPOS
        // ======================================================

        for (
            const campo of schema.fields
        ) {

            // --------------------------------------------------
            // Verifica visibilidade
            // --------------------------------------------------

            if (
                !deveExibirCampo(campo)
            ) {

                continue;

            }


            // --------------------------------------------------
            // Cria campo
            // --------------------------------------------------

            const grupo =
                await criarCampo({

                    campo,

                    schema,

                    gerarIdCampo,

                    configurarCampoSelect,

                    listar

                });


            // --------------------------------------------------
            // Adiciona ao formulário
            // --------------------------------------------------

            if (grupo) {

                form.appendChild(
                    grupo
                );

            }

        }



        // ======================================================
        // BOTÕES
        // ======================================================

        const actions =
            document.createElement("div");


        actions.className =
            "engine-form-actions";



        // ------------------------------------------------------
        // BOTÃO SALVAR
        // ------------------------------------------------------

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



        // ------------------------------------------------------
        // BOTÃO CANCELAR
        // ------------------------------------------------------

        const btnCancelar =
            document.createElement("button");


        btnCancelar.type =
            "button";


        btnCancelar.className =
            "btn btn-secondary";


        btnCancelar.textContent =
            "Cancelar";



        // ------------------------------------------------------
        // Adiciona botões
        // ------------------------------------------------------

        actions.appendChild(
            btnSalvar
        );


        actions.appendChild(
            btnCancelar
        );


        form.appendChild(
            actions
        );



        // ======================================================
        // SUBMIT
        // ======================================================

        form.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();


                // ------------------------------------------------
                // Lê formulário
                // ------------------------------------------------

                const dados =
                    getData();


                // ------------------------------------------------
                // Valida
                // ------------------------------------------------

                if (
                    !validar(dados)
                ) {

                    return;

                }


                // ------------------------------------------------
                // Executa callback
                // ------------------------------------------------

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



        // ======================================================
        // CANCELAR
        // ======================================================

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



        // ======================================================
        // ADICIONA FORM AO DOM
        // ======================================================

        elemento.appendChild(
            form
        );


        // ======================================================
        // ATUALIZA BOTÃO
        // ======================================================

        atualizarBotaoSalvar();

    }



    // ==========================================================
    // SET DATA
    // ==========================================================

    async function setData(
        dados = {}
    ) {

        // ------------------------------------------------------
        // Guarda registro
        // ------------------------------------------------------

        registroAtual =
            dados || {};


        // ------------------------------------------------------
        // Define modo
        // ------------------------------------------------------

        modo =
            dados &&
            Object.keys(dados).length > 0
                ? "edicao"
                : "novo";


        // ------------------------------------------------------
        // Preenche formulário
        // ------------------------------------------------------

        await setFormData({

            schema,

            dados,

            obterInput,

            configurarCampoSelect

        });


        // ------------------------------------------------------
        // Atualiza botão
        // ------------------------------------------------------

        atualizarBotaoSalvar();

    }



    // ==========================================================
    // GET DATA
    // ==========================================================

    function getData() {

        return getFormData({

            schema,

            obterInput

        });

    }



    // ==========================================================
    // RESET
    // ==========================================================

    function reset() {

        // ------------------------------------------------------
        // Limpa registro atual
        // ------------------------------------------------------

        registroAtual =
            null;


        // ------------------------------------------------------
        // Volta para modo novo
        // ------------------------------------------------------

        modo =
            "novo";


        // ------------------------------------------------------
        // Limpa formulário
        // ------------------------------------------------------

        resetFormData({

            schema,

            obterInput

        });


        // ------------------------------------------------------
        // Atualiza botão
        // ------------------------------------------------------

        atualizarBotaoSalvar();

    }



    // ==========================================================
    // VALIDAR
    // ==========================================================

    function validar(dados) {

        return validarFormulario({

            schema,

            dados,

            obterInput,

            deveExibirCampo

        });

    }



    // ==========================================================
    // ATUALIZAR BOTÃO SALVAR
    // ==========================================================

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



    // ==========================================================
    // RESOLVER ELEMENTO
    // ==========================================================

    function resolverElemento(valor) {

        // ------------------------------------------------------
        // Valor inexistente
        // ------------------------------------------------------

        if (!valor) {

            return null;

        }


        // ------------------------------------------------------
        // Elemento HTML
        // ------------------------------------------------------

        if (
            valor instanceof HTMLElement
        ) {

            return valor;

        }


        // ------------------------------------------------------
        // Seletor CSS
        // ------------------------------------------------------

        if (
            typeof valor === "string"
        ) {

            return document.querySelector(
                valor
            );

        }


        return null;

    }



    // ==========================================================
    // RENDER INICIAL
    // ==========================================================

    render();



    // ==========================================================
    // API PÚBLICA
    // ==========================================================

    return {

        // ------------------------------------------------------
        // Render
        // ------------------------------------------------------

        render,


        // ------------------------------------------------------
        // Dados
        // ------------------------------------------------------

        setData,

        getData,


        // ------------------------------------------------------
        // Reset
        // ------------------------------------------------------

        reset,


        // ------------------------------------------------------
        // Validação
        // ------------------------------------------------------

        validar,


        // ------------------------------------------------------
        // Registro atual
        // ------------------------------------------------------

        getRegistroAtual() {

            return registroAtual;

        },


        // ------------------------------------------------------
        // Modo atual
        // ------------------------------------------------------

        getModo() {

            return modo;

        }

    };

}
