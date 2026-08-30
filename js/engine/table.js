/**
 * ============================================================
 * TABLE
 * Painel Frota
 *
 * Arquivo:
 *     js/engine/table.js
 *
 * Responsabilidades:
 *
 *     - Criar/renderizar tabela
 *     - Paginação
 *     - Exibir registros
 *     - Exibir ações
 *     - Editar
 *     - Excluir
 *     - Actions personalizadas
 *
 * NÃO é responsabilidade deste arquivo:
 *
 *     - Comunicação com Supabase
 *     - Comunicação com PostgreSQL
 *     - Carregar registros
 *     - Criar registros
 *     - Atualizar registros
 *
 * Tudo isso pertence ao Engine/CRUD.
 *
 * IMPORTANTE:
 *
 *     table.iniciar()
 *
 * NÃO chama renderizar().
 *
 * A renderização acontece quando o Engine terminar
 * de carregar os registros.
 *
 * ============================================================
 */


// ============================================================
// CREATE TABLE
// ============================================================

export function createTable(config = {}) {

    // ========================================================
    // VALIDAR ENGINE
    // ========================================================

    if (!config.engine) {

        throw new Error(
            "Table: engine não informado."
        );

    }


    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    const engine =
        config.engine;

    const schema =
        config.schema ||
        engine.schema ||
        null;

    const options =
        config.options ||
        engine.options ||
        {};


    // ========================================================
    // CONTAINER
    // ========================================================

    const containerPrincipal =
        typeof config.container === "string"

            ? document.querySelector(
                config.container
            )

            : config.container;


    if (!containerPrincipal) {

        throw new Error(
            "Table: container não encontrado."
        );

    }


    // ========================================================
    // ESTADO INTERNO
    // ========================================================

    let containerTabela = null;

    let iniciado = false;


    // ========================================================
    // API PÚBLICA
    // ========================================================

    const table = {

        engine,

        schema,

        options,

        container:
            containerPrincipal,


        // ====================================================
        // INICIAR
        // ====================================================

        iniciar() {

            console.log(
                `TABLE ${engine.entity || ""} → INICIAR`
            );


            localizarContainer();


            registrarEventos();


            iniciado = true;


            console.log(
                `TABLE ${engine.entity || ""} → INICIADO`
            );

        },


        // ====================================================
        // RENDERIZAR
        // ====================================================

        renderizar() {

            if (!iniciado) {

                localizarContainer();

            }


            if (!containerTabela) {

                console.warn(
                    "TABLE: container da tabela não encontrado."
                );

                return;

            }


            console.log(
                `TABLE ${engine.entity || ""} → RENDERIZAR`
            );


            const registros =
                obterRegistrosPagina();


            if (!registros.length) {

                renderizarVazio();

                return;

            }


            const colunas =
                obterColunas();


            if (!colunas.length) {

                renderizarVazio(
                    "Nenhuma coluna configurada."
                );

                return;

            }


            let html = "";


            html += `
                <table class="engine-table">
                    <thead>
                        <tr>
            `;


            // ------------------------------------------------
            // CABEÇALHO
            // ------------------------------------------------

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


            // ------------------------------------------------
            // COLUNA AÇÕES
            // ------------------------------------------------

            if (possuiAcoes()) {

                html += `
                    <th class="engine-table-acoes">
                        Ações
                    </th>
                `;

            }


            html += `
                        </tr>
                    </thead>
                    <tbody>
            `;


            // ------------------------------------------------
            // REGISTROS
            // ------------------------------------------------

            registros.forEach(
                registro => {

                    html += `
                        <tr>
                    `;


                    colunas.forEach(
                        coluna => {

                            const nome =
                                obterNomeColuna(
                                    coluna
                                );


                            const valor =
                                registro?.[
                                    nome
                                ];


                            html += `
                                <td>
                                    ${formatarCelula(
                                        valor,
                                        coluna
                                    )}
                                </td>
                            `;

                        }
                    );


                    // ----------------------------------------
                    // AÇÕES
                    // ----------------------------------------

                    if (possuiAcoes()) {

                        html += `
                            <td class="engine-actions">
                                ${renderizarAcoes(
                                    registro
                                )}
                            </td>
                        `;

                    }


                    html += `
                        </tr>
                    `;

                }
            );


            html += `
                    </tbody>
                </table>
            `;


            // =================================================
            // PAGINAÇÃO
            // =================================================

            html +=
                renderizarPaginacao();


            containerTabela.innerHTML =
                html;

        },


        // ====================================================
        // LIMPAR
        // ====================================================

        limpar() {

            if (!containerTabela) {

                return;

            }


            containerTabela.innerHTML =
                "";

        },


        // ====================================================
        // PAGINAÇÃO
        // ====================================================

        atualizar() {

            this.renderizar();

        }

    };


    // ========================================================
    // LOCALIZAR CONTAINER
    // ========================================================

    function localizarContainer() {

        // ----------------------------------------------------
        // Primeiro procura o container oficial.
        // ----------------------------------------------------

        containerTabela =
            containerPrincipal.querySelector(
                "[data-engine-table]"
            );


        // ----------------------------------------------------
        // Se o próprio container possuir o atributo.
        // ----------------------------------------------------

        if (
            !containerTabela &&
            containerPrincipal.matches(
                "[data-engine-table]"
            )
        ) {

            containerTabela =
                containerPrincipal;

        }


        // ----------------------------------------------------
        // Compatibilidade com estrutura antiga.
        // ----------------------------------------------------

        if (!containerTabela) {

            containerTabela =
                containerPrincipal.querySelector(
                    ".engine-table-container"
                );

        }


        // ----------------------------------------------------
        // Se ainda não existir, criar.
        // ----------------------------------------------------

        if (!containerTabela) {

            containerTabela =
                document.createElement(
                    "div"
                );


            containerTabela.setAttribute(
                "data-engine-table",
                ""
            );


            containerTabela.className =
                "engine-table-container";


            containerPrincipal.appendChild(
                containerTabela
            );

        }

    }


    // ========================================================
    // EVENTOS
    // ========================================================

    function registrarEventos() {

        // ----------------------------------------------------
        // EVENTO DO ENGINE:
        //
        // Quando terminar de carregar, renderiza.
        // ----------------------------------------------------

        containerPrincipal.addEventListener(
            "engine:carregado",
            () => {

                renderizar();

            }
        );


        // ----------------------------------------------------
        // EVENTO:
        //
        // Quando o estado local for atualizado.
        // ----------------------------------------------------

        containerPrincipal.addEventListener(
            "engine:salvo",
            () => {

                renderizar();

            }
        );


        // ----------------------------------------------------
        // EVENTO:
        //
        // Registro excluído.
        // ----------------------------------------------------

        containerPrincipal.addEventListener(
            "engine:excluido",
            () => {

                renderizar();

            }
        );


        // ----------------------------------------------------
        // CLIQUES DA TABELA
        // ----------------------------------------------------

        containerPrincipal.addEventListener(
            "click",
            evento => {

                const elemento =
                    evento.target.closest(
                        "[data-table-action]"
                    );


                if (!elemento) {

                    return;

                }


                const acao =
                    elemento.getAttribute(
                        "data-table-action"
                    );


                const id =
                    elemento.getAttribute(
                        "data-id"
                    );


                const nomeAction =
                    elemento.getAttribute(
                        "data-engine-action"
                    );


                // ==========================================
                // EDITAR
                // ==========================================

                if (
                    acao === "editar"
                ) {

                    if (!id) {

                        console.error(
                            "TABLE → EDITAR → ID não informado"
                        );

                        return;

                    }


                    engine.editar(
                        id
                    )
                    .catch(
                        erro => {

                            console.error(
                                "TABLE → EDITAR:",
                                erro
                            );

                        }
                    );


                    return;

                }


                // ==========================================
                // EXCLUIR
                // ==========================================

                if (
                    acao === "excluir"
                ) {

                    if (!id) {

                        console.error(
                            "TABLE → EXCLUIR → ID não informado"
                        );

                        return;

                    }


                    engine.excluir(
                        id
                    )
                    .catch(
                        erro => {

                            console.error(
                                "TABLE → EXCLUIR:",
                                erro
                            );

                        }
                    );


                    return;

                }


                // ==========================================
                // PAGINAÇÃO
                // ==========================================

                if (
                    acao === "pagina"
                ) {

                    const pagina =
                        Number(
                            elemento.getAttribute(
                                "data-pagina"
                            )
                        );


                    if (
                        Number.isFinite(
                            pagina
                        )
                    ) {

                        engine.pagina(
                            pagina
                        );

                    }


                    return;

                }


                // ==========================================
                // ACTION PERSONALIZADA
                // ==========================================

                if (
                    acao === "custom" &&
                    nomeAction
                ) {

                    const registro =
                        encontrarRegistro(
                            id
                        );


                    engine.action(
                        nomeAction,
                        registro
                    );


                    return;

                }

            }
        );

    }


    // ========================================================
    // OBTER REGISTROS DA PÁGINA
    // ========================================================

    function obterRegistrosPagina() {

        // ----------------------------------------------------
        // IMPORTANTE:
        //
        // obterRegistrosFiltrados pertence ao ENGINE.
        //
        // NÃO pertence ao engine.state.
        // ----------------------------------------------------

        let registros = [];


        if (
            typeof engine.obterRegistrosFiltrados ===
            "function"
        ) {

            registros =
                engine.obterRegistrosFiltrados();

        } else {

            registros =
                Array.isArray(
                    engine.state?.registros
                )

                    ? engine.state.registros

                    : [];

        }


        const paginaAtual =
            Number(
                engine.state?.paginaAtual || 1
            );


        const paginaTamanho =
            Number(
                engine.state?.paginaTamanho || 10
            );


        const inicio =
            (
                paginaAtual - 1
            ) *
            paginaTamanho;


        return registros.slice(
            inicio,
            inicio + paginaTamanho
        );

    }


    // ========================================================
    // OBTÉM TODAS AS COLUNAS
    // ========================================================

    function obterColunas() {

        // ----------------------------------------------------
        // Configuração explícita.
        // ----------------------------------------------------

        if (
            Array.isArray(
                options.colunas
            )
        ) {

            return options.colunas.filter(
                coluna => {

                    const nome =
                        obterNomeColuna(
                            coluna
                        );


                    return (
                        nome &&
                        nome.toLowerCase() !==
                        "id"
                    );

                }
            );

        }


        // ----------------------------------------------------
        // Schema.
        // ----------------------------------------------------

        if (
            schema &&
            Array.isArray(
                schema.fields
            )
        ) {

            return schema.fields.filter(
                campo => {

                    if (!campo) {

                        return false;

                    }


                    const nome =
                        obterNomeColuna(
                            campo
                        );


                    if (!nome) {

                        return false;

                    }


                    // Nunca mostrar ID.
                    if (
                        String(nome)
                            .toLowerCase() ===
                        "id"
                    ) {

                        return false;

                    }


                    if (
                        campo.visible === false
                    ) {

                        return false;

                    }


                    if (
                        campo.hidden === true
                    ) {

                        return false;

                    }


                    return true;

                }
            );

        }


        // ----------------------------------------------------
        // Inferir pelas propriedades.
        // ----------------------------------------------------

        const primeiro =
            engine.state?.registros?.[0];


        if (!primeiro) {

            return [];

        }


        return Object.keys(
            primeiro
        )
        .filter(
            nome =>
                String(nome)
                    .toLowerCase() !==
                "id"
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
    // NOME DA COLUNA
    // ========================================================

    function obterNomeColuna(
        coluna
    ) {

        if (
            typeof coluna ===
            "string"
        ) {

            return coluna;

        }


        return (
            coluna?.name ||
            coluna?.campo ||
            coluna?.field ||
            ""
        );

    }


    // ========================================================
    // TÍTULO DA COLUNA
    // ========================================================

    function obterTituloColuna(
        coluna
    ) {

        if (
            typeof coluna ===
            "string"
        ) {

            return coluna;

        }


        return (
            coluna?.label ||
            coluna?.titulo ||
            coluna?.title ||
            coluna?.name ||
            coluna?.campo ||
            ""
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


        const tipo =
            String(
                coluna?.type ||
                coluna?.tipo ||
                ""
            )
            .toLowerCase();


        // ----------------------------------------------------
        // BOOLEAN
        // ----------------------------------------------------

        if (
            tipo === "boolean"
        ) {

            return valor
                ? "SIM"
                : "NÃO";

        }


        // ----------------------------------------------------
        // DATA
        // ----------------------------------------------------

        if (
            tipo === "date"
        ) {

            return escaparHTML(
                formatarData(
                    valor
                )
            );

        }


        // ----------------------------------------------------
        // DATETIME
        // ----------------------------------------------------

        if (
            tipo === "datetime" ||
            tipo === "timestamp"
        ) {

            return escaparHTML(
                formatarDataHora(
                    valor
                )
            );

        }


        // ----------------------------------------------------
        // NÚMERO
        // ----------------------------------------------------

        if (
            tipo === "number" ||
            tipo === "numero"
        ) {

            return escaparHTML(
                String(
                    valor
                )
            );

        }


        // ----------------------------------------------------
        // STATUS
        // ----------------------------------------------------

        if (
            String(
                coluna?.name ||
                ""
            )
            .toLowerCase() ===
            "status"
        ) {

            return `
                <span class="status-badge">
                    ${escaparHTML(
                        String(valor)
                    )}
                </span>
            `;

        }


        // ----------------------------------------------------
        // PADRÃO
        // ----------------------------------------------------

        return escaparHTML(
            String(valor)
        );

    }


    // ========================================================
    // AÇÕES
    // ========================================================

    function possuiAcoes() {

        return (
            options.permitirEditar !== false ||
            options.permitirExcluir !== false ||
            possuiActionsPersonalizadas()
        );

    }


    // ========================================================
    // ACTIONS PERSONALIZADAS
    // ========================================================

    function possuiActionsPersonalizadas() {

        const actions =
            options.actions ||
            {};


        return Object.keys(
            actions
        )
        .some(
            nome =>
                typeof actions[nome] ===
                "function"
        );

    }


    // ========================================================
    // RENDERIZAR AÇÕES
    // ========================================================

    function renderizarAcoes(
        registro
    ) {

        const id =
            obterId(
                registro
            );


        let html = "";


        // ----------------------------------------------------
        // EDITAR
        // ----------------------------------------------------

        if (
            options.permitirEditar !== false
        ) {

            html += `
                <button
                    type="button"
                    class="engine-btn engine-btn-editar"
                    data-table-action="editar"
                    data-id="${escaparAtributo(id)}"
                >
                    Editar
                </button>
            `;

        }


        // ----------------------------------------------------
        // EXCLUIR
        // ----------------------------------------------------

        if (
            options.permitirExcluir !== false
        ) {

            html += `
                <button
                    type="button"
                    class="engine-btn engine-btn-excluir"
                    data-table-action="excluir"
                    data-id="${escaparAtributo(id)}"
                >
                    Excluir
                </button>
            `;

        }


        // ----------------------------------------------------
        // ACTIONS PERSONALIZADAS
        // ----------------------------------------------------

        const actions =
            options.actions ||
            {};


        Object.keys(
            actions
        )
        .forEach(
            nome => {

                if (
                    typeof actions[nome] !==
                    "function"
                ) {

                    return;

                }


                html += `
                    <button
                        type="button"
                        class="engine-btn engine-btn-action"
                        data-table-action="custom"
                        data-engine-action="${escaparAtributo(nome)}"
                        data-id="${escaparAtributo(id)}"
                    >
                        ${escaparHTML(
                            obterTituloAction(
                                nome
                            )
                        )}
                    </button>
                `;

            }
        );


        return html;

    }


    // ========================================================
    // OBTER ID
    // ========================================================

    function obterId(
        registro
    ) {

        if (!registro) {

            return "";

        }


        // PostgreSQL/Supabase atual.
        if (
            registro.id !==
            undefined &&
            registro.id !==
            null
        ) {

            return String(
                registro.id
            );

        }


        // Compatibilidade com estrutura anterior.
        if (
            registro.ID !==
            undefined &&
            registro.ID !==
            null
        ) {

            return String(
                registro.ID
            );

        }


        return "";

    }


    // ========================================================
    // ENCONTRAR REGISTRO
    // ========================================================

    function encontrarRegistro(
        id
    ) {

        const registros =
            engine.state?.registros ||
            [];


        return registros.find(
            registro =>
                String(
                    obterId(
                        registro
                    )
                ) ===
                String(id)
        ) || null;

    }


    // ========================================================
    // PAGINAÇÃO
    // ========================================================

    function renderizarPaginacao() {

        const registros =
            typeof engine.obterRegistrosFiltrados ===
            "function"

                ? engine.obterRegistrosFiltrados()

                : (
                    engine.state?.registros ||
                    []
                );


        const tamanho =
            Number(
                engine.state?.paginaTamanho ||
                10
            );


        const total =
            registros.length;


        const paginas =
            Math.max(
                1,
                Math.ceil(
                    total /
                    tamanho
                )
            );


        const atual =
            Math.min(
                Math.max(
                    1,
                    Number(
                        engine.state?.paginaAtual ||
                        1
                    )
                ),
                paginas
            );


        if (
            paginas <= 1
        ) {

            return "";

        }


        let html = `
            <div class="engine-pagination">
        `;


        // ----------------------------------------------------
        // ANTERIOR
        // ----------------------------------------------------

        html += `
            <button
                type="button"
                data-table-action="pagina"
                data-pagina="${atual - 1}"
                ${atual <= 1 ? "disabled" : ""}
            >
                ‹
            </button>
        `;


        // ----------------------------------------------------
        // PÁGINAS
        // ----------------------------------------------------

        for (
            let pagina = 1;
            pagina <= paginas;
            pagina++
        ) {

            html += `
                <button
                    type="button"
                    data-table-action="pagina"
                    data-pagina="${pagina}"
                    ${pagina === atual ? "disabled" : ""}
                >
                    ${pagina}
                </button>
            `;

        }


        // ----------------------------------------------------
        // PRÓXIMA
        // ----------------------------------------------------

        html += `
            <button
                type="button"
                data-table-action="pagina"
                data-pagina="${atual + 1}"
                ${atual >= paginas ? "disabled" : ""}
            >
                ›
            </button>
        `;


        html += `
            </div>
        `;


        return html;

    }


    // ========================================================
    // VAZIO
    // ========================================================

    function renderizarVazio(
        mensagem =
            "Nenhum registro encontrado."
    ) {

        if (!containerTabela) {

            return;

        }


        containerTabela.innerHTML = `
            <div class="engine-empty">
                ${escaparHTML(
                    mensagem
                )}
            </div>
        `;

    }


    // ========================================================
    // ACTION TITLE
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
                "Finalizar",

            iniciar:
                "Iniciar",

            detalhes:
                "Detalhes"

        };


        return (
            titulos[nome] ||
            nome
        );

    }


    // ========================================================
    // FORMATAR DATA
    // ========================================================

    function formatarData(
        valor
    ) {

        const data =
            new Date(
                `${valor}T00:00:00`
            );


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return String(
                valor
            );

        }


        return data.toLocaleDateString(
            "pt-BR"
        );

    }


    // ========================================================
    // FORMATAR DATA/HORA
    // ========================================================

    function formatarDataHora(
        valor
    ) {

        const data =
            new Date(
                valor
            );


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return String(
                valor
            );

        }


        return data.toLocaleString(
            "pt-BR",
            {
                dateStyle:
                    "short",

                timeStyle:
                    "short"
            }
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
    // RETORNAR
    // ========================================================

    return table;

}
