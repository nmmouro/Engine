import { criarCampo } from "./form/field.js";
import { deveExibirCampo } from "./form/visibility.js";
import {
    preencherDados,
    lerDados,
    limparDados
} from "./form/values.js";
import { validar } from "./form/validation.js";

export function createForm(config = {}) {

    const {
        schema,
        container,
        onSubmit,
        onCancel
    } = config;

    if (!schema) {
        throw new Error("Form: schema não informado.");
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

    let registroAtual = null;
    let modo = "novo";

    async function render() {

        elemento.innerHTML = "";

        const form =
            document.createElement("form");

        form.className =
            "engine-form";

        form.noValidate = true;

        for (const campo of schema.fields) {

            if (!deveExibirCampo(campo)) {
                continue;
            }

            const grupo =
                await criarCampo(campo, schema);

            if (grupo) {
                form.appendChild(grupo);
            }
        }

        criarBotoes(form);

        elemento.appendChild(form);

        atualizarBotaoSalvar();
    }

    function criarBotoes(form) {

        const actions =
            document.createElement("div");

        actions.className =
            "engine-form-actions";

        const btnSalvar =
            document.createElement("button");

        btnSalvar.type = "submit";
        btnSalvar.className =
            "btn btn-primary";

        btnSalvar.textContent =
            modo === "edicao"
                ? "Atualizar"
                : "Salvar";

        const btnCancelar =
            document.createElement("button");

        btnCancelar.type = "button";
        btnCancelar.className =
            "btn btn-secondary";

        btnCancelar.textContent =
            "Cancelar";

        actions.appendChild(btnSalvar);
        actions.appendChild(btnCancelar);

        form.appendChild(actions);

        form.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();

                const dados =
                    lerDados(schema, elemento);

                if (!validar(
                    dados,
                    schema,
                    elemento
                )) {
                    return;
                }

                if (
                    typeof onSubmit === "function"
                ) {

                    onSubmit(
                        dados,
                        registroAtual
                    );
                }
            }
        );

        btnCancelar.addEventListener(
            "click",
            () => {

                if (
                    typeof onCancel === "function"
                ) {
                    onCancel();
                }
            }
        );
    }

    async function setData(dados = {}) {

        registroAtual = dados || {};

        modo =
            dados &&
            Object.keys(dados).length
                ? "edicao"
                : "novo";

        await preencherDados(
            schema,
            elemento,
            dados
        );

        atualizarBotaoSalvar();
    }

    function getData() {

        return lerDados(
            schema,
            elemento
        );
    }

    function reset() {

        registroAtual = null;

        modo = "novo";

        limparDados(
            schema,
            elemento
        );

        atualizarBotaoSalvar();
    }

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

    render();

    return {
        render,
        setData,
        getData,
        reset,
        validar: dados =>
            validar(
                dados,
                schema,
                elemento
            ),

        getRegistroAtual() {
            return registroAtual;
        },

        getModo() {
            return modo;
        }
    };
}

function resolverElemento(valor) {

    if (!valor) {
        return null;
    }

    if (valor instanceof HTMLElement) {
        return valor;
    }

    if (typeof valor === "string") {
        return document.querySelector(valor);
    }

    return null;
}
