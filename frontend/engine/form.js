/**
 * ============================================================
 * FORM ENGINE
 * ============================================================
 *
 * Responsável por:
 *
 * - Criar formulário a partir do Schema
 * - Preencher formulário com dados
 * - Ler dados do formulário
 * - Limpar formulário
 * - Controlar modo novo/edição
 * - Suportar selects relacionais
 * - Ocultar campos técnicos
 * - Converter campos de texto para CAIXA ALTA
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */

import {
    listar
} from "../services/crudService.js";

import {
    listar
} from "../services/crudService.js";


// ============================================================
// CACHE DE CAMPOS RELACIONAIS
// ============================================================

const cacheRelacionamentos = new Map();


// ============================================================
// CONFIGURAÇÃO DO CACHE
// ============================================================

const CACHE_RELACIONAL_TTL = 60000;


// ============================================================
// CARREGAR DADOS RELACIONAIS
// ============================================================

async function carregarDadosRelacionados(
    source,
    forcar = false
) {

    if (!source) {

        return [];

    }


    const agora =
        Date.now();


    const item =
        cacheRelacionamentos.get(
            source
        );


    // --------------------------------------------------------
    // CACHE VÁLIDO
    // --------------------------------------------------------

    if (
        !forcar &&
        item &&
        agora - item.timestamp <
            CACHE_RELACIONAL_TTL
    ) {

        console.log(
            `FORM → CACHE HIT: ${source}`
        );

        return item.dados;

    }


    // --------------------------------------------------------
    // CACHE MISS
    // --------------------------------------------------------

    console.log(
        `FORM → CACHE MISS: ${source}`
    );


    const dados =
        await listar(source);


    const lista =
        Array.isArray(dados)
            ? dados
            : [];


    cacheRelacionamentos.set(
        source,
        {
            dados: lista,
            timestamp: agora
        }
    );


    return lista;

}


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
    // RENDERIZAÇÃO
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

        for (const campo of schema.fields) {

            // ----------------------------------------------------
            // Não criar campos técnicos
            // ----------------------------------------------------

            if (!deveExibirCampo(campo)) {

                continue;

            }


            const grupo =
                await criarCampo(campo);


            if (grupo) {

                form.appendChild(grupo);

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
    // VERIFICA SE CAMPO DEVE SER EXIBIDO
    // ============================================================

    function deveExibirCampo(campo) {

        if (!campo) {

            return false;

        }


        const nome =
            campo.name || "";


        // --------------------------------------------------------
        // Campos técnicos
        // --------------------------------------------------------

        if (
            nome === "ID" ||
            nome.startsWith("ID ")
        ) {

            return false;

        }


        // --------------------------------------------------------
        // Hidden / Visible
        // --------------------------------------------------------

        if (
            campo.hidden === true ||
            campo.visible === false
        ) {

            return false;

        }


        return true;

    }


    // ============================================================
    // SELECT RELACIONAL
    // ============================================================

    async function carregarOpcoesRelacionadas(
    campo,
    select
) {

    if (
        !campo ||
        !campo.source ||
        !select
    ) {

        return;

    }


    try {

        const registros =
            await carregarDadosRelacionados(
                campo.source
            );


        select.innerHTML = "";


        // ----------------------------------------------------
        // OPÇÃO VAZIA
        // ----------------------------------------------------

        const opcaoVazia =
            document.createElement(
                "option"
            );


        opcaoVazia.value =
            "";


        opcaoVazia.textContent =
            "Selecione...";


        select.appendChild(
            opcaoVazia
        );


        // ----------------------------------------------------
        // REGISTROS
        // ----------------------------------------------------

        registros.forEach(
            registro => {

                const opcao =
                    document.createElement(
                        "option"
                    );


                // ------------------------------------------------
                // VALOR
                // ------------------------------------------------

                const valueField =
                    campo.valueField ||
                    "ID";


                opcao.value =
                    registro[valueField] ??
                    "";


                // ------------------------------------------------
                // TEXTO
                // ------------------------------------------------

                if (
                    Array.isArray(
                        campo.labelFields
                    )
                ) {

                    const textos =
                        campo.labelFields
                            .map(
                                campoLabel =>
                                    registro[
                                        campoLabel
                                    ] ?? ""
                            )
                            .filter(
                                valor =>
                                    valor !== ""
                            );


                    opcao.textContent =
                        textos.join(
                            campo.separator ||
                            " / "
                        );

                } else {

                    opcao.textContent =
                        registro[
                            campo.labelField ||
                            valueField
                        ] ?? "";

                }


                select.appendChild(
                    opcao
                );

            }
        );


        console.log(
            `FORM → ${campo.source}: ${registros.length} opções carregadas`
        );

    } catch (erro) {

        console.error(
            `FORM → Erro ao carregar ${campo.source}:`,
            erro
        );


        select.innerHTML = "";


        const opcao =
            document.createElement(
                "option"
            );


        opcao.value =
            "";


        opcao.textContent =
            "Erro ao carregar opções";


        select.appendChild(
            opcao
        );

    }

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


        opcaoInicial.value =
            "";


        opcaoInicial.textContent =
            "Selecione...";


        select.appendChild(
            opcaoInicial
        );


        opcoes.forEach(
            opcao => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    opcao.value ?? "";


                option.textContent =
                    opcao.label ?? "";


                // ------------------------------------------------
                // Guarda o label
                // ------------------------------------------------

                option.dataset.label =
                    opcao.label ?? "";


                // ------------------------------------------------
                // Seleciona valor atual
                // ------------------------------------------------

                if (
                    String(opcao.value) ===
                    String(valorAtual)
                ) {

                    option.selected =
                        true;

                }


                select.appendChild(
                    option
                );

            }
        );

    }


    // ============================================================
    // CONFIGURAR SELECT
    // ============================================================

    async function configurarCampoSelect(
        field,
        input,
        valorAtual = ""
    ) {

        // ========================================================
        // SELECT NORMAL
        // ========================================================

        if (!field.source) {

            preencherSelect(

                input,

                (field.options || [])
                    .map(
                        valor => {

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

                                value:
                                    String(valor),

                                label:
                                    String(valor)

                            };

                        }
                    ),

                valorAtual

            );

            return;

        }


        // ========================================================
        // SELECT RELACIONAL
        // ========================================================

        input.disabled =
            true;


        input.innerHTML =
            "";


        const carregando =
            document.createElement(
                "option"
            );


        carregando.value =
            "";


        carregando.textContent =
            "Carregando...";


        carregando.selected =
            true;


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


            input.innerHTML =
                "";


            const erroOption =
                document.createElement(
                    "option"
                );


            erroOption.value =
                "";


            erroOption.textContent =
                "Erro ao carregar opções";


            input.appendChild(
                erroOption
            );


        } finally {

            input.disabled =
                false;

        }

    }


    // ============================================================
    // CRIA CAMPO
    // ============================================================

   async function criarCampo(
    campo
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "form-group";


    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        campo.label ||
        campo.name;


    label.htmlFor =
        gerarIdCampo(
            campo.name
        );


    wrapper.appendChild(
        label
    );


    const input =
        criarInput(
            campo
        );


    wrapper.appendChild(
        input
    );


    // ========================================================
    // SELECT RELACIONAL
    // ========================================================

    if (
        campo.type === "select" &&
        campo.source
    ) {

        await carregarOpcoesRelacionadas(
            campo,
            input
        );

    }


    return wrapper;

}

