/**
 * ============================================================
 * ENGINE
 * Painel Frota
 * Arquivo: engine.js
 *
 * Engine principal da aplicação.
 *
 * Responsabilidades:
 *
 * - Criar e controlar módulos
 * - Manter estado em memória
 * - Carregar registros
 * - Criar registros
 * - Atualizar registros
 * - Excluir registros
 * - Integrar formulário
 * - Integrar tabela
 * - Executar actions personalizadas
 *
 * O Engine NÃO conhece PostgreSQL.
 * O Engine NÃO conhece Supabase.
 * O Engine NÃO conhece Google Sheets.
 *
 * A comunicação com o backend é feita pelo:
 *
 *     services/crudService.js
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
// ENGINE
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
        // INICIALIZAR
        // ====================================================

        async iniciar() {

            renderizarEstrutura();

            localizarElementos();

            registrarEventos();

            /*
             * CORREÇÃO PRINCIPAL
             *
             * carregar() é método do objeto engine.
             * Portanto precisamos chamar:
             *
             *     engine.carregar()
             *
             * e não:
             *
             *     carregar()
             */

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


                state.registroEditando =
                    registro;


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


            emitirEvento(
                "salvando"
            );


            try {

                let resposta;


                // ------------------------------------------------
                // EDIÇÃO
                // ------------------------------------------------

                if (
                    state.registroEditando &&
                    state.registroEditando.ID
                ) {

                    const registro = {

                        ...state.registroEditando,

                        ...dados

                    };


                    resposta =
                        await atualizar(
                            entity,
                            registro
                        );


                    atualizarEstadoLocal(
                        registro
                    );

                }


                // ------------------------------------------------
                // NOVO REGISTRO
                // ------------------------------------------------

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


                limparFormulario();


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

            if (!id) {

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


                state.registros =
                    state.registros.filter(

                        registro =>

                            String(
                                registro.ID
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
         * Se o módulo já possui HTML próprio,
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

        const botaoEditar =
            evento.target.closest(
                "[data-action='editar']"
            );


        if (botaoEditar) {

            const id =
                botaoEditar.getAttribute(
                    "data-id"
                );


            console.log(
                "ENGINE → CLIQUE EDITAR → ID:",
                id
            );


            if (
                !id ||
                String(id).trim() === ""
            ) {

                console.error(
                    "ENGINE → EDITAR → botão sem data-id",
                    botaoEditar
                );


                return;

            }


            engine.editar(
                String(id)
            )

            .catch(
                erro => {

                    console.error(
                        "ENGINE → EDITAR:",
                        erro
                    );

                }
            );


            return;

        }


        // ==================================================
        // EXCLUIR
        // ==================================================

        const botaoExcluir =
            evento.target.closest(
                "[data-action='excluir']"
            );


        if (botaoExcluir) {

            const id =
                botaoExcluir.getAttribute(
                    "data-id"
                );


            console.log(
                "ENGINE → CLIQUE EXCLUIR → ID:",
                id
            );


            if (
                !id ||
                String(id).trim() === ""
            ) {

                console.error(
                    "ENGINE → EXCLUIR → botão sem data-id",
                    botaoExcluir
                );


                return;

            }


            engine.excluir(
                String(id)
            )

            .catch(
                erro => {

                    console.error(
                        "ENGINE → EXCLUIR:",
                        erro
                    );

                }
            );


            return;

        }

    }
);


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

                    <th>Ações</th>

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
                                    registro[nome],
                                    coluna
                                )}

                            </td>

                        `;

                    }
                );


                html += `

                    <td class="engine-actions">

                        ${
                            options.permitirEditar !== false

                                ? `

                                    <button
                                        type="button"
                                        data-action="editar"
                                        data-id="${escaparAtributo(
                                            id
                                        )}"
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
                                        data-id="${escaparAtributo(
                                            id
                                        )}"
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
                            data-engine-action="${escaparAtributo(
                                nome
                            )}"
                            data-id="${escaparAtributo(
                                registro.ID
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

                    campo.name !== "ID"

            );

        }


        return Object.keys(
            state.registros[0] || {}
        )

        .filter(
            campo =>
                campo !== "ID"
        )

        .map(
            campo => ({

                name: campo,

                label: campo

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
                    registro
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

    function mostrarFormulario() {

        if (!formulario) {

            return;

        }


        formulario.hidden =
            false;

    }


    function esconderFormulario() {

        if (!formulario) {

            return;

        }


        formulario.hidden =
            true;

    }


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
                    campo.type === "checkbox"
                ) {

                    campo.checked =
                        Boolean(
                            valor
                        );

                } else {

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


        if (
            Array.isArray(
                resposta
            )
        ) {

            return resposta[0] || null;

        }


        if (
            resposta.dados
        ) {

            if (
                Array.isArray(
                    resposta.dados
                )
            ) {

                return resposta.dados[0] || null;

            }


            if (
                resposta.dados.ID
            ) {

                return resposta.dados;

            }

        }


        if (
            resposta.data
        ) {

            if (
                Array.isArray(
                    resposta.data
                )
            ) {

                return resposta.data[0] || null;

            }


            if (
                resposta.data.ID
            ) {

                return resposta.data;

            }

        }


        if (
            resposta.ID
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

        const indice =
            state.registros.findIndex(

                item =>

                    String(
                        item.ID
                    ) ===

                    String(
                        registro.ID
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
                    detail: detalhe
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
    // TORNAR MÉTODOS DISPONÍVEIS
    // ========================================================

    Object.assign(
        engine,
        {

            renderizarTabela,

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


    return engine;

}
