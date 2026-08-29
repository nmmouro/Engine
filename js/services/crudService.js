```javascript
/**
 * ============================================================
 * CRUD SERVICE
 * Painel Frota
 * ============================================================
 *
 * Arquivo:
 *
 *     js/services/crudService.js
 *
 * Arquitetura:
 *
 *     Página
 *        ↓
 *     Engine
 *        ↓
 *     CRUD Service
 *        ↓
 *     API Node.js
 *        ↓
 *     PostgreSQL
 *
 * ============================================================
 *
 * RESPONSABILIDADE
 * ============================================================
 *
 * Este arquivo é responsável SOMENTE pela comunicação HTTP
 * entre o frontend e a API Node.js.
 *
 * O Service NÃO conhece:
 *
 * - HTML
 * - formulários
 * - tabelas
 * - componentes visuais
 * - Engine
 * - PostgreSQL diretamente
 *
 * O Service trabalha somente com:
 *
 *     entidade
 *     id
 *     dados
 *     respostas HTTP
 *
 * ============================================================
 *
 * MÉTODOS PÚBLICOS
 * ============================================================
 *
 *     listar("VEICULOS")
 *     obter("VEICULOS", id)
 *     criar("VEICULOS", dados)
 *     atualizar("VEICULOS", dados)
 *     excluir("VEICULOS", id)
 *
 * Compatibilidade:
 *
 *     salvar("VEICULOS", dados)
 *
 * é um alias de:
 *
 *     criar("VEICULOS", dados)
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
// VALIDAR CONFIGURAÇÃO
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
// NORMALIZAR URL
// ============================================================

function normalizarBaseUrl(url) {

    return url
        .trim()
        .replace(/\/+$/, "");

}


// ============================================================
// URL BASE
// ============================================================

function obterBaseUrl() {

    validarConfiguracao();

    return normalizarBaseUrl(API_URL);

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
        normalizarEntidade(entidade);

    let url =
        `${baseUrl}/${encodeURIComponent(nome)}`;

    if (
        id !== null &&
        id !== undefined &&
        id !== ""
    ) {

        url +=
            `/${encodeURIComponent(id)}`;

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
// REQUISIÇÃO HTTP
// ============================================================

async function requisicao(
    url,
    opcoes = {}
) {

    console.log(
        "CRUD SERVICE → REQUEST:",
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
            "CRUD SERVICE → erro de conexão:",
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
// PROCESSAR RESPOSTA HTTP
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


    /*
     * Algumas respostas da API podem não possuir conteúdo,
     * principalmente DELETE.
     */

    const contentType =
        resposta.headers
            ?.get("content-type") || "";


    try {

        if (
            contentType
                .toLowerCase()
                .includes("application/json")
        ) {

            corpo =
                await resposta.json();

        } else {

            const texto =
                await resposta.text();


            if (texto) {

                try {

                    corpo =
                        JSON.parse(texto);

                } catch {

                    corpo =
                        texto;

                }

            }

        }

    } catch (erro) {

        console.error(
            "CRUD SERVICE → erro ao interpretar resposta:",
            erro
        );

        throw new Error(
            `Resposta inválida da API. HTTP ${resposta.status}.`
        );

    }


    console.log(
        "CRUD SERVICE → RESPONSE:",
        resposta.status,
        corpo
    );


    // --------------------------------------------------------
    // ERRO HTTP
    // --------------------------------------------------------

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
            `Erro HTTP ${status}.`
        );

    }


    if (
        typeof resposta === "string" &&
        resposta.trim()
    ) {

        return resposta;

    }


    return `Erro HTTP ${status}.`;

}


// ============================================================
// EXTRAIR DADOS DA RESPOSTA
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


    /*
     * API:
     *
     * {
     *     sucesso: true,
     *     dados: [...]
     * }
     */

    if (
        resposta &&
        typeof resposta === "object" &&
        resposta.dados !== undefined
    ) {

        return resposta.dados;

    }


    /*
     * API:
     *
     * {
     *     success: true,
     *     data: [...]
     * }
     */

    if (
        resposta &&
        typeof resposta === "object" &&
        resposta.data !== undefined
    ) {

        return resposta.data;

    }


    /*
     * API:
     *
     * {
     *     result: [...]
     * }
     */

    if (
        resposta &&
        typeof resposta === "object" &&
        resposta.result !== undefined
    ) {

        return resposta.result;

    }


    /*
     * API pode retornar diretamente:
     *
     * [...]
     *
     * ou:
     *
     * {...}
     */

    return resposta;

}


// ============================================================
// VERIFICAR RESPOSTA DA API
// ============================================================

function verificarResposta(
    resposta
) {

    if (
        resposta &&
        typeof resposta === "object" &&
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
        resposta &&
        typeof resposta === "object" &&
        resposta.success === false
    ) {

        throw new Error(
            extrairMensagemErro(
                resposta,
                400
            )
        );

    }


    return resposta;

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
        `CRUD SERVICE → LISTAR ${nome}`
    );


    const resposta =
        verificarResposta(
            await get(nome)
        );


    const dados =
        extrairDados(
            resposta
        );


    /*
     * listar() sempre devolve Array.
     */

    if (
        Array.isArray(dados)
    ) {

        return dados;

    }


    /*
     * Algumas APIs retornam:
     *
     * {
     *     data: {
     *         registros: [...]
     *     }
     * }
     */

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
        `CRUD SERVICE → OBTER ${nome}:`,
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
        `CRUD SERVICE → CRIAR ${nome}:`,
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
// Compatibilidade com versões anteriores.
//
// salvar() continua existindo para que páginas antigas
// do Painel Frota não quebrem.
//
// Neste padrão:
//
//     salvar() = criar()
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
        `CRUD SERVICE → ATUALIZAR ${nome}:`,
        id,
        dados
    );


    /*
     * O ID é utilizado na URL.
     *
     * O objeto completo continua sendo enviado
     * no corpo da requisição.
     */

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
        `CRUD SERVICE → EXCLUIR ${nome}:`,
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
```
