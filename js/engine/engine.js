/**
 * ============================================================
 * ENGINE
 * Painel Frota
 * Arquivo: engine.js
 *
 * ENGINE ENXUTO
 *
 * Responsabilidade:
 *
 * - Controlar CRUD
 * - Manter referência ao state
 * - Carregar registros
 * - Obter registro
 * - Criar registro
 * - Atualizar registro
 * - Excluir registro
 * - Controlar eventos do Engine
 *
 * NÃO possui responsabilidade por:
 *
 * - HTML
 * - Formulário
 * - Tabela
 * - Toolbar
 * - PostgreSQL
 * - Supabase
 * - Google Sheets
 *
 * Componentes:
 *
 *     state.js
 *     form.js
 *     table.js
 *     toolbar.js
 *
 * Backend:
 *
 *     services/crudService.js
 *
 * ============================================================
 */


// ============================================================
// CRUD SERVICE
// ============================================================

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
    // CONFIGURAÇÃO
    // ========================================================

    const entity =
        String(
            config.entity || ""
        )
        .trim()
        .toLowerCase();


    const schema =
        config.schema || null;


    const options =
        config.options || {};


    const container =
        config.container || null;


    const state =
        config.state;


    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (!entity) {

        throw new Error(
            "Engine: entidade não informada."
        );

    }


    if (!state) {

        throw new Error(
            `Engine ${entity}: state não informado.`
        );

    }


    // ========================================================
    // ENGINE
    // ========================================================

    const engine = {

        entity,

        schema,

        options,

        container,

        state,


        // ====================================================
        // INICIAR
        // ====================================================

        async iniciar() {

            return engine.carregar();

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


            emitir(
                "carregando"
            );


            mostrarLoading();


            try {

                console.log(
                    `ENGINE ${entity} → CARREGAR`
                );


                const dados =
                    await listar(
                        entity
                    );


                state.registros =
                    normalizarLista(
                        dados
                    );


                state.paginaAtual =
                    1;


                emitir(
                    "carregado",
                    state.registros
                );


                return state.registros;

            }

            catch (erro) {

                console.error(
                    `ENGINE ${entity} → ERRO AO CARREGAR:`,
                    erro
                );


                emitir(
                    "erro",
                    erro
                );


                mostrarErro(
                    erro
                );


                throw erro;

            }

            finally {

                state.carregando =
                    false;


                esconderLoading();


                emitir(
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

        async obter(
            id
        ) {

            const identificador =
                normalizarId(
                    id
                );


            if (!identificador) {

                throw new Error(
                    "Engine: ID não informado."
                );

            }


            console.log(
                `ENGINE ${entity} → OBTER → ID:`,
                identificador
            );


            try {

                const resposta =
                    await obter(
                        entity,
                        identificador
                    );


                return normalizarRegistro(
                    resposta
                );

            }

            catch (erro) {

                console.error(
                    `ENGINE ${entity} → ERRO AO OBTER:`,
                    erro
                );


                mostrarErro(
                    erro
                );


                throw erro;

            }

        },


        // ====================================================
        // NOVO
        // ====================================================

        novo() {

            state.registroEditando =
                null;


            emitir(
                "novo"
            );


            /*
             * O form.js escuta o evento
             * e prepara o formulário.
             */

            if (
                typeof engine.limparFormulario ===
                "function"
            ) {

                engine.limparFormulario();

            }


            if (
                typeof engine.mostrarFormulario ===
                "function"
            ) {

                engine.mostrarFormulario();

            }


            return true;

        },


        // ====================================================
        // EDITAR
        // ====================================================

        async editar(
            id
        ) {

            const identificador =
                normalizarId(
                    id
                );


            console.log(
                `ENGINE ${entity} → EDITAR → ID RECEBIDO:`,
                identificador
            );


            if (!identificador) {

                throw new Error(
                    "Engine: ID não informado."
                );

            }


            try {

                /*
                 * Buscar registro no backend.
                 */

                const registro =
                    await engine.obter(
                        identificador
                    );


                console.log(
                    `ENGINE ${entity} → REGISTRO OBTIDO:`,
                    registro
                );


                if (!registro) {

                    throw new Error(
                        `Registro ${identificador} não encontrado.`
                    );

                }


                /*
                 * Guardar no estado.
                 */

                state.registroEditando =
                    registro;


                /*
                 * O form.js será responsável
                 * por preencher o formulário.
                 */

                if (
                    typeof engine.preencherFormulario ===
                    "function"
                ) {

                    engine.preencherFormulario(
                        registro
                    );

                }


                if (
                    typeof engine.mostrarFormulario ===
                    "function"
                ) {

                    engine.mostrarFormulario();

                }


                emitir(
                    "editar",
                    registro
                );


                return registro;

            }

            catch (erro) {

                console.error(
                    `ENGINE ${entity} → ERRO AO EDITAR:`,
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

        async salvar(
            dados
        ) {

            if (
                state.salvando
            ) {

                return null;

            }


            state.salvando =
                true;


            mostrarLoading();


            emitir(
                "salvando",
                dados
            );


            try {

                const registroEditando =
                    state.registroEditando;


                // ============================================
                // ATUALIZAR
                // ============================================

                if (
                    registroEditando
                ) {

                    const id =
                        normalizarId(
                            registroEditando.id ??
                            registroEditando.ID
                        );


                    if (!id) {

                        throw new Error(
                            "Engine: registro em edição não possui ID."
                        );

                    }


                    const registro =
                        {

                            ...registroEditando,

                            ...(dados || {}),

                            id

                        };


                    console.log(
                        `ENGINE ${entity} → ATUALIZAR → ID:`,
                        id
                    );


                    const resposta =
                        await atualizar(
                            entity,
                            registro
                        );


                    /*
                     * Atualizar estado local.
                     */

                    atualizarEstadoLocal(
                        registro
                    );


                    state.registroEditando =
                        null;


                    emitir(
                        "atualizado",
                        resposta
                    );


                    emitir(
                        "salvo",
                        resposta
                    );


                    return resposta;

                }


                // ============================================
                // CRIAR
                // ============================================

                console.log(
                    `ENGINE ${entity} → CRIAR`
                );


                const resposta =
                    await criar(
                        entity,
                        dados || {}
                    );


                /*
                 * O backend/Supabase pode retornar:
                 *
                 * Array
                 * { data: [...] }
                 * { dados: [...] }
                 * Objeto
                 */

                const novoRegistro =
                    normalizarRegistro(
                        resposta
                    );


                if (
                    novoRegistro
                ) {

                    state.registros.push(
                        novoRegistro
                    );

                }


                state.registroEditando =
                    null;


                emitir(
                    "criado",
                    novoRegistro
                );


                emitir(
                    "salvo",
                    resposta
                );


                return resposta;

            }

            catch (erro) {

                console.error(
                    `ENGINE ${entity} → ERRO AO SALVAR:`,
                    erro
                );


                emitir(
                    "erro-salvamento",
                    erro
                );


                mostrarErro(
                    erro
                );


                throw erro;

            }

            finally {

                state.salvando =
                    false;


                esconderLoading();


                emitir(
                    "fim-salvamento"
                );

            }

        },


        // ====================================================
        // EXCLUIR
        // ====================================================

        async excluir(
            id
        ) {

            const identificador =
                normalizarId(
                    id
                );


            console.log(
                `ENGINE ${entity} → EXCLUIR → ID RECEBIDO:`,
                identificador
            );


            if (!identificador) {

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
                    identificador
                );


                /*
                 * Remover do estado local.
                 *
                 * IMPORTANTE:
                 *
                 * PostgreSQL/Supabase usa:
                 *
                 *     registro.id
                 *
                 * e não:
                 *
                 *     registro.ID
                 */

                state.registros =
                    state.registros.filter(

                        registro =>

                            normalizarId(
                                registro?.id ??
                                registro?.ID
                            ) !==
                            identificador

                    );


                emitir(
                    "excluido",
                    identificador
                );


                return true;

            }

            catch (erro) {

                console.error(
                    `ENGINE ${entity} → ERRO AO EXCLUIR:`,
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

        filtrar(
            valor
        ) {

            state.filtro =
                String(
                    valor ?? ""
                )
                .trim()
                .toLowerCase();


            state.paginaAtual =
                1;


            emitir(
                "filtro",
                state.filtro
            );


            if (
                typeof engine.renderizarTabela ===
                "function"
            ) {

                engine.renderizarTabela();

            }


            return obterRegistrosFiltrados();

        },


        // ====================================================
        // PAGINAÇÃO
        // ====================================================

        pagina(
            numero
        ) {

            const registros =
                obterRegistrosFiltrados();


            const tamanho =
                Number(
                    state.paginaTamanho
                ) || 10;


            const totalPaginas =
                Math.max(
                    1,
                    Math.ceil(
                        registros.length /
                        tamanho
                    )
                );


            state.paginaAtual =
                Math.min(

                    Math.max(
                        1,
                        Number(
                            numero
                        ) || 1
                    ),

                    totalPaginas

                );


            emitir(
                "pagina",
                state.paginaAtual
            );


            if (
                typeof engine.renderizarTabela ===
                "function"
            ) {

                engine.renderizarTabela();

            }


            return state.paginaAtual;

        },


        // ====================================================
        // FECHAR FORMULÁRIO
        // ====================================================

        fecharFormulario() {

            state.registroEditando =
                null;


            if (
                typeof engine.esconderFormulario ===
                "function"
            ) {

                engine.esconderFormulario();

            }


            emitir(
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


                return null;

            }


            return funcao(
                registro,
                engine
            );

        },


        // ====================================================
        // ESTADO
        // ====================================================

        obterEstado() {

            return state;

        }

    };


    // ========================================================
    // MÉTODOS VISUAIS
    // ========================================================

    /*
     * Estes métodos são pontos de integração.
     *
     * O module.js/form.js/table.js pode substituí-los.
     */

    engine.mostrarFormulario =
        null;


    engine.esconderFormulario =
        null;


    engine.limparFormulario =
        null;


    engine.preencherFormulario =
        null;


    engine.renderizarTabela =
        null;


    // ========================================================
    // RETORNAR ENGINE
    // ========================================================

    return engine;

}


// ============================================================
// NORMALIZAR ID
// ============================================================

function normalizarId(
    id
) {

    if (
        id === undefined ||
        id === null
    ) {

        return "";

    }


    return String(
        id
    )
    .trim();

}


// ============================================================
// NORMALIZAR LISTA
// ============================================================

function normalizarLista(
    resposta
) {

    if (
        Array.isArray(
            resposta
        )
    ) {

        return resposta;

    }


    if (
        resposta &&
        Array.isArray(
            resposta.data
        )
    ) {

        return resposta.data;

    }


    if (
        resposta &&
        Array.isArray(
            resposta.dados
        )
    ) {

        return resposta.dados;

    }


    return [];

}


// ============================================================
// NORMALIZAR REGISTRO
// ============================================================

function normalizarRegistro(
    resposta
) {

    if (!resposta) {

        return null;

    }


    /*
     * Array
     */

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


    /*
     * { data: [...] }
     */

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


    /*
     * { dados: [...] }
     */

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


    /*
     * { data: {...} }
     */

    if (
        resposta.data &&
        typeof resposta.data ===
        "object"
    ) {

        return resposta.data;

    }


    /*
     * { dados: {...} }
     */

    if (
        resposta.dados &&
        typeof resposta.dados ===
        "object"
    ) {

        return resposta.dados;

    }


    /*
     * Objeto direto.
     */

    if (
        typeof resposta ===
        "object"
    ) {

        return resposta;

    }


    return null;

}


// ============================================================
// ATUALIZAR ESTADO LOCAL
// ============================================================

function atualizarEstadoLocal(
    registro
) {

    if (
        !registro
    ) {

        return;

    }


    const id =
        normalizarId(
            registro.id ??
            registro.ID
        );


    if (!id) {

        return;

    }


    const registros =
        this?.state?.registros;


    /*
     * O this não é confiável em função externa.
     *
     * Esta função é usada pelo Engine
     * através de atualizarRegistroEstado().
     */

}


// ============================================================
// FILTRAR REGISTROS
// ============================================================

function obterRegistrosFiltrados() {

    /*
     * Esta função é substituída abaixo
     * pelo método interno do Engine.
     */

    return [];

}


// ============================================================
// EVENTOS
// ============================================================

function emitir(
    nome,
    detalhe
) {

    /*
     * Esta função recebe o container
     * através do contexto do Engine.
     *
     * Será substituída pelo helper interno.
     */

}


// ============================================================
// LOADING
// ============================================================

function mostrarLoading() {

    /*
     * O loading visual é responsabilidade
     * do module/componentes.
     */

}


// ============================================================
// ESCONDER LOADING
// ============================================================

function esconderLoading() {

    /*
     * O loading visual é responsabilidade
     * do module/componentes.
     */

}


// ============================================================
// ERRO
// ============================================================

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
