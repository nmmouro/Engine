/**
 * ============================================================
 * CRUD ENGINE
 * Painel Frota
 * Arquivo: crud.js
 *
 * Responsabilidade:
 *
 * - Centralizar operações CRUD do Engine
 * - Criar registro
 * - Obter registro
 * - Atualizar registro
 * - Excluir registro
 * - Trabalhar com o state
 *
 * NÃO conhece:
 *
 * - Supabase
 * - PostgreSQL
 * - Google Sheets
 * - HTML
 * - Formulário
 * - Tabela
 * - Toolbar
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
// CRIAR CRUD
// ============================================================

export function createCrud(
    config = {}
) {

    const entity =
        String(
            config.entity || ""
        )
        .trim()
        .toLowerCase();


    const state =
        config.state;


    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (!entity) {

        throw new Error(
            "CRUD: entidade não informada."
        );

    }


    if (!state) {

        throw new Error(
            `CRUD ${entity}: state não informado.`
        );

    }


    // ========================================================
    // API CRUD
    // ========================================================

    const crud = {


        // ====================================================
        // LISTAR
        // ====================================================

        async listar() {

            console.log(
                `CRUD ${entity} → LISTAR`
            );


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


            return registros;

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
                    "CRUD: ID não informado."
                );

            }


            console.log(
                `CRUD ${entity} → OBTER → ID:`,
                identificador
            );


            const resposta =
                await obter(
                    entity,
                    identificador
                );


            const registro =
                normalizarRegistro(
                    resposta
                );


            if (!registro) {

                throw new Error(
                    `Registro ${identificador} não encontrado.`
                );

            }


            return registro;

        },


        // ====================================================
        // CRIAR
        // ====================================================

        async criar(
            dados
        ) {

            if (
                !dados ||
                typeof dados !== "object"
            ) {

                throw new Error(
                    "CRUD: dados para criação não informados."
                );

            }


            console.log(
                `CRUD ${entity} → CRIAR:`,
                dados
            );


            const resposta =
                await criar(
                    entity,
                    dados
                );


            const registro =
                normalizarRegistro(
                    resposta
                );


            /*
             * O Supabase pode retornar
             * o registro criado ou não.
             *
             * Só adicionamos ao state
             * quando realmente houver
             * um registro na resposta.
             */

            if (
                registro
            ) {

                state.registros.push(
                    registro
                );

            }


            return resposta;

        },


        // ====================================================
        // ATUALIZAR
        // ====================================================

        async atualizar(
            dados
        ) {

            if (
                !dados ||
                typeof dados !== "object"
            ) {

                throw new Error(
                    "CRUD: dados para atualização não informados."
                );

            }


            const id =
                normalizarId(
                    dados.id ??
                    dados.ID
                );


            if (!id) {

                throw new Error(
                    "CRUD: ID não informado para atualização."
                );

            }


            console.log(
                `CRUD ${entity} → ATUALIZAR → ID:`,
                id
            );


            const registro =
                {

                    ...dados,

                    id

                };


            const resposta =
                await atualizar(
                    entity,
                    registro
                );


            /*
             * Atualizar state local.
             */

            atualizarEstadoLocal(
                registro
            );


            return resposta;

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


            if (!identificador) {

                throw new Error(
                    "CRUD: ID não informado para exclusão."
                );

            }


            console.log(
                `CRUD ${entity} → EXCLUIR → ID:`,
                identificador
            );


            const resposta =
                await excluir(
                    entity,
                    identificador
                );


            /*
             * Remover do state local.
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


            return resposta;

        },


        // ====================================================
        // RECARREGAR
        // ====================================================

        async recarregar() {

            return crud.listar();

        },


        // ====================================================
        // ATUALIZAR REGISTRO NO STATE
        // ====================================================

        atualizarEstado(
            registro
        ) {

            return atualizarEstadoLocal(
                registro
            );

        },


        // ====================================================
        // ADICIONAR AO STATE
        // ====================================================

        adicionarEstado(
            registro
        ) {

            if (
                !registro
            ) {

                return false;

            }


            state.registros.push(
                registro
            );


            return true;

        },


        // ====================================================
        // REMOVER DO STATE
        // ====================================================

        removerEstado(
            id
        ) {

            const identificador =
                normalizarId(
                    id
                );


            if (!identificador) {

                return false;

            }


            const quantidadeAntes =
                state.registros.length;


            state.registros =
                state.registros.filter(

                    registro =>

                        normalizarId(
                            registro?.id ??
                            registro?.ID
                        ) !==
                        identificador

                );


            return (
                state.registros.length <
                quantidadeAntes
            );

        }

    };


    // ========================================================
    // RETORNAR CRUD
    // ========================================================

    return crud;

}


// ============================================================
// ATUALIZAR STATE LOCAL
// ============================================================

function atualizarEstadoLocal(
    state,
    registro
) {

    /*
     * Compatibilidade:
     *
     * A função pode ser chamada diretamente
     * pelo objeto CRUD ou receber state.
     */

    if (
        arguments.length === 1
    ) {

        registro =
            state;

        return false;

    }


    if (
        !registro ||
        !state ||
        !Array.isArray(
            state.registros
        )
    ) {

        return false;

    }


    const id =
        normalizarId(
            registro.id ??
            registro.ID
        );


    if (!id) {

        return false;

    }


    const indice =
        state.registros.findIndex(

            item =>

                normalizarId(
                    item?.id ??
                    item?.ID
                ) ===
                id

        );


    if (
        indice < 0
    ) {

        /*
         * Registro ainda não existe.
         */

        state.registros.push(
            registro
        );


        return true;

    }


    state.registros[
        indice
    ] = registro;


    return true;

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

    /*
     * Supabase:
     *
     * [
     *     {...},
     *     {...}
     * ]
     */

    if (
        Array.isArray(
            resposta
        )
    ) {

        return resposta;

    }


    /*
     * Resposta:
     *
     * { data: [...] }
     */

    if (
        resposta &&
        Array.isArray(
            resposta.data
        )
    ) {

        return resposta.data;

    }


    /*
     * Resposta:
     *
     * { dados: [...] }
     */

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
        resposta.data &&
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
        resposta.dados &&
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
     * Objeto direto
     */

    if (
        typeof resposta ===
        "object"
    ) {

        return resposta;

    }


    return null;

}
