```javascript
/**
 * ============================================================
 * ENGINE
 * Painel Frota
 * Arquivo: js/engine/engine.js
 *
 * Engine principal da aplicação.
 *
 * Arquitetura:
 *
 * Página
 *   ↓
 * Module
 *   ↓
 * Engine
 *   ↓
 * CRUD Service
 *   ↓
 * Supabase / PostgreSQL
 *
 * IMPORTANTE:
 *
 * O PostgreSQL/Supabase utiliza:
 *
 *     id
 *
 * e não:
 *
 *     ID
 *
 * ============================================================
 */

import {
    listar,
    obter,
    criar,
    atualizar,
    excluir
} from "../services/crudService.js";


// ============================================================
// CREATE ENGINE
// ============================================================

export function createEngine(config = {}) {

    // ========================================================
    // VALIDAR CONFIGURAÇÃO
    // ========================================================

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


    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    const entity =
        config.entity;

    const schema =
        config.schema || null;

    const containerSelector =
        config.container;

    const options =
        config.options || {};


    // ========================================================
    // CONTAINER
    // ========================================================

    const container =
        typeof containerSelector === "string"

            ? document.querySelector(
                containerSelector
            )

            : containerSelector;


    if (!container) {

        throw new Error(
            `Engine ${entity}: container "${containerSelector}" não encontrado.`
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
            options.pageSize || 10

    };


    // ========================================================
    // ELEMENTOS
    // ========================================================

    let formulario = null;

    let tabela = null;

    let btnNovo = null;


    // ========================================================
    // API PÚBLICA DO ENGINE
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

            registrarEventos();

            renderizarFormulario();

            await engine.carregar();

        },


        // ====================================================
        // CARREGAR
        // ====================================================

        async carregar() {

            if (state.carregando) {

                return state.registros;

            }


            state.carregando = true;

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

            if (!id) {

                throw new Error(
                    "Engine: ID não informado."
                );

            }


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

            /*
             * O ID vem do atributo:
             *
             * data-id="VEI000002"
             */

            if (
                id === undefined ||
                id === null ||
                String(id).trim() === ""
            ) {

                throw new Error(
                    "Engine: ID não informado."
                );

            }


            try {

                console.log(
                    `ENGINE ${entity}: editando ID`,
                    id
                );


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


                /*
                 * O registro vindo do Supabase
                 * possui a propriedade:
                 *
                 *     id
                 */

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

            if (state.salvando) {

                return;

            }


            state.salvando =
                true;


            mostrarLoading();


            emitirEvento(
                "salvando"
            );


            try {

                let resposta;


                // ==================================================
                // EDIÇÃO
                // ==================================================

                if (
                    state.registroEditando &&
                    state.registroEditando.id
                ) {

                    const registro = {

                        ...state.registroEditando,

                        ...dados

                    };


                    /*
                     * Garantir que o ID original
                     * nunca seja perdido.
                     */

                    registro.id =
                        state.registroEditando.id;


                    resposta =
                        await atualizar(
                            entity,
                            registro
                        );


                    const registroAtualizado =
                        normalizarRegistroResposta(
                            resposta
                        );


                    atualizarEstadoLocal(

                        registroAtualizado
                            ? {
                                ...registro,
                                ...registroAtualizado
                            }
                            : registro

                    );

                }


                // ==================================================
                // NOVO REGISTRO
                // ==================================================

                else {

                    resposta =
                        await criar(
                            entity,
                            dados
                        );


                    const novoRegistro =
                        normalizarRegistroResposta(
                            resposta
                        );


                    if (novoRegistro) {

                        state.registros.push(
                            novoRegistro
                        );

                    }

                }


                state.registroEditando =
                    null;


                limparFormulario();


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


                emitirEvento(
                    "fim-salvamento"
                );

            }

        },


        // ====================================================
        // EXCLUIR
        // ====================================================

        async excluir(id) {

            if (
                id === undefined ||
                id === null ||
                String(id).trim() === ""
            ) {

                throw new Error(
                    "Engine: ID não informado."
                );

            }


            const confirmar =
                window.confirm(
                    "Deseja realmente excluir este registro?"
                );


            if (!confirmar) {

                return false;

            }


            try {

                await excluir(
                    entity,
                    id
                );


                /*
                 * PostgreSQL utiliza:
                 *
                 *     registro.id
                 */

                state.registros =
                    state.registros.filter(

                        registro =>

                            String(
                                registro?.id
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
                        numero
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
        // EXECUTAR ACTION
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
                typeof funcao !== "function"
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

        }

    };


    // ========================================================
    // RENDERIZAR ESTRUTURA
    // ========================================================

    function renderizarEstrutura() {

        /*
         * Se a página já possui conteúdo,
         * não sobrescrever.
         */

        if (
            container.children.length > 0
        ) {

            return;

        }


        const titulo =
            options.titulo ||
            entity;


        container.innerHTML = `

            <section class="engine">

                <header class="engine-header">

                    <div>

                        <h1>
                            ${escaparHTML(titulo)}
                        </h1>

                    </div>


                    <div class="engine-toolbar">

                        ${
                            options.permitirNovo !== false

                                ? `

                                    <button
                                        type="button"
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
                ></div>


                <div class="engine-table-container">

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

        if (btnNovo) {

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

                // ==================================================
                // EDITAR
                // ==================================================

                const editar =
                    evento.target.closest(
                        "[data-action='editar']"
                    );


                if (editar) {

                    const id =
                        editar.dataset.id;


                    console.log(
                        "ENGINE → CLIQUE EDITAR → ID:",
                        id
                    );


                    if (!id) {

                        console.error(
                            "ENGINE → botão Editar sem data-id",
                            editar
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


                // ==================================================
                // EXCLUIR
                // ==================================================

                const excluirBotao =
                    evento.target.closest(
                        "[data-action='excluir']"
                    );


                if (excluirBotao) {

                    const id =
                        excluirBotao.dataset.id;


                    if (!id) {

                        console.error(
                            "ENGINE → botão Excluir sem data-id",
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


                // ==================================================
                // ACTION PERSONALIZADA
                // ==================================================

                const action =
                    evento.target.closest(
                        "[data-engine-action]"
                    );


                if (action) {

                    const nome =
                        action.dataset.engineAction;


                    const id =
                        action.dataset.id;


                    const registro =
                        state.registros.find(

                            item =>

                                String(
                                    item?.id
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
    // RENDERIZAR TABELA
    // ========================================================

    function renderizarTabela() {

        if (!tabela) {

            return;

        }


        const registros =
            obterRegistrosFiltrados();


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


        if (!pagina.length) {

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

                        <th>
                            Ações
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;


        pagina.forEach(
            registro => {

                html += "<tr>";


                colunas.forEach(
                    coluna => {

                        const nome =
                            obterNomeColuna(
                                coluna
                            );


                        html += `

                            <td>

                                ${formatarCelula(
                                    registro?.[nome],
                                    coluna
                                )}

                            </td>

                        `;

                    }
                );


                /*
                 * IMPORTANTE:
                 *
                 * PostgreSQL:
                 *
                 * registro.id
                 */

                const id =
                    registro?.id ?? "";


                html += `

                    <td class="engine-actions">

                        ${
                            options.permitirEditar !== false

                                ? `

                                    <button
                                        type="button"
                                        data-action="editar"
                                        data-id="${escaparAtributo(id)}"
                                    >
                                        Editar
                                    </button>

                                  `

                                : ""

                        }


                        ${
                            options.permitirExcluir !== false

                                ? `

                                    <button
                                        type="button"
                                        data-action="excluir"
                                        data-id="${escaparAtributo(id)}"
                                    >
                                        Excluir
                                    </button>

                                  `

                                : ""

                        }


                        ${renderizarActions(
                            registro
                        )}

                    </td>

                `;


                html += "</tr>";

            }
        );


        html += `

                </tbody>

            </table>

        `;


        tabela.innerHTML =
            html;

    }


    // ========================================================
    // ACTIONS PERSONALIZADAS
    // ========================================================

    function renderizarActions(
        registro
    ) {

        const actions =
            options.actions || {};


        return Object.keys(actions)

            .map(
                nome => {

                    if (
                        typeof actions[nome] !==
                        "function"
                    ) {

                        return "";

                    }


                    return `

                        <button
                            type="button"
                            data-engine-action="${escaparAtributo(nome)}"
                            data-id="${escaparAtributo(
                                registro?.id ?? ""
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
            schema &&
            Array.isArray(
                schema.fields
            )
        ) {

            return schema.fields.filter(

                campo =>

                    campo.visible !== false &&

                    campo.hidden !== true &&

                    campo.name !== "id" &&

                    campo.name !== "ID"

            );

        }


        return Object.keys(
            state.registros[0] || {}
        )

        .filter(
            campo =>

                campo !== "id" &&
                campo !== "ID"

        )

        .map(
            campo => ({

                name:
                    campo,

                label:
                    campo

            })
        );

    }


    // ========================================================
    // REGISTROS FILTRADOS
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
                    registro || {}
                )

                .some(

                    valor =>

                        String(
                            valor ?? ""
                        )

                        .toLowerCase()

                        .includes(
                            state.filtro
                        )

                )

        );

    }


    // ========================================================
    // FORMULÁRIO
    // ========================================================

    function renderizarFormulario() {

        if (!formulario) {

            return;

        }


        const campos =
            Array.isArray(
                schema?.fields
            )

                ? schema.fields

                : [];


        formulario.innerHTML = `

            <form
                data-engine-formulario
                class="engine-form"
            >

                ${campos

                    .filter(
                        campo =>
                            campo.visible !== false &&
                            campo.hidden !== true
                    )

                    .map(
                        campo =>
                            renderizarCampo(
                                campo
                            )
                    )

                    .join("")
                }


                <div class="engine-form-actions">

                    <button
                        type="submit"
                        data-engine-salvar
                    >
                        Salvar
                    </button>


                    <button
                        type="button"
                        data-engine-cancelar
                    >
                        Cancelar
                    </button>

                </div>

            </form>

        `;


        const form =
            formulario.querySelector(
                "[data-engine-formulario]"
            );


        if (form) {

            form.addEventListener(
                "submit",
                evento => {

                    evento.preventDefault();


                    const dados =
                        obterDadosFormulario(
                            form
                        );


                    engine.salvar(
                        dados
                    );

                }
            );

        }


        const cancelar =
            formulario.querySelector(
                "[data-engine-cancelar]"
            );


        if (cancelar) {

            cancelar.addEventListener(
                "click",
                () => {

                    engine.fecharFormulario();

                }
            );

        }

    }


    // ========================================================
    // RENDERIZAR CAMPO
    // ========================================================

    function renderizarCampo(
        campo
    ) {

        const nome =
            campo.name || "";


        const label =
            campo.label ||
            nome;


        const tipo =
            campo.type ||
            "text";


        const required =
            campo.required
                ? "required"
                : "";


        const readonly =
            campo.readonly
                ? "readonly"
                : "";


        const placeholder =
            campo.placeholder ||
            "";


        // ====================================================
        // SELECT
        // ====================================================

        if (
            tipo === "select"
        ) {

            const optionsHTML =
                (campo.options || [])

                    .map(
                        opcao => {

                            const valor =
                                typeof opcao === "object"

                                    ? opcao.value

                                    : opcao;


                            const texto =
                                typeof opcao === "object"

                                    ? (
                                        opcao.label ??
                                        opcao.value
                                    )

                                    : opcao;


                            return `

                                <option
                                    value="${escaparAtributo(valor)}"
                                >
                                    ${escaparHTML(texto)}
                                </option>

                            `;

                        }
                    )

                    .join("");


            return `

                <div class="engine-field">

                    <label>

                        ${escaparHTML(label)}

                        ${campo.required ? " *" : ""}

                    </label>


                    <select
                        name="${escaparAtributo(nome)}"
                        ${required}
                        ${readonly}
                    >

                        <option value="">
                            Selecione...
                        </option>

                        ${optionsHTML}

                    </select>

                </div>

            `;

        }


        // ====================================================
        // TEXTAREA
        // ====================================================

        if (
            tipo === "textarea"
        ) {

            return `

                <div class="engine-field">

                    <label>

                        ${escaparHTML(label)}

                        ${campo.required ? " *" : ""}

                    </label>


                    <textarea
                        name="${escaparAtributo(nome)}"
                        placeholder="${escaparAtributo(
                            placeholder
                        )}"
                        ${required}
                        ${readonly}
                    ></textarea>

                </div>

            `;

        }


        // ====================================================
        // FILE
        // ====================================================

        if (
            tipo === "file"
        ) {

            return `

                <div class="engine-field">

                    <label>

                        ${escaparHTML(label)}

                    </label>


                    <input
                        type="file"
                        name="${escaparAtributo(nome)}"
                    />

                </div>

            `;

        }


        // ====================================================
        // INPUT
        // ====================================================

        return `

            <div class="engine-field">

                <label>

                    ${escaparHTML(label)}

                    ${campo.required ? " *" : ""}

                </label>


                <input
                    type="${escaparAtributo(tipo)}"
                    name="${escaparAtributo(nome)}"
                    placeholder="${escaparAtributo(
                        placeholder
                    )}"
                    ${required}
                    ${readonly}
                />

            </div>

        `;

    }


    // ========================================================
    // OBTER DADOS DO FORMULÁRIO
    // ========================================================

    function obterDadosFormulario(
        form
    ) {

        const dados = {};


        const campos =
            Array.from(
                form.elements
            );


        campos.forEach(
            campo => {

                if (
                    !campo.name
                ) {

                    return;

                }


                if (
                    campo.type === "file"
                ) {

                    /*
                     * Arquivo será tratado
                     * posteriormente pelo serviço
                     * específico de upload.
                     */

                    return;

                }


                if (
                    campo.type === "checkbox"
                ) {

                    dados[campo.name] =
                        campo.checked;

                    return;

                }


                dados[campo.name] =
                    campo.value;

            }
        );


        /*
         * Nunca enviar ID vazio.
         *
         * Em edição o ID original é
         * preservado em salvar().
         */

        if (
            dados.id === ""
        ) {

            delete dados.id;

        }


        return dados;

    }


    // ========================================================
    // MOSTRAR FORMULÁRIO
    // ========================================================

    function mostrarFormulario() {

        if (!formulario) {

            return;

        }


        formulario.hidden =
            false;

    }


    // ========================================================
    // ESCONDER FORMULÁRIO
    // ========================================================

    function esconderFormulario() {

        if (!formulario) {

            return;

        }


        formulario.hidden =
            true;

    }


    // ========================================================
    // LIMPAR FORMULÁRIO
    // ========================================================

    function limparFormulario() {

        if (!formulario) {

            return;

        }


        const form =
            formulario.querySelector(
                "form"
            );


        if (form) {

            form.reset();

        }

    }


    // ========================================================
    // PREENCHER FORMULÁRIO
    // ========================================================

    function preencherFormulario(
        registro
    ) {

        if (!formulario) {

            return;

        }


        Object.entries(
            registro || {}
        )

        .forEach(
            ([nome, valor]) => {

                const campo =
                    formulario.querySelector(
                        `[name="${cssEscape(
                            nome
                        )}"]`
                    );


                if (!campo) {

                    return;

                }


                if (
                    campo.type ===
                    "checkbox"
                ) {

                    campo.checked =
                        Boolean(
                            valor
                        );

                }

                else {

                    campo.value =
                        valor ?? "";

                }

            }
        );

    }


    // ========================================================
    // COLUNA
    // ========================================================

    function obterNomeColuna(
        coluna
    ) {

        return (

            coluna?.name ||

            coluna?.campo ||

            coluna

        );

    }


    // ========================================================
    // TÍTULO COLUNA
    // ========================================================

    function obterTituloColuna(
        coluna
    ) {

        return (

            coluna?.label ||

            coluna?.titulo ||

            coluna?.name ||

            coluna?.campo ||

            coluna

        );

    }


    // ========================================================
    // FORMATAR CÉLULA
    // ========================================================

    function formatarCelula(
        valor,
        coluna
    ) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return "";

        }


        if (
            coluna?.type === "boolean" ||
            coluna?.tipo === "boolean"
        ) {

            return valor
                ? "SIM"
                : "NÃO";

        }


        return escaparHTML(
            String(valor)
        );

    }


    // ========================================================
    // TÍTULO ACTION
    // ========================================================

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


    // ========================================================
    // NORMALIZAR RESPOSTA
    // ========================================================

    function normalizarRegistroResposta(
        resposta
    ) {

        if (!resposta) {

            return null;

        }


        // ====================================================
        // ARRAY
        // ====================================================

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


        // ====================================================
        // dados
        // ====================================================

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
                resposta.dados.id
            ) {

                return resposta.dados;

            }

        }


        // ====================================================
        // data
        // ====================================================

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
                resposta.data.id
            ) {

                return resposta.data;

            }

        }


        // ====================================================
        // REGISTRO DIRETO
        // ====================================================

        if (
            resposta.id
        ) {

            return resposta;

        }


        return null;

    }


    // ========================================================
    // ATUALIZAR ESTADO LOCAL
    // ========================================================

    function atualizarEstadoLocal(
        registro
    ) {

        if (
            !registro?.id
        ) {

            return;

        }


        const indice =
            state.registros.findIndex(

                item =>

                    String(
                        item?.id
                    ) ===

                    String(
                        registro.id
                    )

            );


        if (
            indice >= 0
        ) {

            state.registros[indice] =
                registro;

        }

    }


    // ========================================================
    // EVENTOS CUSTOMIZADOS
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
    // LOADING
    // ========================================================

    function mostrarLoading() {

        const elemento =
            container.querySelector(
                "[data-engine-loading]"
            );


        if (elemento) {

            elemento.hidden =
                false;

        }

    }


    function esconderLoading() {

        const elemento =
            container.querySelector(
                "[data-engine-loading]"
            );


        if (elemento) {

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
            "Ocorreu um erro.";


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
    // ESCAPAR HTML
    // ========================================================

    function escaparHTML(
        valor
    ) {

        return String(
            valor ?? ""
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


    // ========================================================
    // ESCAPAR ATRIBUTO
    // ========================================================

    function escaparAtributo(
        valor
    ) {

        return escaparHTML(
            valor
        );

    }


    // ========================================================
    // CSS ESCAPE
    // ========================================================

    function cssEscape(
        valor
    ) {

        if (
            window.CSS &&
            typeof window.CSS.escape ===
            "function"
        ) {

            return window.CSS.escape(
                valor
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
    // DISPONIBILIZAR MÉTODOS
    // ========================================================

    Object.assign(
        engine,
        {

            renderizarTabela,

            renderizarFormulario,

            obterRegistrosFiltrados,

            mostrarFormulario,

            esconderFormulario,

            limparFormulario,

            preencherFormulario

        }
    );


    // ========================================================
    // INICIALIZAÇÃO AUTOMÁTICA
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


    // ========================================================
    // RETORNAR ENGINE
    // ========================================================

    return engine;

}
```
