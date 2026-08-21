/**
 * ============================================================
 * FORM ENGINE
 * ============================================================
 *
 * Responsável por:
 * - Criar formulário a partir do Schema
 * - Preencher formulário com dados
 * - Ler dados do formulário
 * - Limpar formulário
 * - Controlar modo novo/edição
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * Cria o componente de formulário.
 *
 * @param {Object} config
 * @param {Object} config.schema
 * @param {HTMLElement|string} config.container
 * @param {Function} config.onSubmit
 * @param {Function} config.onCancel
 *
 * @returns {Object}
 */

import {
    listar
} from "../services/crudService.js";


export function createForm(config = {}) {

    const {
        schema,
        container,
        onSubmit,
        onCancel
    } = config;


    // ------------------------------------------------------------
    // Validações
    // ------------------------------------------------------------

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


    const elemento = resolverElemento(container);

    if (!elemento) {
        throw new Error(
            `Form: container não encontrado: ${container}`
        );
    }


    // ------------------------------------------------------------
    // Estado interno
    // ------------------------------------------------------------

    let registroAtual = null;

    let modo = "novo";


    // ------------------------------------------------------------
    // Renderização
    // ------------------------------------------------------------

    async function render() {

    elemento.innerHTML = "";

    const form =
        document.createElement("form");

    form.className =
        "engine-form";

    form.noValidate = true;


    // --------------------------------------------------------
    // Campos
    // --------------------------------------------------------

    for (const campo of schema.fields) {

        const grupo =
            await criarCampo(campo);

        if (grupo) {

            form.appendChild(grupo);

        }

    }


    // --------------------------------------------------------
    // Botões
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // Submit
    // --------------------------------------------------------

    form.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();

            const dados =
                getData();


            if (!validar(dados)) {

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


    // --------------------------------------------------------
    // Cancelar
    // --------------------------------------------------------

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


    elemento.appendChild(form);

}
    

// ===========================================================================================================
// SELECT RELACIONAL
// ===========================================================================================================

async function carregarOpcoesRelacionadas(field) {

    if (!field.source) {
        return [];
    }


    const registros =
        await listar(field.source);


    if (!Array.isArray(registros)) {

        console.warn(
            `Nenhum registro encontrado para ${field.source}`
        );

        return [];

    }


    const valueField =
        field.valueField || "ID";


    const labelFields =
        field.labelFields || [valueField];


    const separator =
        field.separator ?? " / ";


    return registros.map(registro => {

        const value =
            registro[valueField] ?? "";


        const label =
            labelFields
                .map(nome =>
                    registro[nome] ?? ""
                )
                .join(separator);


        return {

            value,

            label

        };

    });

}

// ============================================================
// PREENCHER SELECT
// ============================================================

function preencherSelect(
    select,
    opcoes,
    valorAtual = ""
) {

    select.innerHTML = "";


    const opcaoInicial =
        document.createElement("option");


    opcaoInicial.value = "";

    opcaoInicial.textContent =
        "Selecione...";


    select.appendChild(
        opcaoInicial
    );


    opcoes.forEach(opcao => {

        const option =
            document.createElement("option");


        option.value =
            opcao.value;


        option.textContent =
            opcao.label;


        if (
            String(opcao.value) ===
            String(valorAtual)
        ) {

            option.selected = true;

        }


        select.appendChild(
            option
        );

    });

}

    async function configurarCampoSelect(
    field,
    input,
    valorAtual = ""
) {

    // --------------------------------------------------------
    // SELECT NORMAL
    // --------------------------------------------------------

    if (!field.source) {

        preencherSelect(

            input,

            (field.options || [])
                .map(valor => {

                    if (
                        typeof valor ===
                        "object" &&
                        valor !== null
                    ) {

                        return {

                            value:
                                valor.value ?? "",

                            label:
                                valor.label ??
                                valor.value ??
                                ""

                        };

                    }


                    return {

                        value: String(valor),

                        label: String(valor)

                    };

                }),

            valorAtual

        );

        return;

    }


    // --------------------------------------------------------
    // SELECT RELACIONAL
    // --------------------------------------------------------

    input.disabled = true;


    input.innerHTML = "";


    const carregando =
        document.createElement("option");

    carregando.value = "";

    carregando.textContent =
        "Carregando...";

    carregando.selected = true;


    input.appendChild(
        carregando
    );


    try {

        const opcoes =
            await carregarOpcoesRelacionadas(
                field
            );


        preencherSelect(
            input,
            opcoes,
            valorAtual
        );


    } catch (erro) {

        console.error(
            `Erro ao carregar ${field.source}:`,
            erro
        );


        input.innerHTML = "";


        const erroOption =
            document.createElement("option");

        erroOption.value = "";

        erroOption.textContent =
            "Erro ao carregar opções";


        input.appendChild(
            erroOption
        );


    } finally {

        input.disabled = false;

    }

}


    // ------------------------------------------------------------
    // Cria um campo
    // ------------------------------------------------------------

    async function criarCampo(campo) {

    if (
        !campo ||
        !campo.name
    ) {

        return null;

    }


    const grupo =
        document.createElement("div");

    grupo.className =
        "form-group";


    const label =
        document.createElement("label");

    label.htmlFor =
        gerarIdCampo(campo.name);

    label.textContent =
        campo.label ||
        campo.name;


    const input =
        criarInput(campo);


    if (!input) {

        return null;

    }


    // --------------------------------------------------------
    // SELECT RELACIONAL
    // --------------------------------------------------------

    if (
        campo.type === "select" &&
        campo.source
    ) {

        await configurarCampoSelect(
            campo,
            input
        );

    }


    grupo.appendChild(label);

    grupo.appendChild(input);


    return grupo;

}


    // ------------------------------------------------------------
    // Cria input conforme o tipo
    // ------------------------------------------------------------

    function criarInput(campo) {

        const id = gerarIdCampo(campo.name);

        let input;


        switch (campo.type) {


            // ----------------------------------------------------
            // TEXT
            // ----------------------------------------------------

            case "text":

                input = document.createElement("input");

                input.type = "text";

                break;


            // ----------------------------------------------------
            // DATE
            // ----------------------------------------------------

            case "date":

                input = document.createElement("input");

                input.type = "date";

                break;


            // ----------------------------------------------------
            // DATETIME
            // ----------------------------------------------------

            case "datetime":

                input = document.createElement("input");

                input.type = "datetime-local";

                break;


            // ----------------------------------------------------
            // TIME
            // ----------------------------------------------------

            case "time":

                input = document.createElement("input");

                input.type = "time";

                break;


            // ----------------------------------------------------
            // NUMBER
            // ----------------------------------------------------

            case "number":

                input = document.createElement("input");

                input.type = "number";

                break;


            // ----------------------------------------------------
            // EMAIL
            // ----------------------------------------------------

            case "email":

                input = document.createElement("input");

                input.type = "email";

                break;


            // ----------------------------------------------------
            // TEXTAREA
            // ----------------------------------------------------

            case "textarea":

                input = document.createElement("textarea");

                break;


            // ----------------------------------------------------
            // SELECT
            // ----------------------------------------------------

            case "select":

                input = criarSelect(campo);

                break;


            // ----------------------------------------------------
            // CHECKBOX
            // ----------------------------------------------------

            case "checkbox":

                input = document.createElement("input");

                input.type = "checkbox";

                break;


            // ----------------------------------------------------
            // FILE
            // ----------------------------------------------------

            case "file":

                input = document.createElement("input");

                input.type = "file";

                break;


            // ----------------------------------------------------
            // PADRÃO
            // ----------------------------------------------------

            default:

                input = document.createElement("input");

                input.type = "text";

                break;

        }


        input.id = id;

        input.name = campo.name;

        input.className =
            campo.type === "checkbox"
                ? "form-checkbox"
                : "form-control";


        // --------------------------------------------------------
        // Obrigatório
        // --------------------------------------------------------

        if (campo.required) {
            input.required = true;
        }


        // --------------------------------------------------------
        // Somente leitura
        // --------------------------------------------------------

        if (campo.readonly) {
            input.readOnly = true;
        }


        // --------------------------------------------------------
        // Placeholder
        // --------------------------------------------------------

        if (campo.placeholder) {
            input.placeholder = campo.placeholder;
        }


        // --------------------------------------------------------
        // Valor padrão
        // --------------------------------------------------------

        if (
            campo.defaultValue !== undefined &&
            campo.defaultValue !== null
        ) {

            if (campo.type === "checkbox") {

                input.checked =
                    Boolean(campo.defaultValue);

            } else {

                input.value =
                    campo.defaultValue;

            }

        }


        return input;

    }


    // ------------------------------------------------------------
    // Cria SELECT
    // ------------------------------------------------------------

    function criarSelect(campo) {

    const select =
        document.createElement("select");

    select.className =
        "form-control";


    // --------------------------------------------------------
    // Opção inicial
    // --------------------------------------------------------

    const vazio =
        document.createElement("option");

    vazio.value = "";

    vazio.textContent =
        campo.placeholder ||
        "Selecione...";

    vazio.selected = true;


    select.appendChild(vazio);


    // --------------------------------------------------------
    // Opções estáticas
    // --------------------------------------------------------

    const options =
        Array.isArray(campo.options)
            ? campo.options
            : [];


    options.forEach(opcao => {

        const option =
            document.createElement("option");


        if (
            typeof opcao === "object" &&
            opcao !== null
        ) {

            option.value =
                opcao.value ?? "";

            option.textContent =
                opcao.label ??
                opcao.value ??
                "";

        } else {

            option.value =
                String(opcao);

            option.textContent =
                String(opcao);

        }


        select.appendChild(option);

    });


    return select;

}

    // ------------------------------------------------------------
    // Preenche formulário
    // ------------------------------------------------------------

    async function setData(dados = {}) {

        registroAtual = dados || {};

        modo =
            dados && Object.keys(dados).length
                ? "edicao"
                : "novo";

// ------------------------------------------------------------
// Garante que selects relacionais estejam carregados
// ------------------------------------------------------------

for (const campo of schema.fields) {

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


    await configurarCampoSelect(
        campo,
        input,
        dados[campo.name] ?? ""
    );

}


        schema.fields.forEach(campo => {

            const input =
                obterInput(campo.name);


            if (!input) {
                return;
            }


            const valor =
                dados[campo.name];


            if (campo.type === "checkbox") {

                input.checked =
                    Boolean(valor);

                return;

            }


            if (
                valor === undefined ||
                valor === null
            ) {

                input.value = "";

                return;

            }


            input.value =
                formatarValor(campo, valor);

        });


        atualizarBotaoSalvar();

    }


    // ------------------------------------------------------------
    // Lê formulário
    // ------------------------------------------------------------

    function getData() {

        const dados = {};


        schema.fields.forEach(campo => {

            const input =
                obterInput(campo.name);


            if (!input) {
                return;
            }


            if (campo.type === "checkbox") {

                dados[campo.name] =
                    input.checked;

                return;

            }


            dados[campo.name] =
                input.value;

        });


        return dados;

    }


    // ------------------------------------------------------------
    // Limpa formulário
    // ------------------------------------------------------------

    function reset() {

        registroAtual = null;

        modo = "novo";


        schema.fields.forEach(campo => {

            const input =
                obterInput(campo.name);


            if (!input) {
                return;
            }


            if (campo.type === "checkbox") {

                input.checked = false;

            } else {

                input.value = "";

            }

        });


        // Aplica valores padrão novamente

        schema.fields.forEach(campo => {

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


            if (campo.type === "checkbox") {

                input.checked =
                    Boolean(campo.defaultValue);

            } else {

                input.value =
                    campo.defaultValue;

            }

        });


        atualizarBotaoSalvar();

    }


    // ------------------------------------------------------------
    // Validação
    // ------------------------------------------------------------

    function validar(dados) {

        for (const campo of schema.fields) {

            if (!campo.required) {
                continue;
            }


            const valor =
                dados[campo.name];


            if (
                valor === undefined ||
                valor === null ||
                String(valor).trim() === ""
            ) {

                mostrarErro(
                    `O campo "${campo.label || campo.name}" é obrigatório.`
                );

                const input =
                    obterInput(campo.name);

                if (input) {
                    input.focus();
                }

                return false;

            }

        }


        return true;

    }


    // ------------------------------------------------------------
    // Mostra erro
    // ------------------------------------------------------------

    function mostrarErro(mensagem) {

        console.error(
            "Form:",
            mensagem
        );

        alert(mensagem);

    }


    // ------------------------------------------------------------
    // Obtém input
    // ------------------------------------------------------------

    function obterInput(nome) {

        const id =
            gerarIdCampo(nome);

        return elemento.querySelector(
            `#${CSS.escape(id)}`
        );

    }


    // ------------------------------------------------------------
    // Gera ID seguro
    // ------------------------------------------------------------

    function gerarIdCampo(nome) {

        return (
            `campo-${schema.entity}-${nome}`
        )
            .toLowerCase()
            .replace(/[^a-z0-9_-]/gi, "-");

    }


    // ------------------------------------------------------------
    // Formata valor para input
    // ------------------------------------------------------------

    function formatarValor(campo, valor) {

        if (campo.type === "date") {

            return converterDataParaInput(valor);

        }


        if (campo.type === "datetime") {

            return converterDataHoraParaInput(valor);

        }


        return String(valor);

    }


    // ------------------------------------------------------------
    // Data brasileira → yyyy-mm-dd
    // ------------------------------------------------------------

    function converterDataParaInput(valor) {

        if (!valor) {
            return "";
        }


        const texto =
            String(valor);


        // Já está no formato correto

        if (
            /^\d{4}-\d{2}-\d{2}$/.test(texto)
        ) {

            return texto;

        }


        // dd/mm/yyyy

        const partes =
            texto.split("/");


        if (partes.length === 3) {

            const [
                dia,
                mes,
                ano
            ] = partes;


            return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;

        }


        return "";

    }


    // ------------------------------------------------------------
    // Data/hora → datetime-local
    // ------------------------------------------------------------

    function converterDataHoraParaInput(valor) {

        if (!valor) {
            return "";
        }


        const texto =
            String(valor);


        if (
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(texto)
        ) {

            return texto;

        }


        return texto
            .replace(" ", "T")
            .substring(0, 16);

    }


    // ------------------------------------------------------------
    // Atualiza texto do botão
    // ------------------------------------------------------------

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


    // ------------------------------------------------------------
    // Resolve elemento
    // ------------------------------------------------------------

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


    // ------------------------------------------------------------
    // Render inicial
    // ------------------------------------------------------------

    render();


    // ------------------------------------------------------------
    // API pública
    // ------------------------------------------------------------

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
