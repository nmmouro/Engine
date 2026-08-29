```javascript
/**
 * ============================================================
 * ENGINE
 * Painel Frota
 * Arquivo: js/engine/engine.js
 *
 * Engine genérico da aplicação.
 *
 * Responsabilidades:
 * - Inicializar módulo
 * - Carregar registros
 * - Renderizar tabela
 * - Renderizar formulário pelo Schema
 * - Criar registro
 * - Editar registro
 * - Atualizar registro
 * - Excluir registro
 * - Filtrar
 * - Paginar
 *
 * Banco:
 * - Supabase / PostgreSQL
 *
 * Padrão de campos:
 * - id
 * - snake_case
 *
 * ============================================================
 */

import {
    listar,
    obter,
    criar,
    atualizar,
    excluir as excluirRegistro
} from "../services/crudService.js";


// ============================================================
// CREATE ENGINE
// ============================================================

export function createEngine(config = {}) {

    // --------------------------------------------------------
    // VALIDAÇÃO
    // --------------------------------------------------------

    if (!config.entity) {

        throw new Error(
            "Engine: entidade não informada."
        );

    }


    if (!config.container) {

        throw new Error(
            "Engine: container não informado."
        );

    }


    if (!config.schema) {

        throw new Error(
            `Engine ${config.entity}: schema não informado.`
        );

    }


    // --------------------------------------------------------
    // CONFIGURAÇÃO
    // --------------------------------------------------------

    const entity =
        config.entity;

    const schema =
        config.schema;

    const options =
        config.options || {};

    const container =
        resolverElemento(
            config.container
        );


    if (!container) {

        throw new Error(
            `Engine ${entity}: container não encontrado.`
        );

    }


    // ========================================================
    // ESTADO
    // ========================================================

    const state = {

        registros: [],

        registroEditando: null,

        carregando: false,

        salvando: false,

        filtro: "",

        paginaAtual: 1,

        paginaTamanho:
            Number(
                options.pageSize || 10
            )

    };


    // ========================================================
    // ELEMENTOS
    // ========================================================

    let formulario = null;

    let tabela = null;

    let btnNovo = null;


    // ========================================================
    // ENGINE
    // ========================================================

    const engine = {

        entity,

        schema,

        options,

        state,

        container,


        // ====================================================
        // INICIAR
        // ====================================================

        async iniciar() {

            renderizarEstrutura();

            localizarElementos();

            renderizarFormulario();

            registrarEventos();

            esconderFormulario();

            await engine.carregar();

        },


        // ====================================================
        // CARREGAR
        // ====================================================

        async carregar() {

            if (
                state.carregando
            ) {

                return state.registros;

            }


            state.carregando =
                true;


            mostrarLoading();


            emitirEvento(
                "carregando"
            );


            try {

                const dados =
                    await listar(
                        entity
                    );


                state.registros =
                    Array.isArray(dados)
                        ? dados
                        : [];


                state.paginaAtual =
                    1;


                renderizarTabela();


                emitirEvento(
                    "carregado",
                    state.registros
                );


                return state.registros;

            } catch (erro) {

                console.error(
                    `Engine ${entity}: erro ao carregar`,
                    erro
                );


                mostrarErro(
                    erro
                );


                throw erro;

            } finally {

                state.carregando =
                    false;


                esconderLoading();


                emitirEvento(
                    "fim-carregamento"
                );

            }

        },


        // ====================================================
        // RECARREGAR
        // ====================================================

        async recarregar() {

            return engine.carregar();

        },


        // ====================================================
        // OBTER
        // ====================================================

        async obter(id) {

            validarId(
                id
            );


            return obter(
                entity,
                id
            );

        },


        // ====================================================
        // NOVO
        // ====================================================

        novo() {

            state.registroEditando =
                null;


            renderizarFormulario();


            limparFormulario();


            mostrarFormulario();


            emitirEvento(
                "novo"
            );

        },


        // ====================================================
        // EDITAR
        // ====================================================

                async editar(id) {

            if (!id) {

                throw new Error(
                    "Engine: ID não informado."
                );

            }

            try {

                const registro =
                    await obter(
                        entity,
                        id
                    );

                console.log(
                    "ENGINE → REGISTRO OBTIDO:",
                    registro
                );

                if (!registro) {

                    throw new Error(
                        `Registro ${id} não encontrado.`
                    );

                }

                state.registroEditando =
                    registro;

                renderizarFormulario();

                preencherFormulario(
                    registro
                );

                mostrarFormulario();

                emitirEvento(
                    "editar",
                    registro
                );

                return registro;

            } catch (erro) {

                console.error(
                    `Engine ${entity}: erro ao obter registro`,
                    erro
                );

                mostrarErro(
                    erro
                );

                throw erro;

            }

        },


        // ====================================================
        // SALVAR
        // ====================================================

        async salvar(dados) {

            if (
                state.salvando
            ) {

                return;

            }


            state.salvando =
                true;


            mostrarLoading();


            try {

                let resposta;


                // ==============================================
                // EDIÇÃO
                // ==============================================

                if (
                    state.registroEditando
                ) {

                    const id =
                        obterIdRegistro(
                            state.registroEditando
                        );


                    validarId(
                        id
                    );


                    const registro = {

                        ...state.registroEditando,

                        ...dados,

                        id

                    };


                    console.log(
                        `Engine ${entity}: atualizando`,
                        registro
                    );


                    resposta =
                        await atualizar(
                            entity,
                            registro
                        );


                    atualizarEstadoLocal(
                        registro
                    );

                }


                // ==============================================
                // NOVO
                // ==============================================

                else {

                    console.log(
                        `Engine ${entity}: criando`,
                        dados
                    );


                    resposta =
                        await criar(
                            entity,
                            dados
                        );


                    const novoRegistro =
                        normalizarRegistroResposta(
                            resposta
                        );


                    if (
                        novoRegistro
                    ) {

                        state.registros.push(
                            novoRegistro
                        );

                    }

                }


                state.registroEditando =
                    null;


                esconderFormulario();


                renderizarTabela();


                emitirEvento(
                    "salvo",
                    resposta
                );


                return resposta;

            } catch (erro) {

                console.error(
                    `Engine ${entity}: erro ao salvar`,
                    erro
                );


                mostrarErro(
                    erro
                );


                throw erro;

            } finally {

                state.salvando =
                    false;


                esconderLoading();

            }

        },


        // ====================================================
        // EXCLUIR
        // ====================================================

        async excluir(id) {

            validarId(
                id
            );


            const confirmar =
                window.confirm(
                    "Deseja realmente excluir este registro?"
                );


            if (!confirmar) {

                return false;

            }


            try {

                await excluirRegistro(
                    entity,
                    id
                );


                state.registros =
                    state.registros.filter(
                        registro =>
                            String(
                                obterIdRegistro(
                                    registro
                                )
                            ) !==
                            String(id)
                    );


                renderizarTabela();


                emitirEvento(
                    "excluido",
                    id
                );


                return true;

            } catch (erro) {

                console.error(
                    `Engine ${entity}: erro ao excluir`,
                    erro
                );


                mostrarErro(
                    erro
                );


                throw erro;

            }

        },


        // ====================================================
        // FILTRAR
        // ====================================================

        filtrar(valor) {

            state.filtro =
                String(
                    valor || ""
                )
                .trim()
                .toLowerCase();


            state.paginaAtual =
                1;


            renderizarTabela();

        },


        // ====================================================
        // PAGINAÇÃO
        // ====================================================

        pagina(numero) {

            const total =
                obterRegistrosFiltrados()
                    .length;


            const paginas =
                Math.max(
                    1,
                    Math.ceil(
                        total /
                        state.paginaTamanho
                    )
                );


            state.paginaAtual =
                Math.min(
                    Math.max(
                        1,
                        Number(numero) || 1
                    ),
                    paginas
                );


            renderizarTabela();

        },


        // ====================================================
        // FECHAR FORMULÁRIO
        // ====================================================

        fecharFormulario() {

            state.registroEditando =
                null;


            esconderFormulario();


            emitirEvento(
                "formulario-fechado"
            );

        },


        // ====================================================
        // ACTION
        // ====================================================

        action(
            nome,
            registro
        ) {

            const actions =
                options.actions || {};


            const funcao =
                actions[nome];


            if (
                typeof funcao !==
                "function"
            ) {

                console.warn(
                    `Engine ${entity}: action "${nome}" não encontrada.`
                );


                return;

            }


            return funcao(
                registro,
                engine
            );

        },


        // ====================================================
        // MÉTODOS AUXILIARES PÚBLICOS
        // ====================================================

        renderizarTabela,

        renderizarFormulario,

        mostrarFormulario,

        esconderFormulario,

        limparFormulario,

        preencherFormulario

    };


    // ========================================================
    // ESTRUTURA
    // ========================================================

    function renderizarEstrutura() {

        container.innerHTML = `

            <section class="engine">

                <header class="engine-header">

                    <div class="engine-title">

                        <h1>
                            ${escaparHTML(
                                options.titulo ||
                                entity
                            )}
                        </h1>

                    </div>


                    <div class="engine-toolbar">

                        ${
                            options.permitirNovo !== false

                                ? `

                                    <button
                                        type="button"
                                        class="btn btn-primary"
                                        data-engine-novo
                                    >
                                        Novo
                                    </button>

                                  `

                                : ""

                        }

                    </div>

                </header>


                <div
                    class="engine-form-container"
                    data-engine-form
                    hidden
                ></div>


                <div
                    class="engine-table-container"
                >

                    <div
                        class="engine-loading"
                        data-engine-loading
                        hidden
                    >
                        Carregando...
                    </div>


                    <div
                        data-engine-table
                    ></div>

                </div>

            </section>

        `;

    }


    // ========================================================
    // LOCALIZAR ELEMENTOS
    // ========================================================

    function localizarElementos() {

        formulario =
            container.querySelector(
                "[data-engine-form]"
            );


        tabela =
            container.querySelector(
                "[data-engine-table]"
            );


        btnNovo =
            container.querySelector(
                "[data-engine-novo]"
            );

    }


    // ========================================================
    // EVENTOS
    // ========================================================

    function registrarEventos() {

        if (
            btnNovo
        ) {

            btnNovo.addEventListener(
                "click",
                () => {

                    engine.novo();

                }
            );

        }


        container.addEventListener(
            "click",
            evento => {

                const editarBotao =
                    evento.target.closest(
                        "[data-action='editar']"
                    );


                if (
                    editarBotao
                ) {

                    const id =
                        editarBotao.dataset.id;


                    if (!id) {

                        console.error(
                            "Engine: botão Editar sem data-id.",
                            editarBotao
                        );


                        return;

                    }


                    engine.editar(
                        id
                    )
                    .catch(
                        erro => {

                            console.error(
                                erro
                            );

                        }
                    );


                    return;

                }


                const excluirBotao =
                    evento.target.closest(
                        "[data-action='excluir']"
                    );


                if (
                    excluirBotao
                ) {

                    const id =
                        excluirBotao.dataset.id;


                    if (!id) {

                        console.error(
                            "Engine: botão Excluir sem data-id.",
                            excluirBotao
                        );


                        return;

                    }


                    engine.excluir(
                        id
                    )
                    .catch(
                        erro => {

                            console.error(
                                erro
                            );

                        }
                    );


                    return;

                }


                const actionBotao =
                    evento.target.closest(
                        "[data-engine-action]"
                    );


                if (
                    actionBotao
                ) {

                    const nome =
                        actionBotao.dataset.engineAction;


                    const id =
                        actionBotao.dataset.id;


                    const registro =
                        state.registros.find(
                            item =>
                                String(
                                    obterIdRegistro(
                                        item
                                    )
                                ) ===
                                String(id)
                        );


                    engine.action(
                        nome,
                        registro
                    );

                }

            }
        );

    }


    // ========================================================
    // RENDERIZAR FORMULÁRIO
    // ========================================================

   


        // ----------------------------------------------------
        // BOTÕES
        // ----------------------------------------------------

        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "engine-form-actions";


        const btnSalvar =
            document.createElement(
                "button"
            );


        btnSalvar.type =
            "submit";


        btnSalvar.className =
            "btn btn-primary";


        btnSalvar.textContent =
            state.registroEditando
                ? "Atualizar"
                : "Salvar";


        const btnCancelar =
            document.createElement(
                "button"
            );


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


        // ----------------------------------------------------
        // SUBMIT
        // ----------------------------------------------------

        form.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();


                const dados =
                    obterDadosFormulario();


                if (
                    !validarDados(
                        dados
                    )
                ) {

                    return;

                }


                engine.salvar(
                    dados
                )
                .catch(
                    erro => {

                        console.error(
                            erro
                        );

                    }
                );

            }
        );


        // ----------------------------------------------------
        // CANCELAR
        // ----------------------------------------------------

        btnCancelar.addEventListener(
            "click",
            () => {

                engine.fecharFormulario();

            }
        );


        formulario.innerHTML =
            "";


        formulario.appendChild(
            form
        );

    }


    // ========================================================
    // CRIAR CAMPO
    // ========================================================

    function criarCampo(
        campo
    ) {

        if (
            !campo ||
            !campo.name
        ) {

            return null;

        }


        if (
            campo.hidden === true
        ) {

            return null;

        }


        if (
            campo.visible === false &&
            campo.hidden !== false
        ) {

            return null;

        }


        const grupo =
            document.createElement(
                "div"
            );


        grupo.className =
            "engine-field";


        const label =
            document.createElement(
                "label"
            );


        label.htmlFor =
            gerarIdCampo(
                campo.name
            );


        label.textContent =
            campo.label ||
            campo.name;


        grupo.appendChild(
            label
        );


        let input;


        // ====================================================
        // SELECT
        // ====================================================

        if (
            campo.type ===
            "select"
        ) {

            input =
                document.createElement(
                    "select"
                );


            adicionarOpcaoVazia(
                input
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
                            opcao.value ??
                            opcao.id ??
                            "";


                        option.textContent =
                            opcao.label ??
                            opcao.text ??
                            option.value;

                    }

                    else {

                        option.value =
                            String(
                                opcao
                            );


                        option.textContent =
                            String(
                                opcao
                            );

                    }


                    input.appendChild(
                        option
                    );

                }
            );

        }


        // ====================================================
        // TEXTAREA
        // ====================================================

        else if (
            campo.type ===
            "textarea"
        ) {

            input =
                document.createElement(
                    "textarea"
                );

        }


        // ====================================================
        // INPUT
        // ====================================================

        else {

            input =
                document.createElement(
                    "input"
                );


            input.type =
                normalizarTipoInput(
                    campo.type
                );

        }


        input.id =
            gerarIdCampo(
                campo.name
            );


        input.name =
            campo.name;


        if (
            campo.placeholder
        ) {

            input.placeholder =
                campo.placeholder;

        }


        if (
            campo.required
        ) {

            input.required =
                true;

        }


        if (
            campo.readonly
        ) {

            input.readOnly =
                true;

        }


        if (
            campo.disabled
        ) {

            input.disabled =
                true;

        }


        // ----------------------------------------------------
        // STEP
        // ----------------------------------------------------

        if (
            campo.type ===
            "number"
        ) {

            input.step =
                campo.step ??
                "any";

        }


        grupo.appendChild(
            input
        );


        return grupo;

    }


    // ========================================================
    // OBTER DADOS DO FORMULÁRIO
    // ========================================================

    function obterDadosFormulario() {

        const dados = {};


        if (
            !formulario
        ) {

            return dados;

        }


        const form =
            formulario.querySelector(
                "form"
            );


        if (
            !form
        ) {

            return dados;

        }


        const campos =
            Array.isArray(
                schema.fields
            )
                ? schema.fields
                : [];


        campos.forEach(
            campo => {

                if (
                    !campo ||
                    !campo.name
                ) {

                    return;

                }


                const input =
                    form.querySelector(
                        `[name="${cssEscape(
                            campo.name
                        )}"]`
                    );


                if (
                    !input
                ) {

                    return;

                }


                if (
                    campo.type ===
                    "file"
                ) {

                    dados[
                        campo.name
                    ] =
                        input.files &&
                        input.files.length
                            ? input.files[0]
                            : null;


                    return;

                }


                if (
                    input.type ===
                    "checkbox"
                ) {

                    dados[
                        campo.name
                    ] =
                        input.checked;


                    return;

                }


                dados[
                    campo.name
                ] =
                    input.value;

            }
        );


        // ----------------------------------------------------
        // ID DO REGISTRO EM EDIÇÃO
        // ----------------------------------------------------

        if (
            state.registroEditando
        ) {

            const id =
                obterIdRegistro(
                    state.registroEditando
                );


            if (
                id
            ) {

                dados.id =
                    id;

            }

        }


        return dados;

    }


    // ========================================================
    // PREENCHER FORMULÁRIO
    // ========================================================

    function preencherFormulario(
        registro
    ) {

        if (
            !formulario ||
            !registro
        ) {

            return;

        }


        const form =
            formulario.querySelector(
                "form"
            );


        if (
            !form
        ) {

            return;

        }


        const campos =
            Array.isArray(
                schema.fields
            )
                ? schema.fields
                : [];


        campos.forEach(
            campo => {

                if (
                    !campo ||
                    !campo.name
                ) {

                    return;

                }


                const input =
                    form.querySelector(
                        `[name="${cssEscape(
                            campo.name
                        )}"]`
                    );


                if (
                    !input
                ) {

                    return;

                }


                const valor =
                    registro[
                        campo.name
                    ];


                if (
                    input.type ===
                    "file"
                ) {

                    return;

                }


                if (
                    input.type ===
                    "checkbox"
                ) {

                    input.checked =
                        Boolean(
                            valor
                        );


                    return;

                }


                if (
                    input.tagName ===
                    "SELECT"
                ) {

                    selecionarOpcao(
                        input,
                        valor
                    );


                    return;

                }


                input.value =
                    valor ??
                    "";

            }
        );


        console.log(
            `Engine ${entity}: formulário preenchido.`,
            registro
        );

    }


    // ========================================================
    // LIMPAR FORMULÁRIO
    // ========================================================

    function limparFormulario() {

        if (
            !formulario
        ) {

            return;

        }


        const form =
            formulario.querySelector(
                "form"
            );


        if (
            !form
        ) {

            return;

        }


        form.reset();


        const campos =
            Array.isArray(
                schema.fields
            )
                ? schema.fields
                : [];


        campos.forEach(
            campo => {

                if (
                    !campo ||
                    !campo.name
                ) {

                    return;

                }


                const input =
                    form.querySelector(
                        `[name="${cssEscape(
                            campo.name
                        )}"]`
                    );


                if (
                    !input
                ) {

                    return;

                }


                if (
                    campo.type ===
                    "checkbox"
                ) {

                    input.checked =
                        false;

                }

            }
        );

    }


    // ========================================================
    // MOSTRAR FORMULÁRIO
    // ========================================================

    function mostrarFormulario() {

        if (
            formulario
        ) {

            formulario.hidden =
                false;

        }

    }


    // ========================================================
    // ESCONDER FORMULÁRIO
    // ========================================================

    function esconderFormulario() {

        if (
            formulario
        ) {

            formulario.hidden =
                true;

        }

    }


    // ========================================================
    // RENDERIZAR TABELA
    // ========================================================

    function renderizarTabela() {

        if (
            !tabela
        ) {

            return;

        }


        const registros =
            obterRegistrosFiltrados();


        const totalPaginas =
            Math.max(
                1,
                Math.ceil(
                    registros.length /
                    state.paginaTamanho
                )
            );


        if (
            state.paginaAtual >
            totalPaginas
        ) {

            state.paginaAtual =
                totalPaginas;

        }


        const inicio =
            (
                state.paginaAtual - 1
            ) *
            state.paginaTamanho;


        const pagina =
            registros.slice(
                inicio,
                inicio +
                state.paginaTamanho
            );


        if (
            pagina.length === 0
        ) {

            tabela.innerHTML = `

                <div class="engine-empty">

                    Nenhum registro encontrado.

                </div>

            `;


            return;

        }


        const colunas =
            obterColunas();


        let html = `

            <table class="engine-table">

                <thead>

                    <tr>

        `;


        colunas.forEach(
            coluna => {

                html += `

                    <th>
                        ${escaparHTML(
                            obterTituloColuna(
                                coluna
                            )
                        )}
                    </th>

                `;

            }
        );


        html += `

                    <th>Ações</th>

                    </tr>

                </thead>

                <tbody>

        `;


        pagina.forEach(
            registro => {

                const id =
                    obterIdRegistro(
                        registro
                    );


                html += `
                    <tr>
                `;


                colunas.forEach(
                    coluna => {

                        const nome =
                            obterNomeColuna(
                                coluna
                            );


                        html += `

                            <td>
                                ${formatarCelula(
                                    registro[
                                        nome
                                    ],
                                    coluna
                                )}
                            </td>

                        `;

                    }
                );


                html += `

                    <td class="engine-actions">

                `;


                if (
                    options.permitirEditar !==
                    false
                ) {

                    html += `

                        <button
                            type="button"
                            class="btn btn-sm"
                            data-action="editar"
                            data-id="${escaparAtributo(
                                id
                            )}"
                        >
                            Editar
                        </button>

                    `;

                }


                if (
                    options.permitirExcluir !==
                    false
                ) {

                    html += `

                        <button
                            type="button"
                            class="btn btn-sm"
                            data-action="excluir"
                            data-id="${escaparAtributo(
                                id
                            )}"
                        >
                            Excluir
                        </button>

                    `;

                }


                html +=
                    renderizarActions(
                        registro
                    );


                html += `

                    </td>

                    </tr>

                `;

            }
        );


        html += `

                </tbody>

            </table>

        `;


        html +=
            renderizarPaginacao(
                totalPaginas
            );


        tabela.innerHTML =
            html;

    }


    // ========================================================
    // ACTIONS
    // ========================================================

    function renderizarActions(
        registro
    ) {

        const actions =
            options.actions || {};


        return Object.keys(
            actions
        )
        .map(
            nome => {

                if (
                    typeof actions[
                        nome
                    ] !==
                    "function"
                ) {

                    return "";

                }


                const id =
                    obterIdRegistro(
                        registro
                    );


                return `

                    <button
                        type="button"
                        class="btn btn-sm"
                        data-engine-action="${escaparAtributo(
                            nome
                        )}"
                        data-id="${escaparAtributo(
                            id
                        )}"
                    >
                        ${escaparHTML(
                            obterTituloAction(
                                nome
                            )
                        )}
                    </button>

                `;

            }
        )
        .join("");

    }


    // ========================================================
    // PAGINAÇÃO HTML
    // ========================================================

    function renderizarPaginacao(
        totalPaginas
    ) {

        if (
            totalPaginas <= 1
        ) {

            return "";

        }


        let html = `

            <div class="engine-pagination">

        `;


        for (
            let i = 1;
            i <= totalPaginas;
            i++
        ) {

            html += `

                <button
                    type="button"
                    class="${
                        i === state.paginaAtual
                            ? "ativo"
                            : ""
                    }"
                    data-engine-pagina="${i}"
                >
                    ${i}
                </button>

            `;

        }


        html += `

            </div>

        `;


        return html;

    }


    // ========================================================
    // COLUNAS
    // ========================================================

    function obterColunas() {

        if (
            Array.isArray(
                options.colunas
            )
        ) {

            return options.colunas;

        }


        if (
            Array.isArray(
                schema.fields
            )
        ) {

            return schema.fields.filter(
                campo =>

                    campo.visible !==
                    false &&

                    campo.hidden !==
                    true &&

                    campo.name !==
                    "id"

            );

        }


        return Object.keys(
            state.registros[0] ||
            {}
        )
        .filter(
            nome =>
                nome !== "id"
        )
        .map(
            nome => ({

                name:
                    nome,

                label:
                    nome

            })
        );

    }


    // ========================================================
    // FILTRAR REGISTROS
    // ========================================================

    function obterRegistrosFiltrados() {

        if (
            !state.filtro
        ) {

            return state.registros;

        }


        return state.registros.filter(
            registro =>

                Object.values(
                    registro
                )
                .some(
                    valor =>

                        String(
                            valor ??
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            state.filtro
                        )
                )

        );

    }


    // ========================================================
    // ATUALIZAR ESTADO LOCAL
    // ========================================================

    function atualizarEstadoLocal(
        registro
    ) {

        const id =
            obterIdRegistro(
                registro
            );


        const indice =
            state.registros.findIndex(
                item =>

                    String(
                        obterIdRegistro(
                            item
                        )
                    ) ===
                    String(id)
            );


        if (
            indice >= 0
        ) {

            state.registros[
                indice
            ] =
                registro;

        }

    }


    // ========================================================
    // NORMALIZAR RESPOSTA
    // ========================================================

    function normalizarRegistroResposta(
        resposta
    ) {

        if (
            !resposta
        ) {

            return null;

        }


        if (
            Array.isArray(
                resposta
            )
        ) {

            return (
                resposta[0] ||
                null
            );

        }


        if (
            resposta.data
        ) {

            if (
                Array.isArray(
                    resposta.data
                )
            ) {

                return (
                    resposta.data[0] ||
                    null
                );

            }


            if (
                typeof resposta.data ===
                "object"
            ) {

                return resposta.data;

            }

        }


        if (
            resposta.dados
        ) {

            if (
                Array.isArray(
                    resposta.dados
                )
            ) {

                return (
                    resposta.dados[0] ||
                    null
                );

            }


            if (
                typeof resposta.dados ===
                "object"
            ) {

                return resposta.dados;

            }

        }


        if (
            resposta.id
        ) {

            return resposta;

        }


        return null;

    }


    // ========================================================
    // ID
    // ========================================================

    function obterIdRegistro(
        registro
    ) {

        if (
            registro ===
            null ||
            registro ===
            undefined
        ) {

            return null;

        }


        if (
            typeof registro !==
            "object"
        ) {

            return registro;

        }


        return (

            registro.id ??
            registro.ID ??
            registro.Id ??
            null

        );

    }


    // ========================================================
    // VALIDAÇÃO DE ID
    // ========================================================

    function validarId(
        id
    ) {

        if (
            id ===
            null ||
            id ===
            undefined ||
            String(id).trim() ===
            ""
        ) {

            throw new Error(
                "Engine: ID não informado."
            );

        }

    }


    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    function validarDados(
        dados
    ) {

        const campos =
            Array.isArray(
                schema.fields
            )
                ? schema.fields
                : [];


        for (
            const campo of campos
        ) {

            if (
                !campo.required
            ) {

                continue;

            }


            if (
                campo.hidden ===
                true
            ) {

                continue;

            }


            const valor =
                dados[
                    campo.name
                ];


            if (
                valor ===
                null ||
                valor ===
                undefined ||
                String(
                    valor
                ).trim() ===
                ""
            ) {

                mostrarErro(
                    new Error(
                        `O campo "${campo.label || campo.name}" é obrigatório.`
                    )
                );


                const input =
                    formulario?.querySelector(
                        `[name="${cssEscape(
                            campo.name
                        )}"]`
                    );


                if (
                    input
                ) {

                    input.focus();

                }


                return false;

            }

        }


        return true;

    }


    // ========================================================
    // LOADING
    // ========================================================

    function mostrarLoading() {

        const elemento =
            container.querySelector(
                "[data-engine-loading]"
            );


        if (
            elemento
        ) {

            elemento.hidden =
                false;

        }

    }


    function esconderLoading() {

        const elemento =
            container.querySelector(
                "[data-engine-loading]"
            );


        if (
            elemento
        ) {

            elemento.hidden =
                true;

        }

    }


    // ========================================================
    // ERRO
    // ========================================================

    function mostrarErro(
        erro
    ) {

        console.error(
            erro
        );


        const mensagem =
            erro?.message ||
            String(
                erro ||
                "Ocorreu um erro."
            );


        if (
            typeof window.mostrarToast ===
            "function"
        ) {

            window.mostrarToast(
                mensagem,
                "erro"
            );


            return;

        }


        window.alert(
            mensagem
        );

    }


    // ========================================================
    // EVENTO
    // ========================================================

    function emitirEvento(
        nome,
        detalhe
    ) {

        container.dispatchEvent(
            new CustomEvent(
                `engine:${nome}`,
                {
                    detail:
                        detalhe
                }
            )
        );

    }


    // ========================================================
    // HELPERS
    // ========================================================

    function resolverElemento(
        valor
    ) {

        if (
            !valor
        ) {

            return null;

        }


        if (
            valor instanceof
            HTMLElement
        ) {

            return valor;

        }


        if (
            typeof valor ===
            "string"
        ) {

            return document.querySelector(
                valor
            );

        }


        return null;

    }


    function gerarIdCampo(
        nome
    ) {

        return (
            `engine-campo-${String(
                nome
            )
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "-"
            )}`
        );

    }


    function normalizarTipoInput(
        tipo
    ) {

        const tipos = {

            text:
                "text",

            number:
                "number",

            date:
                "date",

            datetime:
                "datetime-local",

            "datetime-local":
                "datetime-local",

            time:
                "time",

            email:
                "email",

            tel:
                "tel",

            url:
                "url",

            password:
                "password",

            checkbox:
                "checkbox",

            file:
                "file"

        };


        return (
            tipos[tipo] ||
            "text"
        );

    }


    function adicionarOpcaoVazia(
        select
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "Selecione...";


        select.appendChild(
            option
        );

    }


    function selecionarOpcao(
        select,
        valor
    ) {

        if (
            valor ===
            null ||
            valor ===
            undefined
        ) {

            select.value =
                "";


            return;

        }


        const texto =
            String(
                valor
            );


        select.value =
            texto;


        if (
            select.value ===
            texto
        ) {

            return;

        }


        const encontrado =
            Array.from(
                select.options
            )
            .find(
                option =>
                    String(
                        option.value
                    )
                    .toLowerCase() ===
                    texto.toLowerCase()
            );


        if (
            encontrado
        ) {

            select.value =
                encontrado.value;

        }

    }


    function formatarCelula(
        valor,
        coluna
    ) {

        if (
            valor ===
            null ||
            valor ===
            undefined ||
            valor ===
            ""
        ) {

            return "";

        }


        if (
            coluna?.type ===
            "date"
        ) {

            return escaparHTML(
                formatarData(
                    valor
                )
            );

        }


        if (
            coluna?.type ===
            "boolean"
        ) {

            return valor
                ? "SIM"
                : "NÃO";

        }


        return escaparHTML(
            String(
                valor
            )
        );

    }


    function formatarData(
        valor
    ) {

        const texto =
            String(
                valor
            );


        if (
            /^\d{4}-\d{2}-\d{2}$/
                .test(
                    texto
                )
        ) {

            const partes =
                texto.split(
                    "-"
                );


            return (
                `${partes[2]}/${partes[1]}/${partes[0]}`
            );

        }


        return texto;

    }


    function obterNomeColuna(
        coluna
    ) {

        return (

            coluna?.name ??
            coluna?.campo ??
            coluna

        );

    }


    function obterTituloColuna(
        coluna
    ) {

        return (

            coluna?.label ??
            coluna?.titulo ??
            coluna?.name ??
            coluna?.campo ??
            coluna

        );

    }


    function obterTituloAction(
        nome
    ) {

        const titulos = {

            abrirChecklist:
                "Checklist",

            abastecer:
                "Abastecer",

            visualizar:
                "Visualizar",

            finalizar:
                "Finalizar"

        };


        return (
            titulos[nome] ||
            nome
        );

    }


    function escaparHTML(
        valor
    ) {

        return String(
            valor ??
            ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    function escaparAtributo(
        valor
    ) {

        return escaparHTML(
            valor
        );

    }


    function cssEscape(
        valor
    ) {

        if (
            window.CSS &&
            typeof window.CSS.escape ===
            "function"
        ) {

            return window.CSS.escape(
                String(
                    valor
                )
            );

        }


        return String(
            valor
        )
        .replace(
            /["\\]/g,
            "\\$&"
        );

    }


    // ========================================================
    // PAGINAÇÃO
    // ========================================================

    container.addEventListener(
        "click",
        evento => {

            const botao =
                evento.target.closest(
                    "[data-engine-pagina]"
                );


            if (
                !botao
            ) {

                return;

            }


            const pagina =
                Number(
                    botao.dataset.enginePagina
                );


            engine.pagina(
                pagina
            );

        }
    );


    // ========================================================
    // INICIALIZAÇÃO
    // ========================================================

    engine.iniciar()
        .catch(
            erro => {

                console.error(
                    `Engine ${entity}: falha na inicialização`,
                    erro
                );

            }
        );


    return engine;

}
```
