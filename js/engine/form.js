/**
 * ============================================================
 * FORM ENGINE
 * ============================================================
 *
 * Orquestrador principal dos formulários.
 *
 * Responsável por:
 * - Criar formulário
 * - Renderizar campos
 * - Controlar novo/edição
 * - Submeter
 * - Cancelar
 * - Coordenar módulos auxiliares
 * ============================================================
 */

import {
    listar
} from "../services/crudService.js";

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
        onCancel,
        listar
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
    // ID DO CAMPO
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
    // RENDER
    // ============================================================

    async function render() {

        elemento.innerHTML = "";


        const form =
            document.createElement("form");


        form.className =
            "engine-form";


        form.noValidate =
            true;


        // ========================================================
        // CAMPOS
        // ========================================================

        for (const campo of schema.fields) {

            if (
                !deveExibirCampo(campo)
            ) {

                continue;

            }


            const grupo =
                await criarCampo({

                    campo,

                    schema,

                    gerarIdCampo,

                    configurarCampoSelect,

                    listar,

                    aplicarCaixaAlta

                });


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

                        obterInput

                    });


                const valido =
                    validar({

                        schema,

                        dados,

                        obterInput,

                        deveExibirCampo

                    });


                if (!valido) {

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


        atualizarBotaoSalvar();

    }


    // ============================================================
    // SET DATA
    // ============================================================

    async function setData(
        dados = {}
    ) {

        registroAtual =
            dados || {};


        modo =
            dados &&
            Object.keys(dados).length > 0
                ? "edicao"
                : "novo";


        await setFormData({

            schema,

            dados,

            obterInput,

            configurarCampoSelect

        });


        atualizarBotaoSalvar();

    }


    // ============================================================
    // GET DATA
    // ============================================================

    function getData() {

        return getFormData({

            schema,

            obterInput

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

            obterInput

        });


        atualizarBotaoSalvar();

    }


    // ============================================================
    // VALIDAR
    // ============================================================

    function validarFormulario(dados) {

        return validar({

            schema,

            dados,

            obterInput,

            deveExibirCampo

        });

    }


    // ============================================================
    // BOTÃO SALVAR
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

        validar: validarFormulario,

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
 * RESOLVER ELEMENTO
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
