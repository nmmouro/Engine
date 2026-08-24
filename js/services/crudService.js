/**
 * ============================================================
 * CRUD SERVICE
 * ============================================================
 *
 * Serviço genérico de comunicação com a API.
 *
 * Responsável por:
 *
 * - LISTAR
 * - OBTER
 * - CRIAR
 * - ATUALIZAR
 * - EXCLUIR
 *
 * Não conhece entidades específicas.
 *
 * ============================================================
 */

import { CONFIG } from "../config/config.js";


// ============================================================
// REQUISIÇÃO BASE
// ============================================================

async function requisicao(params = {}) {

    // --------------------------------------------------------
    // VALIDAR CONFIGURAÇÃO
    // --------------------------------------------------------

    if (!CONFIG?.api?.url) {

        throw new Error(
            "CRUD Service: CONFIG.api.url não configurada."
        );

    }


    // --------------------------------------------------------
    // CRIAR URL
    // --------------------------------------------------------

    const url = new URL(
        CONFIG.api.url
    );


    // --------------------------------------------------------
    // ADICIONAR PARÂMETROS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // DEBUG
    // --------------------------------------------------------

    console.log(
        "CRUD SERVICE → REQUISIÇÃO:",
        {
            acao: params.acao,
            aba: params.aba,
            id: params.id
        }
    );


    // --------------------------------------------------------
    // FETCH
    // --------------------------------------------------------

    const resposta = await fetch(
        url.toString(),
        {
            method: "GET",
            cache: "no-store"
        }
    );


    // --------------------------------------------------------
    // VALIDAR HTTP
    // --------------------------------------------------------

    if (!resposta.ok) {

        throw new Error(
            `Erro HTTP ${resposta.status}`
        );

    }


    // --------------------------------------------------------
    // LER RESPOSTA COMO TEXTO
    // --------------------------------------------------------

    const texto = await resposta.text();


    console.log(
        "CRUD SERVICE → RESPOSTA:",
        texto
    );


    if (!texto) {

        throw new Error(
            "A API retornou uma resposta vazia."
        );

    }


    // --------------------------------------------------------
    // CONVERTER JSON
    // --------------------------------------------------------

    let json;

    try {

        json = JSON.parse(
            texto
        );

    } catch (erro) {

        console.error(
            "Resposta recebida da API:",
            texto
        );

        throw new Error(
            "A API não retornou um JSON válido."
        );

    }


    // --------------------------------------------------------
    // VALIDAR RESPOSTA
    // --------------------------------------------------------

    validarResposta(
        json
    );


    return json;

}


// ============================================================
// VALIDAR RESPOSTA
// ============================================================

function validarResposta(
    resposta
) {

    if (!resposta) {

        throw new Error(
            "A API não retornou dados."
        );

    }


    // --------------------------------------------------------
    // ERRO PRINCIPAL
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
    // ERRO INTERNO
    // --------------------------------------------------------

    if (
        resposta.dados &&
        typeof resposta.dados === "object" &&
        !Array.isArray(
            resposta.dados
        ) &&
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

function extrairDados(
    resposta
) {

    // --------------------------------------------------------
    // FORMATO:
    //
    // {
    //     sucesso: true,
    //     dados: [...]
    // }
    // --------------------------------------------------------

    if (
        Array.isArray(
            resposta?.dados
        )
    ) {

        return resposta.dados;

    }


    // --------------------------------------------------------
    // FORMATO:
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


    return [];

}


// ============================================================
// LISTAR
// ============================================================

export async function listar(
    aba
) {

    validarAba(
        aba
    );


    const resposta =
        await requisicao({

            acao: "listar",

            aba: aba

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

    validarAba(
        aba
    );


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

            aba: aba,

            id: id

        });


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

    validarAba(
        aba
    );


    validarDados(
        dados
    );


    console.log(
        "CRUD SERVICE → SALVAR:",
        {
            aba: aba,
            dados: dados
        }
    );


    const resposta =
        await requisicao({

            acao: "criar",

            aba: aba,

            dados:
                JSON.stringify(
                    dados
                )

        });


    console.log(
        "CRUD SERVICE → SALVAR OK:",
        resposta
    );


    return resposta;

}


// ============================================================
// CRIAR
// ============================================================
//
// Alias utilizado pelo Engine.
//
// crud.criar(dados)
//     ↓
// criar(entity, dados)
//     ↓
// salvar(entity, dados)
//
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

    validarAba(
        aba
    );


    validarDados(
        dados
    );


    if (
        !dados.ID
    ) {

        throw new Error(
            "CRUD Service: ID obrigatório para atualização."
        );

    }


    console.log(
        "CRUD SERVICE → ATUALIZAR:",
        {
            aba: aba,
            id: dados.ID,
            dados: dados
        }
    );


    return requisicao({

        acao: "atualizar",

        aba: aba,

        id: dados.ID,

        dados:
            JSON.stringify(
                dados
            )

    });

}


// ============================================================
// EXCLUIR
// ============================================================

export async function excluir(
    aba,
    id
) {

    validarAba(
        aba
    );


    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            "CRUD Service: ID não informado para exclusão."
        );

    }


    console.log(
        "CRUD SERVICE → EXCLUIR:",
        {
            aba: aba,
            id: id
        }
    );


    return requisicao({

        acao: "excluir",

        aba: aba,

        id: id

    });

}


// ============================================================
// VALIDAR ABA
// ============================================================

function validarAba(
    aba
) {

    if (
        !aba ||
        typeof aba !== "string"
    ) {

        throw new Error(
            "CRUD Service: nome da entidade/aba não informado."
        );

    }

}


// ============================================================
// VALIDAR DADOS
// ============================================================

function validarDados(
    dados
) {

    if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(
            dados
        )
    ) {

        throw new Error(
            "CRUD Service: dados inválidos."
        );

    }

}