// ============================================================
// RESOLVE VALOR PADRÃO
// ============================================================

function resolverValorPadrao(campo) {

    if (!campo) {

        return "";

    }


    // ========================================================
    // OBTÉM O VALOR CONFIGURADO
    // ========================================================

    const valor =
        campo.defaultValue;


    // ========================================================
    // SEM VALOR PADRÃO
    // ========================================================

    if (
        valor === undefined ||
        valor === null
    ) {

        return "";

    }


    // ========================================================
    // DEFAULTVALUE COMO FUNÇÃO
    // ========================================================

    if (
        typeof valor === "function"
    ) {

        try {

            const resultado =
                valor();

            return (
                resultado === undefined ||
                resultado === null
            )
                ? ""
                : resultado;

        } catch (erro) {

            console.error(
                "Erro ao executar defaultValue:",
                erro
            );

            return "";

        }

    }


    // ========================================================
    // DEFAULTVALUE COMO VALOR FIXO
    // ========================================================

    return valor;

}

    

// ============================================================
// CRIAR INPUT
// ============================================================

function criarInput(campo) {

    const id =
        gerarIdCampo(
            campo.name
        );

    let input;


    // ========================================================
    // TIPO DO INPUT
    // ========================================================

    switch (campo.type) {

        // ----------------------------------------------------
        // TEXT
        // ----------------------------------------------------

        case "text":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "text";

            break;


        // ----------------------------------------------------
        // DATE
        // ----------------------------------------------------

        case "date":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "date";

            break;


        // ----------------------------------------------------
        // DATETIME
        // ----------------------------------------------------

        case "datetime":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "datetime-local";

            break;


        // ----------------------------------------------------
        // TIME
        // ----------------------------------------------------

        case "time":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "time";

            break;


        // ----------------------------------------------------
        // NUMBER
        // ----------------------------------------------------

        case "number":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "number";

            break;


        // ----------------------------------------------------
        // EMAIL
        // ----------------------------------------------------

        case "email":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "email";

            break;


        // ----------------------------------------------------
        // TEXTAREA
        // ----------------------------------------------------

        case "textarea":

            input =
                document.createElement(
                    "textarea"
                );

            break;


        // ----------------------------------------------------
        // SELECT
        // ----------------------------------------------------

        case "select":

    input =
        criarSelect(
            campo
        );

    break;


        // ----------------------------------------------------
        // CHECKBOX
        // ----------------------------------------------------

        case "checkbox":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "checkbox";

            break;


        // ----------------------------------------------------
        // FILE
        // ----------------------------------------------------

        case "file":

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "file";

            break;

        // ----------------------------------------------------
        // AÇÃO
        // ----------------------------------------------------

        case "action":

            input =
                document.createElement(
                    "button"
                );

            input.type =
                    "button";

            input.textContent =
                    campo.text ||
                    campo.label ||
                    "Abrir";

            input.className =
                    "btn btn-secondary";

            break;


        // ----------------------------------------------------
        // PADRÃO
        // ----------------------------------------------------

        default:

            input =
                document.createElement(
                    "input"
                );

            input.type =
                "text";

            break;

    }

    // ========================================================
    // ATRIBUTOS
    // ========================================================

    input.id =
        id;

    input.name =
        campo.name;

    input.className =
        campo.type === "checkbox"
            ? "form-checkbox"
            : "form-control";


    // ========================================================
    // REQUIRED
    // ========================================================

    if (
        campo.required === true
    ) {

        input.required =
            true;

    }


    // ========================================================
    // READONLY
    // ========================================================

    if (
    campo.readonly
) {

    input.readOnly =
        true;

}


    // ========================================================
    // DISABLED
    // ========================================================

    if (
        campo.disabled === true
    ) {

        input.disabled =
            true;

    }


    // ========================================================
    // PLACEHOLDER
    // ========================================================

    if (
        campo.placeholder
    ) {

        input.placeholder =
            campo.placeholder;

    }


    // ========================================================
    // MIN
    // ========================================================

    if (
        campo.min !== undefined &&
        campo.min !== null
    ) {

        input.min =
            campo.min;

    }


    // ========================================================
    // MAX
    // ========================================================

    if (
        campo.max !== undefined &&
        campo.max !== null
    ) {

        input.max =
            campo.max;

    }


    // ========================================================
    // STEP
    // ========================================================

    if (
        campo.step !== undefined &&
        campo.step !== null
    ) {

        input.step =
            campo.step;

    }


    // ========================================================
    // VALOR PADRÃO
    // ========================================================

    const valorPadrao =
    resolverValorPadrao(
        campo
    );


if (
    campo.type ===
    "checkbox"
) {

    input.checked =
        valorPadrao === true ||
        valorPadrao === "true" ||
        valorPadrao === 1 ||
        valorPadrao === "1";

} else {

    input.value =
        valorPadrao ?? "";

}

    // --------------------------------------------------------
    // CHECKBOX
    // --------------------------------------------------------

    if (
        campo.type === "checkbox"
    ) {

        input.checked =
            valorPadrao === true ||
            valorPadrao === "true" ||
            valorPadrao === 1 ||
            valorPadrao === "1";

    }


    // --------------------------------------------------------
    // FILE
    // --------------------------------------------------------

    else if (
        campo.type === "file"
    ) {

        // ----------------------------------------------------
        // Segurança:
        // nunca atribuir valor padrão a input[type=file].
        // ----------------------------------------------------

        input.value =
            "";

    }


    // --------------------------------------------------------
    // DEMAIS TIPOS
    // --------------------------------------------------------

    else {

        input.value =
            valorPadrao;

    }


    // ========================================================
    // CAIXA ALTA
    // ========================================================

    aplicarCaixaAlta(
        input,
        campo
    );


    // ========================================================
    // RETORNO
    // ========================================================

    return input;

}


    // ============================================================
    // CRIA SELECT
    // ============================================================

    function criarSelect(campo) {

        const select =
            document.createElement(
                "select"
            );


        select.className =
            "form-control";


        const vazio =
            document.createElement(
                "option"
            );


        vazio.value =
            "";


        vazio.textContent =
            campo.placeholder ||
            "Selecione...";


        vazio.selected =
            true;


        select.appendChild(
            vazio
        );


        const options =
            Array.isArray(
                campo.options
            )
                ? campo.options
                : [];


        options.forEach(
            opcao => {

                const option =
                    document.createElement(
                        "option"
                    );


                if (
                    typeof opcao ===
                        "object" &&
                    opcao !== null
                ) {

                    option.value =
                        opcao.value ?? "";


                    option.textContent =
                        opcao.label ??
                        opcao.value ??
                        "";


                    option.dataset.label =
                        opcao.label ??
                        opcao.value ??
                        "";

                } else {

                    option.value =
                        String(opcao);


                    option.textContent =
                        String(opcao);


                    option.dataset.label =
                        String(opcao);

                }


                select.appendChild(
                    option
                );

            }
        );


        return select;

    }


    // ============================================================
    // PREENCHER FORMULÁRIO
    // ============================================================

    async function setData(
        dados = {}
    ) {

        registroAtual =
            dados || {};


        modo =
            dados &&
            Object.keys(dados).length
                ? "edicao"
                : "novo";


        if (!elemento) {

            return;

        }


        // ========================================================
        // SELECTS RELACIONAIS
        // ========================================================

        for (
            const campo of schema.fields
        ) {

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
                obterInput(
                    campo.name
                );


            if (!input) {

                continue;

            }


            let valorAtual =
                "";


            // ----------------------------------------------------
            // Usa o ID técnico
            // ----------------------------------------------------

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


        // ========================================================
        // DEMAIS CAMPOS
        // ========================================================

        schema.fields.forEach(
            campo => {

                if (
                    !deveExibirCampo(campo)
                ) {

                    return;

                }


                // ------------------------------------------------
                // Select relacional já tratado
                // ------------------------------------------------

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


                // ------------------------------------------------
                // Checkbox
                // ------------------------------------------------

                if (
                    input.type ===
                    "checkbox"
                ) {

                    input.checked =
                        Boolean(valor);

                    return;

                }


                // ------------------------------------------------
                // Demais campos
                // ------------------------------------------------

                input.value =
                    formatarValor(
                        campo,
                        valor
                    );

            }
        );


        atualizarBotaoSalvar();

    }


    // ============================================================
    // LER FORMULÁRIO
    // ============================================================

    function getData() {

        const dados = {};


        schema.fields.forEach(
            campo => {

                // ------------------------------------------------
                // Campos técnicos não possuem input visual
                // ------------------------------------------------

                if (
                    !deveExibirCampo(campo)
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


                // =================================================
                // SELECT RELACIONAL
                // =================================================

                if (
                    campo.type === "select" &&
                    campo.source &&
                    campo.idField
                ) {

                    const option =
                        input.selectedOptions[0];


                    const id =
                        input.value ||
                        "";


                    const label =
                        option?.dataset?.label ||
                        option?.textContent ||
                        "";


                    // ------------------------------------------------
                    // ID técnico
                    // ------------------------------------------------

                    dados[
                        campo.idField
                    ] = id;


                    // ------------------------------------------------
                    // Valor visual
                    // ------------------------------------------------

                    dados[
                        campo.name
                    ] =
                        id
                            ? label.trim()
                            : "";


                    return;

                }


                // =================================================
                // DEMAIS CAMPOS
                // =================================================

                let valor =
                    input.value;


                // ------------------------------------------------
                // Checkbox
                // ------------------------------------------------

                if (
                    input.type ===
                    "checkbox"
                ) {

                    valor =
                        input.checked;

                }


                // ------------------------------------------------
                // Date
                // ------------------------------------------------

                if (
                    campo.type ===
                    "date"
                ) {

                    valor =
                        input.value ||
                        "";

                }


                // ------------------------------------------------
                // Time
                // ------------------------------------------------

                if (
                    campo.type ===
                    "time"
                ) {

                    valor =
                        input.value ||
                        "";

                }


                // ------------------------------------------------
                // Campos de texto
                //
                // Garante caixa alta também no momento
                // do envio.
                // ------------------------------------------------

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


    // ============================================================
    // RESET
    // ============================================================

    function reset() {

        registroAtual =
            null;


        modo =
            "novo";


        schema.fields.forEach(
            campo => {

                if (
                    !deveExibirCampo(campo)
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
                    campo.type ===
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


// ========================================================
// VALORES PADRÃO
// ========================================================

schema.fields.forEach(
    campo => {

        if (
            !deveExibirCampo(campo)
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

        const valorPadrao =
            resolverValorPadrao(campo);

        // --------------------------------------------------
        // CHECKBOX
        // --------------------------------------------------

        if (
            campo.type === "checkbox"
        ) {

            input.checked =
                valorPadrao === true ||
                valorPadrao === "true" ||
                valorPadrao === 1 ||
                valorPadrao === "1";

            return;

        }

        // --------------------------------------------------
        // DEMAIS CAMPOS
        // --------------------------------------------------

        input.value =
            valorPadrao;

    }
);

        atualizarBotaoSalvar();

    }


// ============================================================
// VALIDAÇÃO
// ============================================================

function validar(dados) {

    for (const campo of schema.fields) {

        // --------------------------------------------------------
        // Campos que não aparecem no formulário
        // --------------------------------------------------------

        if (!deveExibirCampo(campo)) {

            continue;

        }


        // --------------------------------------------------------
        // Campo não obrigatório
        // --------------------------------------------------------

        if (!campo.required) {

            continue;

        }


        // --------------------------------------------------------
        // SELECT RELACIONAL
        // --------------------------------------------------------

        if (
            campo.type === "select" &&
            campo.source &&
            campo.idField
        ) {

            const id =
                dados[campo.idField];


            if (
                id === undefined ||
                id === null ||
                String(id).trim() === ""
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


            continue;

        }


        // --------------------------------------------------------
        // CAMPOS NORMAIS
        // --------------------------------------------------------

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


    // ============================================================
    // ERRO
    // ============================================================

    function mostrarErro(
        mensagem
    ) {

        console.error(
            "Form:",
            mensagem
        );


        alert(
            mensagem
        );

    }


    // ============================================================
    // OBTER INPUT
    // ============================================================

    function obterInput(nome) {

        const id =
            gerarIdCampo(
                nome
            );


        return elemento.querySelector(
            `#${CSS.escape(id)}`
        );

    }


    // ============================================================
    // GERA ID
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
    // FORMATA VALOR
    // ============================================================

    function formatarValor(
        campo,
        valor
    ) {

        if (
            campo.type ===
            "date"
        ) {

            return converterDataParaInput(
                valor
            );

        }


        if (
            campo.type ===
            "datetime"
        ) {

            return converterDataHoraParaInput(
                valor
            );

        }


        return String(valor);

    }


    // ============================================================
    // DATA → INPUT
    // ============================================================

    function converterDataParaInput(
        valor
    ) {

        if (!valor) {

            return "";

        }


        const texto =
            String(valor);


        // --------------------------------------------------------
        // yyyy-mm-dd
        // --------------------------------------------------------

        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                texto
            )
        ) {

            return texto;

        }


        // --------------------------------------------------------
        // dd/mm/yyyy
        // --------------------------------------------------------

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


    // ============================================================
    // DATA/HORA → INPUT
    // ============================================================

    function converterDataHoraParaInput(
        valor
    ) {

        if (!valor) {

            return "";

        }


        const texto =
            String(valor);


        // --------------------------------------------------------
        // Já está correto
        // --------------------------------------------------------

        if (
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
                .test(texto)
        ) {

            return texto;

        }


        return texto
            .replace(
                " ",
                "T"
            )
            .substring(
                0,
                16
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
    // RESOLVE ELEMENTO
    // ============================================================

    function resolverElemento(
        valor
    ) {

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
 * CAIXA ALTA
 * ============================================================
 *
 * Converte automaticamente os campos de texto para maiúsculas
 * enquanto o usuário digita.
 *
 * Afeta:
 *
 * - text
 * - textarea
 * - email
 *
 * Não afeta:
 *
 * - date
 * - time
 * - datetime
 * - number
 * - select
 * - checkbox
 * - file
 *
 * A conversão também é feita novamente no getData(),
 * garantindo que o valor enviado esteja em caixa alta.
 * ============================================================
 */

function aplicarCaixaAlta(
    input,
    campo
) {

    if (!input || !campo) {

        return;

    }


    const tiposTexto = [
        "text",
        "textarea",
        "email"
    ];


    if (
        !tiposTexto.includes(
            campo.type
        )
    ) {

        return;

    }


    input.addEventListener(
        "input",
        () => {

            const inicio =
                input.selectionStart;


            const fim =
                input.selectionEnd;


            input.value =
                input.value.toLocaleUpperCase(
                    "pt-BR"
                );


            // ----------------------------------------------------
            // Mantém posição do cursor
            // ----------------------------------------------------

            try {

                input.setSelectionRange(
                    inicio,
                    fim
                );

            } catch (erro) {

                // Alguns elementos podem não
                // suportar seleção de texto.

            }

        }
    );

}
