/**
 * ============================================================
 * ENGINE
 * Painel Frota
 *
 * Arquivo:
 * js/engine/engine.js
 *
 * Responsabilidades:
 *
 * - Coordenar operações CRUD
 * - Controlar Novo
 * - Controlar Editar
 * - Controlar Salvar
 * - Controlar Excluir
 * - Utilizar o State
 * - Emitir eventos
 *
 * O ENGINE NÃO:
 *
 * - Cria HTML
 * - Renderiza tabela
 * - Cria formulário
 * - Cria toolbar
 * - Conhece Supabase
 * - Conhece PostgreSQL
 *
 * Comunicação:
 *
 *     engine.js
 *          ↓
 *       crud.js
 *          ↓
 *   crudService.js
 *
 * ============================================================
 */


// ============================================================
// IMPORT CRUD
// ============================================================

import {
    listar,
    obter,
    criar,
    atualizar,
    excluir
} from "./crud.js";


// ============================================================
// CREATE ENGINE
// ============================================================

export function createEngine(
    config = {}
) {

    // ========================================================
    // VALIDAR CONFIGURAÇÃO
    // ========================================================

    if (
        !config.entity
    ) {

        throw new Error(
            "Engine: entidade não informada."
        );

    }


    if (
        !config.state
    ) {

        throw new Error(
            "Engine: state não informado."
        );

    }


    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    const entity =
        String(
            config.entity
        ).trim();


    const schema =
        config.schema || {};


    const options =
        config.options || {};


    const container =
        config.container || null;


    // ========================================================
    // STATE
    // ========================================================

    /*
     * O State pertence ao Module.
     *
     * O Engine apenas manipula o State.
     */

    const state =
        config.state;


    // ========================================================
    // EMITIR EVENTO
    // ========================================================

    function emitir(
        nome,
        detalhe
    ) {

        if (
            !container ||
            typeof container.dispatchEvent !==
                "function"
        ) {

            return;

        }


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
    // ENGINE
    // ========================================================

    const engine = {

        // ====================================================
        // PROPRIEDADES
        // ====================================================

        entity,

        schema,

        options,

        container,

        state,


        // ====================================================
        // INICIAR
        // ====================================================

        async iniciar() {

            console.log(
                `ENGINE ${entity} → INICIAR`
            );


            if (
                state.iniciado
            ) {

                console.warn(

                    `ENGINE ${entity}: ` +
                    "já iniciado."

                );


                return (
                    state.registros || []
                );

            }


            try {

                await engine.carregar();


                state.iniciado =
                    true;


                emitir(
                    "iniciado"
                );


                console.log(

                    `ENGINE ${entity} → ` +
                    "INICIADO"

                );


                return (
                    state.registros || []
                );

            } catch (erro) {

                emitir(
                    "erro",
                    erro
                );


                throw erro;

            }

        },


        // ====================================================
        // CARREGAR
        // ====================================================

        async carregar() {

            if (
                state.carregando
            ) {

                return (
                    state.registros || []
                );

            }


            console.log(
                `ENGINE ${entity} → CARREGAR`
            );


            state.carregando =
                true;


            emitir(
                "carregando"
            );


            try {

                const resposta =
                    await listar(
                        entity
                    );


                const registros =
                    normalizarLista(
                        resposta
                    );


                state.registros =
                    registros;


                state.paginaAtual =
                    1;


                console.log(

                    `ENGINE ${entity} → ` +
                    "REGISTROS CARREGADOS:",

                    registros

                );


                emitir(
                    "carregado",
                    registros
                );


                return registros;

            } catch (erro) {

                console.error(

                    `ENGINE ${entity}: ` +
                    "erro ao carregar",

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

            } finally {

                state.carregando =
                    false;


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

            validarId(
                id
            );


            const identificador =
                String(
                    id
                ).trim();


            console.log(

                `ENGINE ${entity} → ` +
                "OBTER →",

                identificador

            );


            const resposta =
                await obter(
                    entity,
                    identificador
                );


            return normalizarRegistro(
                resposta
            );

        },


        // ====================================================
        // NOVO
        // ====================================================

        novo() {

            console.log(
                `ENGINE ${entity} → NOVO`
            );


            state.registroEditando =
                null;


            state.modo =
                "novo";


            emitir(
                "novo"
            );


            return true;

        },


        // ====================================================
        // EDITAR
        // ====================================================

        async editar(
            id
        ) {

            validarId(
                id
            );


            const identificador =
                String(
                    id
                ).trim();


            console.log(

                `ENGINE ${entity} → ` +
                "EDITAR → ID RECEBIDO:",

                identificador

            );


            state.salvando =
                false;


            try {

                const resposta =
                    await obter(
                        entity,
                        identificador
                    );


                const registro =
                    normalizarRegistro(
                        resposta
                    );


                console.log(

                    `ENGINE ${entity} → ` +
                    "REGISTRO OBTIDO:",

                    registro

                );


                if (
                    !registro
                ) {

                    throw new Error(

                        `Registro ${identificador} ` +
                        "não encontrado."

                    );

                }


                state.registroEditando =
                    registro;


                state.modo =
                    "editar";


                emitir(
                    "editar",
                    registro
                );


                return registro;

            } catch (erro) {

                console.error(

                    `ENGINE ${entity}: ` +
                    "erro ao editar",

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

        },


        // ====================================================
        // SALVAR
        // ====================================================

        async salvar(
            dados = {}
        ) {

            if (
                state.salvando
            ) {

                console.warn(

                    `ENGINE ${entity}: ` +
                    "salvamento já em andamento."

                );


                return;

            }


            state.salvando =
                true;


            console.log(

                `ENGINE ${entity} → SALVAR`,

                dados

            );


            emitir(
                "salvando",
                dados
            );


            try {

                let resposta;


                // ============================================
                // EDIÇÃO
                // ============================================

                if (
                    state.registroEditando
                ) {

                    const registroAtualizado = {

                        ...state.registroEditando,

                        ...dados

                    };


                    const id =
                        obterId(
                            state.registroEditando
                        );


                    if (!id) {

                        throw new Error(

                            "Engine: registro em " +
                            "edição não possui ID."

                        );

                    }


                    console.log(

                        `ENGINE ${entity} → ` +
                        "ATUALIZAR → ID:",

                        id

                    );


                    resposta =
                        await atualizar(

                            entity,

                            registroAtualizado

                        );


                    const atualizado =
                        normalizarRegistro(
                            resposta
                        );


                    atualizarRegistroLocal(

                        atualizado ||
                        registroAtualizado

                    );

                }


// ========================================================
// NOVO REGISTRO
// ========================================================

else {

    console.log(
        `ENGINE ${entity} → CRIAR`
    );


    // ----------------------------------------------------
    // GERAR ID
    // ----------------------------------------------------

    const id =
        gerarNovoId();


    // ----------------------------------------------------
    // MONTAR REGISTRO
    // ----------------------------------------------------

    const registroNovo = {

        id,

        ...dados

    };


    console.log(
        `ENGINE ${entity} → NOVO REGISTRO:`,
        registroNovo
    );


    // ----------------------------------------------------
    // ENVIAR PARA CRUD
    // ----------------------------------------------------

    resposta =
        await criar(
            entity,
            registroNovo
        );


    // ----------------------------------------------------
    // NORMALIZAR RESPOSTA
    // ----------------------------------------------------

    const novoRegistro =
        normalizarRegistroResposta(
            resposta
        );


    // ----------------------------------------------------
    // ATUALIZAR ESTADO
    // ----------------------------------------------------

    if (novoRegistro) {

        state.registros.push(
            novoRegistro
        );

    } else {

        // Caso a API não devolva o registro criado,
        // usamos o próprio registro enviado.

        state.registros.push(
            registroNovo
        );

    }

}



                // ============================================
                // FINALIZAR
                // ============================================

                state.registroEditando =
                    null;


                state.modo =
                    null;


                console.log(

                    `ENGINE ${entity} → ` +
                    "SALVO COM SUCESSO"

                );


                emitir(
                    "salvo",
                    resposta
                );


                return resposta;

            } catch (erro) {

                console.error(

                    `ENGINE ${entity}: ` +
                    "erro ao salvar",

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

            } finally {

                state.salvando =
                    false;


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

            validarId(
                id
            );


            const identificador =
                String(
                    id
                ).trim();


            console.log(

                `ENGINE ${entity} → ` +
                "EXCLUIR → ID RECEBIDO:",

                identificador

            );


            const confirmar =
                window.confirm(

                    "Deseja realmente " +
                    "excluir este registro?"

                );


            if (
                !confirmar
            ) {

                return false;

            }


            try {

                await excluir(

                    entity,

                    identificador

                );


                state.registros =
                    (
                        state.registros || []
                    ).filter(

                        registro =>

                            String(
                                obterId(
                                    registro
                                )
                            ) !==
                            identificador

                    );


                console.log(

                    `ENGINE ${entity} → ` +
                    "EXCLUÍDO:",

                    identificador

                );


                emitir(
                    "excluido",
                    identificador
                );


                return true;

            } catch (erro) {

                console.error(

                    `ENGINE ${entity}: ` +
                    "erro ao excluir",

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
                "filtrado",
                state.filtro
            );


            emitir(
                "renderizar"
            );


            return (
                obterRegistrosFiltrados()
            );

        },


        // ====================================================
        // PAGINAÇÃO
        // ====================================================

        pagina(
            numero
        ) {

            const pagina =
                Number(
                    numero
                );


            if (
                !Number.isFinite(
                    pagina
                )
            ) {

                return (
                    state.paginaAtual
                );

            }


            const registros =
                obterRegistrosFiltrados();


            const tamanho =
                Number(
                    state.paginaTamanho ||
                    options.pageSize ||
                    10
                );


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
                        pagina
                    ),

                    totalPaginas

                );


            emitir(
                "pagina",
                state.paginaAtual
            );


            emitir(
                "renderizar"
            );


            return (
                state.paginaAtual
            );

        },


        // ====================================================
        // FECHAR FORMULÁRIO
        // ====================================================

        fecharFormulario() {

            console.log(

                `ENGINE ${entity} → ` +
                "FECHAR FORMULÁRIO"

            );


            state.registroEditando =
                null;


            state.modo =
                null;


            emitir(
                "formulario-fechado"
            );


            return true;

        }

    };


    // ========================================================
    // MÉTODOS AUXILIARES PÚBLICOS
    // ========================================================

    engine.obterRegistrosFiltrados =
        obterRegistrosFiltrados;


    engine.obterId =
        obterId;


    // ========================================================
    // FUNÇÕES INTERNAS
    // ========================================================

    function obterRegistrosFiltrados() {

        const registros =
            Array.isArray(
                state.registros
            )

                ? state.registros

                : [];


        const filtro =
            String(
                state.filtro || ""
            )
            .trim()
            .toLowerCase();


        if (
            !filtro
        ) {

            return registros;

        }


        return registros.filter(

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
                            filtro
                        )

                )

        );

    }


    // ========================================================
    // ATUALIZAR REGISTRO LOCAL
    // ========================================================

    function atualizarRegistroLocal(
        registro
    ) {

        if (
            !registro
        ) {

            return;

        }


        const id =
            obterId(
                registro
            );


        if (!id) {

            return;

        }


        const registros =
            Array.isArray(
                state.registros
            )

                ? state.registros

                : [];


        const indice =
            registros.findIndex(

                item =>

                    String(
                        obterId(
                            item
                        )
                    ) ===
                    String(
                        id
                    )

            );


        if (
            indice >= 0
        ) {

            registros[indice] =
                registro;

        } else {

            registros.push(
                registro
            );

        }


        state.registros =
            registros;


        emitir(
            "renderizar"
        );

    }


    // ========================================================
    // ADICIONAR REGISTRO LOCAL
    // ========================================================

    function adicionarRegistroLocal(
        registro
    ) {

        if (
            !registro
        ) {

            return;

        }


        if (
            !Array.isArray(
                state.registros
            )
        ) {

            state.registros =
                [];

        }


        state.registros.push(
            registro
        );


        emitir(
            "renderizar"
        );

    }


// ============================================================
// OBTER ID DO REGISTRO
// ============================================================

function obterIdRegistro(registro) {

    return (
        registro?.id ??
        registro?.ID ??
        null
    );

}


// ============================================================
// PREFIXO DA ENTIDADE
// ============================================================

function obterPrefixoId() {

    const prefixos = {

        veiculos: "VEI",
        veiculo: "VEI",

        empregados: "EMP",
        empregado: "EMP",

        lancamentos: "LAN",
        lancamento: "LAN"

    };


    return (
        prefixos[
            String(entity).toLowerCase()
        ] ||
        String(entity)
            .substring(0, 3)
            .toUpperCase()
    );

}


// ============================================================
// GERAR NOVO ID
// ============================================================

function gerarNovoId() {

    const prefixo =
        obterPrefixoId();


    let maiorNumero = 0;


    state.registros.forEach(registro => {

        const id =
            obterIdRegistro(registro);


        if (!id) {
            return;
        }


        const texto =
            String(id)
                .trim()
                .toUpperCase();


        const corresponde =
            texto.match(
                new RegExp(
                    `^${prefixo}(\\d+)$`
                )
            );


        if (!corresponde) {
            return;
        }


        const numero =
            Number(
                corresponde[1]
            );


        if (
            Number.isFinite(numero) &&
            numero > maiorNumero
        ) {

            maiorNumero =
                numero;

        }

    });


    return (
        prefixo +
        String(
            maiorNumero + 1
        ).padStart(6, "0")
    );

}




    // ========================================================
    // RETORNAR ENGINE
    // ========================================================

    return engine;

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
        Array.isArray(
            resposta?.dados
        )
    ) {

        return resposta.dados;

    }


    if (
        Array.isArray(
            resposta?.data
        )
    ) {

        return resposta.data;

    }


    return [];

}


// ============================================================
// NORMALIZAR REGISTRO
// ============================================================

function normalizarRegistro(
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
        resposta?.dados
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
        resposta?.data
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
        typeof resposta ===
        "object"
    ) {

        return resposta;

    }


    return null;

}


// ============================================================
// OBTER ID
// ============================================================

function obterId(
    registro
) {

    if (
        !registro
    ) {

        return null;

    }


    /*
     * Supabase / PostgreSQL:
     *
     *     id
     *
     * Compatibilidade:
     *
     *     ID
     *     Id
     */

    return (

        registro.id ??

        registro.ID ??

        registro.Id ??

        null

    );

}


// ============================================================
// VALIDAR ID
// ============================================================

function validarId(
    id
) {

    if (
        id === undefined ||
        id === null ||
        String(
            id
        ).trim() === ""
    ) {

        throw new Error(
            "Engine: ID não informado."
        );

    }

}


// ============================================================
// MOSTRAR ERRO
// ============================================================

function mostrarErro(
    erro
) {

    const mensagem =

        erro?.message ||

        String(
            erro ||
            "Ocorreu um erro."
        );


    if (
        typeof window !==
        "undefined" &&

        typeof window.mostrarToast ===
        "function"
    ) {

        window.mostrarToast(
            mensagem,
            "erro"
        );


        return;

    }


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
