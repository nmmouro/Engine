/**
 * ============================================================
 * CRUD SERVICE
 * ============================================================
 *
 * Serviço genérico de comunicação com a API.
 *
 * O serviço NÃO conhece:
 *
 * - VEICULOS
 * - EMPREGADOS
 * - LANCAMENTOS
 * - ou qualquer outra entidade.
 *
 * Ele apenas recebe o nome da aba/entidade.
 *
 * Exemplos:
 *
 * listar("VEICULOS")
 * salvar("VEICULOS", dados)
 * atualizar("VEICULOS", dados)
 * excluir("VEICULOS", id)
 *
 * ============================================================
 */

import { CONFIG } from "../config/config.js";


// ============================================================
// REQUISIÇÃO BASE
// ============================================================

async function requisicao(params = {}) {

    if (!CONFIG?.api?.url) {

        throw new Error(
            "CRUD Service: CONFIG.api.url não configurada."
        );

    }


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
                    String(valor)
                );

            }

        }
    );


    const resposta =
        await fetch(url.toString(), {
            method: "GET",
            cache: "no-store"
        });


    if (!resposta.ok) {

        throw new Error(
            `Erro HTTP ${resposta.status}`
        );

    }


    let json;

    try {

        json =
            await resposta.json();

    } catch (erro) {

        throw new Error(
            "A API retornou uma resposta que não é JSON."
        );

    }


    validarResposta(json);


    return json;

}


// ============================================================
// VALIDAR RESPOSTA
// ============================================================

function validarResposta(resposta) {

    if (!resposta) {

        throw new Error(
            "A API não retornou dados."
        );

    }


    // --------------------------------------------------------
    // Erro externo
    // --------------------------------------------------------

    if (
        resposta.sucesso === false
    ) {

        throw new Error(
            resposta.erro ||
            resposta.message ||
            "Erro retornado pela API."
        );

    }


    // --------------------------------------------------------
    // Algumas versões da API retornam:
    //
    // {
    //     sucesso: true,
    //     dados: {
    //         sucesso: false,
    //         erro: "..."
    //     }
    // }
    // --------------------------------------------------------

    if (
        resposta.dados &&
        typeof resposta.dados === "object" &&
        !Array.isArray(resposta.dados) &&
        resposta.dados.sucesso === false
    ) {

        throw new Error(
            resposta.dados.erro ||
            resposta.dados.message ||
            "Erro retornado pela API."
        );

    }

}


// ============================================================
// EXTRAIR DADOS
// ============================================================

function extrairDados(resposta) {

    // --------------------------------------------------------
    // Formato:
    //
    // {
    //     sucesso: true,
    //     dados: [...]
    // }
    // --------------------------------------------------------

    if (
        Array.isArray(resposta?.dados)
    ) {

        return resposta.dados;

    }


    // --------------------------------------------------------
    // Formato:
    //
    // {
    //     sucesso: true,
    //     dados: {
    //         sucesso: true,
    //         dados: [...]
    //     }
    // }
    // --------------------------------------------------------

    if (
        Array.isArray(
            resposta?.dados?.dados
        )
    ) {

        return resposta.dados.dados;

    }


    // --------------------------------------------------------
    // Nenhum array encontrado
    // --------------------------------------------------------

    return [];

}


// ============================================================
// LISTAR
// ============================================================

export async function listar(aba) {

    validarAba(aba);


    const resposta =
        await requisicao({

            acao: "listar",

            aba

        });


    return extrairDados(
        resposta
    );

}


// ============================================================
// OBTER
// ============================================================

export async function obter(
    aba,
    id
) {

    validarAba(aba);


    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            "CRUD Service: ID não informado."
        );

    }


    const resposta =
        await requisicao({

            acao: "obter",

            aba,

            id

        });


    // --------------------------------------------------------
    // Normaliza:
    //
    // dados.dados
    // dados
    // resposta
    // --------------------------------------------------------

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
    aba,
    dados
) {

    validarAba(aba);

    validarDados(dados);


    return requisicao({

        acao: "criar",

        aba,

        dados:
            JSON.stringify(dados)

    });

}


// ============================================================
// CRIAR
// ============================================================
//
// Alias.
//
// Mantemos "criar" para compatibilidade com
// createCrud() e com partes antigas do Engine.
// ============================================================

export async function criar(
    aba,
    dados
) {

    return salvar(
        aba,
        dados
    );

}


// ============================================================
// ATUALIZAR
// ============================================================

export async function atualizar(
    aba,
    dados
) {

    validarAba(aba);

    validarDados(dados);


    if (
        !dados.ID
    ) {

        throw new Error(
            "CRUD Service: ID obrigatório para atualização."
        );

    }


    return requisicao({

        acao: "atualizar",

        aba,

        id:
            dados.ID,

        dados:
            JSON.stringify(dados)

    });

}


// ============================================================
// EXCLUIR
// ============================================================

export async function excluir(
    aba,
    id
) {

    validarAba(aba);


    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            "CRUD Service: ID não informado para exclusão."
        );

    }


    return requisicao({

        acao: "excluir",

        aba,

        id

    });

}


// ============================================================
// VALIDAÇÕES INTERNAS
// ============================================================

function validarAba(aba) {

    if (
        !aba ||
        typeof aba !== "string"
    ) {

        throw new Error(
            "CRUD Service: nome da entidade/aba não informado."
        );

    }

}


function validarDados(dados) {

    if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
    ) {

        throw new Error(
            "CRUD Service: dados inválidos."
        );

    }

}
