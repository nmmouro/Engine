/**
 * ============================================================
 * CRUD SERVICE
 * ============================================================
 *
 * Serviço CRUD genérico do Engine.
 *
 * Responsabilidades:
 *
 * - Comunicação com Google Apps Script
 * - Listagem
 * - Consulta por ID
 * - Criação
 * - Atualização
 * - Exclusão
 *
 * Nenhuma entidade específica deve ser tratada aqui.
 *
 * Exemplos:
 *
 * listar("VEICULOS")
 * listar("EMPREGADOS")
 * listar("LANCAMENTOS")
 *
 * salvar("VEICULOS", dados)
 * atualizar("VEICULOS", dados)
 * excluir("VEICULOS", id)
 * ============================================================
 */

import {
    CONFIG
} from "../config/config.js";


// ============================================================
// REQUISIÇÃO
// ============================================================

async function requisicao(params = {}) {

    const url =
        new URL(CONFIG.api.url);


    Object.entries(params).forEach(
        ([chave, valor]) => {

            if (
                valor !== undefined &&
                valor !== null
            ) {

                url.searchParams.set(
                    chave,
                    valor
                );

            }

        }
    );


    const resposta =
        await fetch(url);


    if (!resposta.ok) {

        throw new Error(
            `Erro HTTP ${resposta.status}`
        );

    }


    const json =
        await resposta.json();


    if (
        json.sucesso === false
    ) {

        throw new Error(
            json.erro ||
            json.message ||
            "Erro na API."
        );

    }


    return json;

}


// ============================================================
// EXTRAIR DADOS
// ============================================================

function extrairDados(resposta) {

    /*
     * Normaliza diferentes formatos
     * possíveis retornados pela API.
     *
     * Formato 1:
     *
     * {
     *   sucesso: true,
     *   dados: [...]
     * }
     *
     *
     * Formato 2:
     *
     * {
     *   sucesso: true,
     *   dados: {
     *      sucesso: true,
     *      dados: [...]
     *   }
     * }
     */


    if (
        Array.isArray(
            resposta?.dados
        )
    ) {

        return resposta.dados;

    }


    if (
        Array.isArray(
            resposta?.dados?.dados
        )
    ) {

        return resposta.dados.dados;

    }


    return [];

}


// ============================================================
// LISTAR
// ============================================================

export async function listar(entity) {

    if (!entity) {

        throw new Error(
            "CRUD: entidade não informada."
        );

    }


    const resposta =
        await requisicao({

            acao: "listar",

            aba: entity

        });


    return extrairDados(
        resposta
    );

}


// ============================================================
// OBTER
// ============================================================

export async function obter(
    entity,
    id
) {

    if (!entity) {

        throw new Error(
            "CRUD: entidade não informada."
        );

    }


    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            "CRUD: ID não informado."
        );

    }


    const resposta =
        await requisicao({

            acao: "obter",

            aba: entity,

            id

        });


    /*
     * Normaliza:
     *
     * dados.dados
     * dados
     * resposta
     */

    return (
        resposta?.dados?.dados ??
        resposta?.dados ??
        resposta
    );

}


// ============================================================
// SALVAR
// ============================================================

export async function salvar(
    entity,
    dados
) {

    if (!entity) {

        throw new Error(
            "CRUD: entidade não informada."
        );

    }


    if (
        !dados ||
        typeof dados !== "object"
    ) {

        throw new Error(
            "CRUD: dados inválidos para salvar."
        );

    }


    return requisicao({

        acao: "criar",

        aba: entity,

        dados:
            JSON.stringify(dados)

    });

}


// ============================================================
// CRIAR
// ============================================================

/*
 * Alias compatível com o nome antigo.
 *
 * Assim os dois formatos funcionam:
 *
 * criar(...)
 * salvar(...)
 */

export async function criar(
    entity,
    dados
) {

    return salvar(
        entity,
        dados
    );

}


// ============================================================
// ATUALIZAR
// ============================================================

export async function atualizar(
    entity,
    dados
) {

    if (!entity) {

        throw new Error(
            "CRUD: entidade não informada."
        );

    }


    if (
        !dados ||
        typeof dados !== "object"
    ) {

        throw new Error(
            "CRUD: dados inválidos."
        );

    }


    if (
        !dados.ID
    ) {

        throw new Error(
            "ID obrigatório para atualização."
        );

    }


    return requisicao({

        acao: "atualizar",

        aba: entity,

        id: dados.ID,

        dados:
            JSON.stringify(dados)

    });

}


// ============================================================
// EXCLUIR
// ============================================================

export async function excluir(
    entity,
    id
) {

    if (!entity) {

        throw new Error(
            "CRUD: entidade não informada."
        );

    }


    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            "CRUD: ID não informado."
        );

    }


    return requisicao({

        acao: "excluir",

        aba: entity,

        id

    });

}
