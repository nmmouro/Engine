/**
 * ============================================================
 * CRUD SERVICE
 * Painel Frota
 * ============================================================
 *
 * Frontend
 *    ↓
 * CRUD Service
 *    ↓
 * API Node.js
 *    ↓
 * PostgreSQL
 *
 * ============================================================
 */

import { CONFIG } from "../config/config.js";


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const API_URL =
    CONFIG?.api?.url || "";


// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

function validarConfiguracao() {

    if (!API_URL) {

        throw new Error(
            "CRUD Service: CONFIG.api.url não foi configurada."
        );

    }

}


// ============================================================
// NORMALIZAR ENTIDADE
// ============================================================

function normalizarEntidade(entidade) {

    if (
        !entidade ||
        typeof entidade !== "string"
    ) {

        throw new Error(
            "CRUD Service: entidade não informada."
        );

    }

    return entidade
        .trim()
        .toLowerCase();

}


// ============================================================
// URL BASE
// ============================================================

function obterBaseUrl() {

    validarConfiguracao();

    return API_URL
        .trim()
        .replace(/\/+$/, "");

}


// ============================================================
// CONSTRUIR URL
// ============================================================

function construirUrl(
    entidade,
    id = null
) {

    const baseUrl =
        obterBaseUrl();

    const nome =
        normalizarEntidade(
            entidade
        );


    let url =
        baseUrl +
        "/" +
        encodeURIComponent(
            nome
        );


    if (
        id !== null &&
        id !== undefined &&
        id !== ""
    ) {

        url +=
            "/" +
            encodeURIComponent(
                id
            );

    }


    return url;

}


// ============================================================
// VALIDAR ID
// ============================================================

function validarId(id) {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            "CRUD Service: ID não informado."
        );

    }

}


// ============================================================
// VALIDAR DADOS
// ============================================================

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


// ============================================================
// EXTRAIR MENSAGEM DE ERRO
// ============================================================

function extrairMensagemErro(
    resposta,
    status
) {

    if (
        resposta &&
        typeof resposta === "object"
    ) {

        return (
            resposta.erro ||
            resposta.error ||
            resposta.message ||
            resposta.mensagem ||
            "Erro HTTP " + status + "."
        );

    }


    if (
        typeof resposta === "string" &&
        resposta.trim()
    ) {

        return resposta;

    }


    return (
        "Erro HTTP " +
        status +
        "."
    );

}


// ============================================================
// PROCESSAR RESPOSTA
// ============================================================

async function processarResposta(
    resposta
) {

    if (!resposta) {

        throw new Error(
            "CRUD Service: resposta vazia da API."
        );

    }


    let corpo = null;


    const contentType =
        resposta.headers?.get(
            "content-type"
        ) || "";


    try {

        if (
            contentType
                .toLowerCase()
                .includes(
                    "application/json"
                )
        ) {

            corpo =
                await resposta.json();

        } else {

            const texto =
                await resposta.text();


            if (texto) {

                try {

                    corpo =
                        JSON.parse(
                            texto
                        );

                } catch {

                    corpo =
                        texto;

                }

            }

        }

    } catch (erro) {

        console.error(
            "CRUD SERVICE: erro ao interpretar resposta.",
            erro
        );


        throw new Error(
            "Resposta inválida da API. HTTP " +
            resposta.status +
            "."
        );

    }


    console.log(
        "CRUD SERVICE: resposta HTTP",
        resposta.status,
        corpo
    );


    if (!resposta.ok) {

        throw new Error(
            extrairMensagemErro(
                corpo,
                resposta.status
            )
        );

    }


    return corpo;

}


// ============================================================
// VERIFICAR RESPOSTA DA API
// ============================================================

function verificarResposta(
    resposta
) {

    if (
        resposta &&
        typeof resposta === "object"
    ) {

        if (
            resposta.sucesso === false
        ) {

            throw new Error(
                extrairMensagemErro(
                    resposta,
                    400
                )
            );

        }


        if (
            resposta.success === false
        ) {

            throw new Error(
                extrairMensagemErro(
                    resposta,
                    400
                )
            );

        }

    }


    return resposta;

}


// ============================================================
// EXTRAIR DADOS
// ============================================================

function extrairDados(
    resposta
) {

    if (
        resposta === null ||
        resposta === undefined
    ) {

        return null;

    }


    if (
        resposta &&
        typeof resposta === "object" &&
        resposta.dados !== undefined
    ) {

        return resposta.dados;

    }


    if (
        resposta &&
        typeof resposta === "object" &&
        resposta.data !== undefined
    ) {

        return resposta.data;

    }


    if (
        resposta &&
        typeof resposta === "object" &&
        resposta.result !== undefined
    ) {

        return resposta.result;

    }


    return resposta;

}


