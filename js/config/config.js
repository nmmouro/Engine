/**
 * ============================================================
 * CRUD ENGINE
 * Painel Frota
 *
 * Arquivo:
 * js/engine/crud.js
 *
 * Responsabilidade:
 *
 * - Fazer a ponte entre Engine e crudService
 * - Não manipular DOM
 * - Não manipular formulário
 * - Não manipular tabela
 * - Não controlar State
 *
 * Backend:
 *
 *     services/crudService.js
 *
 * ============================================================
 */


// ============================================================
// IMPORT CRUD SERVICE
// ============================================================

import {
    listar as serviceListar,
    obter as serviceObter,
    criar as serviceCriar,
    atualizar as serviceAtualizar,
    excluir as serviceExcluir
} from "../services/crudService.js";


// ============================================================
// LISTAR
// ============================================================

export async function listar(
    entidade
) {

    console.log(
        "CRUD → LISTAR →",
        entidade
    );


    return serviceListar(
        entidade
    );

}


// ============================================================
// OBTER
// ============================================================

export async function obter(
    entidade,
    id
) {

    if (
        id === undefined ||
        id === null ||
        String(id).trim() === ""
    ) {

        throw new Error(
            "CRUD: ID não informado."
        );

    }


    const identificador =
        String(
            id
        ).trim();


    console.log(
        "CRUD → OBTER →",
        entidade,
        identificador
    );


    return serviceObter(
        entidade,
        identificador
    );

}


// ============================================================
// CRIAR
// ============================================================

export async function criar(
    entidade,
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
        "CRUD → CRIAR →",
        entidade,
        dados
    );


    return serviceCriar(
        entidade,
        dados
    );

}


// ============================================================
// ATUALIZAR
// ============================================================

export async function atualizar(
    entidade,
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


    /*
     * O Supabase utiliza:
     *
     *     id
     *
     * como identificador principal.
     *
     * Mantemos compatibilidade com:
     *
     *     ID
     */

    const id =
        dados.id ??
        dados.ID ??
        dados.Id;


    if (
        id === undefined ||
        id === null ||
        String(id).trim() === ""
    ) {

        throw new Error(
            "CRUD: ID não informado para atualização."
        );

    }


    console.log(
        "CRUD → ATUALIZAR →",
        entidade,
        String(id).trim()
    );


    return serviceAtualizar(
        entidade,
        dados
    );

}


// ============================================================
// EXCLUIR
// ============================================================

export async function excluir(
    entidade,
    id
) {

    if (
        id === undefined ||
        id === null ||
        String(id).trim() === ""
    ) {

        throw new Error(
            "CRUD: ID não informado para exclusão."
        );

    }


    const identificador =
        String(
            id
        ).trim();


    console.log(
        "CRUD → EXCLUIR →",
        entidade,
        identificador
    );


    return serviceExcluir(
        entidade,
        identificador
    );

}


// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {

    listar,

    obter,

    criar,

    atualizar,

    excluir

};
