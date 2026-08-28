```javascript
/**
 * ============================================================================
 * FORM ENGINE
 * Painel Frota
 * Arquivo: js/engine/form.js
 *
 * Responsável por:
 *
 * - Criar formulários automaticamente a partir do schema
 * - Criar campos
 * - Preencher campos
 * - Ler dados do formulário
 * - Validar formulário
 * - Controlar modo novo/edição
 * - Trabalhar com valores padrão
 *
 * O FORM NÃO conhece:
 *
 * - VEICULOS
 * - EMPREGADOS
 * - LANCAMENTOS
 * - SUPABASE
 * - PostgreSQL
 *
 * Toda a definição vem do SCHEMA.
 * ============================================================================
 */


/* ============================================================================
   ESTADO INTERNO
============================================================================ */

let formularioAtual = null;

let schemaAtual = null;

let registroAtual = null;


/* ============================================================================
   CRIAR FORM
============================================================================ */

/**
 * Cria o formulário dentro do container informado.
 *
 * @param {Object} options
 * @param {Object} options.schema
 * @param {string|HTMLElement} options.container
 * @param {string} options.id
 * @param {Function} options.onSubmit
 * @param {Function} options.onCancel
 */

export function createForm(options = {}) {

    const {

        schema,

        container = "#form-container",

        id = "formEngine",

        onSubmit = null,

        onCancel = null,

        modo = "novo"

    } = options;


    if (!schema) {

        throw new Error(
            "Form: schema não informado."
        );

    }


    if (
        !Array.isArray(schema.fields)
    ) {

        throw new Error(
            "Form: schema.fields deve ser um array."
        );

    }


    const elementoContainer =

        obterElemento(container);


    if (!elementoContainer) {

        throw new Error(
            `Form: container "${container}" não encontrado.`
        );

    }


    schemaAtual = schema;


    elementoContainer.innerHTML = "";


    /* ========================================================================
       FORM
    ======================================================================== */

    const form = document.createElement("form");

    form.id = id;

    form.className = "engine-form";

    form.noValidate = true;


    /* ========================================================================
       CAMPOS
    ======================================================================== */

    schema.fields.forEach(

        campo => {

            const elementoCampo =

                criarCampo(campo);


            if (elementoCampo) {

                form.appendChild(
                    elementoCampo
                );

            }

        }

    );


    /* ========================================================================
       AÇÕES
    ======================================================================== */

    const acoes =

        document.createElement("div");

    acoes.className =
        "form-actions";


    const btnSalvar =

        document.createElement("button");

    btnSalvar.type = "submit";

    btnSalvar.className =
        "btn btn-primary";

    btnSalvar.textContent =
        modo === "editar"
            ? "Salvar alterações"
            : "Salvar";


    acoes.appendChild(
        btnSalvar
    );


    if (onCancel) {

        const btnCancelar =

            document.createElement("button");

        btnCancelar.type = "button";

        btnCancelar.className =
            "btn btn-secondary";

        btnCancelar.textContent =
            "Cancelar";


        btnCancelar.addEventListener(
            "click",
            () => onCancel()
        );


        acoes.appendChild(
            btnCancelar
        );

    }


    form.appendChild(
        acoes
    );


    /* ========================================================================
       SUBMIT
    ======================================================================== */

    form.addEventListener(

        "submit",

        async evento => {

            evento.preventDefault();


            if (
                !validarFormulario(form)
            ) {

                return;

            }


            const dados =

                obterDados(form);


            if (onSubmit) {

                await onSubmit(
                    dados,
                    evento
                );

            }

        }

    );


    elementoContainer.appendChild(
        form
    );


    formularioAtual = form;


    /* ========================================================================
       MODO
    ======================================================================== */

    if (
        modo === "editar" &&
        registroAtual
    ) {

        preencherFormulario(
            registroAtual
        );

    }


    return form;

}


/* ============================================================================
   CRIAR CAMPO
============================================================================ */

function criarCampo(campo) {

    if (!campo || !campo.name) {

        return null;

    }


    /* ========================================================================
       CAMPO OCULTO
    ======================================================================== */

    if (
        campo.hidden === true ||
        campo.visible === false
    ) {

        const input =
            document.createElement("input");

        input.type = "hidden";

        input.name = campo.name;

        input.id = gerarIdCampo(
            campo.name
        );


        return input;

    }


    /* ========================================================================
       WRAPPER
    ======================================================================== */

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "form-field";


    /* ========================================================================
       LABEL
    ======================================================================== */

    const label =
        document.createElement("label");

    label.htmlFor =
        gerarIdCampo(
            campo.name
        );


    label.textContent =
        campo.label ||
        campo.name;


    if (campo.required) {

        const obrigatorio =
            document.createElement("span");

        obrigatorio.className =
            "campo-obrigatorio";

        obrigatorio.textContent =
            " *";


        label.appendChild(
            obrigatorio
        );

    }


    wrapper.appendChild(
        label
    );


    /* ========================================================================
       INPUT
    ======================================================================== */

    const input =
        criarInput(campo);


    wrapper.appendChild(
        input
    );


    /* ========================================================================
       AJUDA
    ======================================================================== */

    if (campo.help) {

        const help =
            document.createElement("small");

        help.className =
            "form-help";

        help.textContent =
            campo.help;


        wrapper.appendChild(
            help
        );

    }


    return wrapper;

}


/* ============================================================================
   CRIAR INPUT
============================================================================ */

function criarInput(campo) {

    const tipo =
        normalizarTipo(
            campo.type
        );


    let input;


    /* ========================================================================
       TEXT
    ======================================================================== */

    if (
        tipo === "text" ||
        tipo === "string"
    ) {

        input =
            document.createElement("input");

        input.type =
            "text";

    }


    /* ========================================================================
       NUMBER
    ======================================================================== */

    else if (
        tipo === "number"
    ) {

        input =
            document.createElement("input");

        input.type =
            "number";

        input.step =
            campo.step ??
            "any";

    }


    /* ========================================================================
       DATE
    ======================================================================== */

    else if (
        tipo === "date"
    ) {

        input =
            document.createElement("input");

        input.type =
            "date";

    }


    /* ========================================================================
       TIME
    ======================================================================== */

    else if (
        tipo === "time"
    ) {

        input =
            document.createElement("input");

        input.type =
            "time";

    }


    /* ========================================================================
       SELECT
    ======================================================================== */

    else if (
        tipo === "select"
    ) {

        input =
            document.createElement("select");


        const opcaoInicial =
            document.createElement("option");

        opcaoInicial.value = "";

        opcaoInicial.textContent =
            campo.placeholder ||
            "Selecione...";


        input.appendChild(
            opcaoInicial
        );


        const opcoes =
            Array.isArray(
                campo.options
            )
                ? campo.options
                : [];


        opcoes.forEach(
            opcao => {

                const option =
                    document.createElement(
                        "option"
                    );


                if (
                    typeof opcao ===
                    "object"
                ) {

                    option.value =
                        opcao.value ?? "";

                    option.textContent =
                        opcao.label ??
                        opcao.value ??
                        "";

                }

                else {

                    option.value =
                        String(opcao);

                    option.textContent =
                        String(opcao);

                }


                input.appendChild(
                    option
                );

            }
        );

    }


    /* ========================================================================
       TEXTAREA
    ======================================================================== */

    else if (
        tipo === "textarea"
    ) {

        input =
            document.createElement(
                "textarea"
            );


        input.rows =
            campo.rows || 4;

    }


    /* ========================================================================
       CHECKBOX
    ======================================================================== */

    else if (
        tipo === "checkbox" ||
        tipo === "boolean"
    ) {

        input =
            document.createElement(
                "input"
            );

        input.type =
            "checkbox";

    }


    /* ========================================================================
       FILE
    ======================================================================== */

    else if (
        tipo === "file"
    ) {

        input =
            document.createElement(
                "input"
            );

        input.type =
            "file";


        if (campo.accept) {

            input.accept =
                campo.accept;

        }

    }


    /* ========================================================================
       DEFAULT
    ======================================================================== */

    else {

        input =
            document.createElement(
                "input"
            );

        input.type =
            "text";

    }


    /* ========================================================================
       ATRIBUTOS
    ======================================================================== */

    input.id =
        gerarIdCampo(
            campo.name
        );


    input.name =
        campo.name;


    if (campo.placeholder) {

        input.placeholder =
            campo.placeholder;

    }


    if (campo.required) {

        input.required =
            true;

    }


    if (campo.readonly) {

        input.readOnly =
            true;

    }


    if (campo.disabled) {

        input.disabled =
            true;

    }


    if (
        campo.min !== undefined
    ) {

        input.min =
            campo.min;

    }


    if (
        campo.max !== undefined
    ) {

        input.max =
            campo.max;

    }


    if (
        campo.maxlength !== undefined
    ) {

        input.maxLength =
            campo.maxlength;

    }


    /* ========================================================================
       VALOR PADRÃO
    ======================================================================== */

    aplicarValorPadrao(
        input,
        campo
    );


    return input;

}


/* ============================================================================
   VALOR PADRÃO
============================================================================ */

function aplicarValorPadrao(
    input,
    campo
) {

    if (
        campo.default === undefined
    ) {

        return;

    }


    let valor;


    if (
        typeof campo.default ===
        "function"
    ) {

        valor =
            campo.default();

    }

    else {

        valor =
            campo.default;

    }


    definirValor(
        input,
        valor,
        campo
    );

}


/* ============================================================================
   DEFINIR VALOR
============================================================================ */

function definirValor(
    input,
    valor,
    campo = {}
) {

    if (!input) {

        return;

    }


    const tipo =
        normalizarTipo(
            campo.type
        );


    /* ========================================================================
       CHECKBOX
    ======================================================================== */

    if (
        tipo === "checkbox" ||
        tipo === "boolean"
    ) {

        input.checked =
            valor === true ||
            valor === "true" ||
            valor === "TRUE" ||
            valor === "SIM" ||
            valor === 1;

        return;

    }


    /* ========================================================================
       DATA
    ======================================================================== */

    if (
        tipo === "date"
    ) {

        input.value =
            normalizarDataInput(
                valor
            );

        return;

    }


    /* ========================================================================
       TIME
    ======================================================================== */

    if (
        tipo === "time"
    ) {

        input.value =
            normalizarHoraInput(
                valor
            );

        return;

    }


    /* ========================================================================
       OUTROS
    ======================================================================== */

    input.value =
        valor ?? "";

}


/* ============================================================================
   PREENCHER FORMULÁRIO
============================================================================ */

export function preencherFormulario(
    registro = {}
) {

    if (!formularioAtual) {

        return;

    }


    registroAtual =
        registro;


    const campos =
        schemaAtual?.fields || [];


    campos.forEach(
        campo => {

            const input =
                formularioAtual.elements[
                    campo.name
                ];


            if (!input) {

                return;

            }


            definirValor(
                input,
                registro[
                    campo.name
                ],
                campo
            );

        }
    );

}


/* ============================================================================
   OBTER DADOS
============================================================================ */

export function obterDados(
    form = formularioAtual
) {

    if (!form) {

        return {};

    }


    const dados = {};


    const campos =
        schemaAtual?.fields || [];


    campos.forEach(
        campo => {

            const input =
                form.elements[
                    campo.name
                ];


            if (!input) {

                return;

            }


            const tipo =
                normalizarTipo(
                    campo.type
                );


            /* ================================================================
               CHECKBOX
            ================================================================ */

            if (
                tipo === "checkbox" ||
                tipo === "boolean"
            ) {

                dados[
                    campo.name
                ] =
                    input.checked;

                return;

            }


            /* ================================================================
               FILE
            ================================================================ */

            if (
                tipo === "file"
            ) {

                dados[
                    campo.name
                ] =
                    input.files?.[0] ||
                    "";

                return;

            }


            /* ================================================================
               NUMBER
            ================================================================ */

            if (
                tipo === "number"
            ) {

                const valor =
                    input.value.trim();


                dados[
                    campo.name
                ] =
                    valor === ""
                        ? ""
                        : Number(valor);

                return;

            }


            /* ================================================================
               DEMAIS
            ================================================================ */

            dados[
                campo.name
            ] =
                input.value;

        }
    );


    return dados;

}


/* ============================================================================
   VALIDAR FORMULÁRIO
============================================================================ */

export function validarFormulario(
    form = formularioAtual
) {

    if (!form) {

        return false;

    }


    let valido = true;


    const campos =
        schemaAtual?.fields || [];


    campos.forEach(
        campo => {

            if (!campo.required) {

                return;

            }


            const input =
                form.elements[
                    campo.name
                ];


            if (!input) {

                return;

            }


            const tipo =
                normalizarTipo(
                    campo.type
                );


            let preenchido =
                true;


            if (
                tipo === "checkbox" ||
                tipo === "boolean"
            ) {

                preenchido =
                    input.checked;

            }

            else if (
                tipo === "file"
            ) {

                preenchido =
                    input.files &&
                    input.files.length > 0;

            }

            else {

                preenchido =
                    String(
                        input.value || ""
                    ).trim() !== "";

            }


            input.classList.toggle(
                "campo-invalido",
                !preenchido
            );


            if (!preenchido) {

                valido = false;

            }

        }
    );


    if (!valido) {

        mostrarMensagem(
            "Preencha os campos obrigatórios."
        );

    }


    return valido;

}


/* ============================================================================
   LIMPAR
============================================================================ */

export function limparFormulario() {

    if (!formularioAtual) {

        return;

    }


    formularioAtual.reset();

    registroAtual = null;


    /* ========================================================================
       REAPLICAR DEFAULTS
    ======================================================================== */

    const campos =
        schemaAtual?.fields || [];


    campos.forEach(
        campo => {

            const input =
                formularioAtual.elements[
                    campo.name
                ];


            if (!input) {

                return;

            }


            aplicarValorPadrao(
                input,
                campo
            );

        }
    );

}


/* ============================================================================
   DESABILITAR
============================================================================ */

export function desabilitarFormulario() {

    if (!formularioAtual) {

        return;

    }


    Array.from(
        formularioAtual.elements
    ).forEach(
        elemento => {

            elemento.disabled =
                true;

        }
    );

}


/* ============================================================================
   HABILITAR
============================================================================ */

export function habilitarFormulario() {

    if (!formularioAtual) {

        return;

    }


    Array.from(
        formularioAtual.elements
    ).forEach(
        elemento => {

            elemento.disabled =
                false;

        }
    );

}


/* ============================================================================
   MODO NOVO
============================================================================ */

export function modoNovo() {

    registroAtual = null;

    limparFormulario();

}


/* ============================================================================
   MODO EDIÇÃO
============================================================================ */

export function modoEdicao(
    registro
) {

    registroAtual =
        registro || {};


    preencherFormulario(
        registroAtual
    );

}


/* ============================================================================
   OBTER ELEMENTO
============================================================================ */

function obterElemento(
    elemento
) {

    if (
        elemento instanceof HTMLElement
    ) {

        return elemento;

    }


    if (
        typeof elemento ===
        "string"
    ) {

        return document.querySelector(
            elemento
        );

    }


    return null;

}


/* ============================================================================
   NORMALIZAR TIPO
============================================================================ */

function normalizarTipo(
    tipo
) {

    const valor =
        String(
            tipo || "text"
        )
        .toLowerCase()
        .trim();


    const mapa = {

        texto: "text",

        string: "text",

        numero: "number",

        data: "date",

        hora: "time",

        select: "select",

        boolean: "boolean",

        checkbox: "checkbox",

        textarea: "textarea",

        arquivo: "file",

        foto: "file"

    };


    return mapa[valor] || valor;

}


/* ============================================================================
   ID DO CAMPO
============================================================================ */

function gerarIdCampo(
    nome
) {

    return (
        "campo-" +

        String(nome)
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-zA-Z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            )
            .toLowerCase()
    );

}


/* ============================================================================
   DATA PARA INPUT
============================================================================ */

function normalizarDataInput(
    valor
) {

    if (!valor) {

        return "";

    }


    if (
        valor instanceof Date
    ) {

        const ano =
            valor.getFullYear();

        const mes =
            String(
                valor.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                valor.getDate()
            ).padStart(2, "0");


        return `${ano}-${mes}-${dia}`;

    }


    const texto =
        String(valor);


    /* YYYY-MM-DD */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            texto
        )
    ) {

        return texto;

    }


    /* DD/MM/YYYY */

    const match =
        texto.match(
            /^(\d{2})\/(\d{2})\/(\d{4})$/
        );


    if (match) {

        return (
            `${match[3]}-${match[2]}-${match[1]}`
        );

    }


    return "";

}


/* ============================================================================
   HORA PARA INPUT
============================================================================ */

function normalizarHoraInput(
    valor
) {

    if (!valor) {

        return "";

    }


    if (
        valor instanceof Date
    ) {

        return (
            String(
                valor.getHours()
            ).padStart(2, "0") +

            ":" +

            String(
                valor.getMinutes()
            ).padStart(2, "0")
        );

    }


    const texto =
        String(valor);


    const match =
        texto.match(
            /^(\d{1,2}):(\d{2})/
        );


    if (match) {

        return (
            String(
                match[1]
            ).padStart(2, "0") +

            ":" +

            match[2]
        );

    }


    return "";

}


/* ============================================================================
   MENSAGEM
============================================================================ */

function mostrarMensagem(
    mensagem
) {

    if (
        typeof window !==
        "undefined" &&
        typeof window.alert ===
        "function"
    ) {

        window.alert(
            mensagem
        );

    }

}


/* ============================================================================
   GETTERS
============================================================================ */

export function getFormularioAtual() {

    return formularioAtual;

}


export function getSchemaAtual() {

    return schemaAtual;

}


export function getRegistroAtual() {

    return registroAtual;

}
```