// ============================================================
// REQUISIÇÃO HTTP
// ============================================================

async function requisicao(
    url,
    opcoes = {}
) {

    console.log(
        "CRUD SERVICE: ",
        opcoes.method || "GET",
        url
    );


    let resposta;


    try {

        resposta =
            await fetch(
                url,
                {
                    ...opcoes,

                    headers: {

                        "Accept":
                            "application/json",

                        ...(opcoes.body
                            ? {
                                "Content-Type":
                                    "application/json"
                            }
                            : {}),

                        ...(opcoes.headers || {})

                    },

                    cache:
                        "no-store"

                }
            );

    } catch (erro) {

        console.error(
            "CRUD SERVICE: erro de conexão.",
            erro
        );


        throw new Error(
            "Não foi possível conectar à API Node.js."
        );

    }


    return processarResposta(
        resposta
    );

}


// ============================================================
// GET
// ============================================================

async function get(
    entidade,
    id = null
) {

    const url =
        construirUrl(
            entidade,
            id
        );


    return requisicao(
        url,
        {
            method: "GET"
        }
    );

}


// ============================================================
// POST
// ============================================================

async function post(
    entidade,
    dados
) {

    validarDados(
        dados
    );


    const url =
        construirUrl(
            entidade
        );


    return requisicao(
        url,
        {

            method: "POST",

            body:
                JSON.stringify(
                    dados
                )

        }
    );

}


// ============================================================
// PUT
// ============================================================

async function put(
    entidade,
    id,
    dados
) {

    validarId(
        id
    );


    validarDados(
        dados
    );


    const url =
        construirUrl(
            entidade,
            id
        );


    return requisicao(
        url,
        {

            method: "PUT",

            body:
                JSON.stringify(
                    dados
                )

        }
    );

}


// ============================================================
// DELETE
// ============================================================

async function del(
    entidade,
    id
) {

    validarId(
        id
    );


    const url =
        construirUrl(
            entidade,
            id
        );


    return requisicao(
        url,
        {
            method: "DELETE"
        }
    );

}


// ============================================================
// LISTAR
// ============================================================

export async function listar(
    entidade
) {

    const nome =
        normalizarEntidade(
            entidade
        );


    console.log(
        "CRUD SERVICE: LISTAR",
        nome
    );


    const resposta =
        verificarResposta(
            await get(
                nome
            )
        );


    const dados =
        extrairDados(
            resposta
        );


    if (
        Array.isArray(
            dados
        )
    ) {

        return dados;

    }


    if (
        dados &&
        typeof dados === "object" &&
        Array.isArray(
            dados.registros
        )
    ) {

        return dados.registros;

    }


    return [];

}


// ============================================================
// OBTER
// ============================================================

export async function obter(
    entidade,
    id
) {

    validarId(
        id
    );


    const nome =
        normalizarEntidade(
            entidade
        );


    console.log(
        "CRUD SERVICE: OBTER",
        nome,
        id
    );


    const resposta =
        verificarResposta(
            await get(
                nome,
                id
            )
        );


    return extrairDados(
        resposta
    );

}


// ============================================================
// CRIAR
// ============================================================

export async function criar(
    entidade,
    dados
) {

    const nome =
        normalizarEntidade(
            entidade
        );


    validarDados(
        dados
    );


    console.log(
        "CRUD SERVICE: CRIAR",
        nome,
        dados
    );


    const resposta =
        verificarResposta(
            await post(
                nome,
                dados
            )
        );


    return extrairDados(
        resposta
    );

}


// ============================================================
// SALVAR
// ============================================================
//
// Compatibilidade.
//
// salvar() continua funcionando como alias de criar().
//
// ============================================================

export async function salvar(
    entidade,
    dados
) {

    return criar(
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

    const nome =
        normalizarEntidade(
            entidade
        );


    validarDados(
        dados
    );


    const id =
        dados.ID ??
        dados.id;


    validarId(
        id
    );


    console.log(
        "CRUD SERVICE: ATUALIZAR",
        nome,
        id,
        dados
    );


    const resposta =
        verificarResposta(
            await put(
                nome,
                id,
                dados
            )
        );


    return extrairDados(
        resposta
    );

}


// ============================================================
// EXCLUIR
// ============================================================

export async function excluir(
    entidade,
    id
) {

    const nome =
        normalizarEntidade(
            entidade
        );


    validarId(
        id
    );


    console.log(
        "CRUD SERVICE: EXCLUIR",
        nome,
        id
    );


    const resposta =
        verificarResposta(
            await del(
                nome,
                id
            )
        );


    return extrairDados(
        resposta
    );

}


// ============================================================
// EXPORTAÇÃO DEFAULT
// ============================================================

export default {

    listar,
    obter,
    criar,
    salvar,
    atualizar,
    excluir

};
