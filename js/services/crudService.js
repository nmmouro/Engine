 /**
  * ============================================================
  * CRUD SERVICE
  * Painel Frota
  *
  * Comunicação com a API + CACHE DE LEITURA
  * ============================================================
  *
  * RESPONSABILIDADES
  *
  * - listar
  * - obter
  * - criar
  * - salvar
  * - atualizar
  * - excluir
  *
  * CACHE
  *
  * - listar() utiliza cache
  * - obter() utiliza cache
  * - criar() invalida cache
  * - atualizar() invalida cache
  * - excluir() invalida cache
  *
  * As operações de escrita NÃO são armazenadas em cache.
  * ============================================================
  */

import { CONFIG } from "../config/config.js";


/* ============================================================
   CONFIGURAÇÃO DO CACHE
============================================================ */

const CACHE_TTL =
    CONFIG?.engine?.cacheTTL ??
    60000;


/*
 * Estrutura:
 *
 * cache.set("VEICULOS", {
 *     dados: [...],
 *     timestamp: 123456789
 * });
 */

const cache =
    new Map();


/* ============================================================
   REQUISIÇÃO BASE
============================================================ */

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


    console.log(
        "CRUD SERVICE → REQUISIÇÃO:",
        params
    );


    const resposta =
        await fetch(
            url.toString(),
            {
                method: "GET",
                cache: "no-store"
            }
        );


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


    console.log(
        "CRUD SERVICE → RESPOSTA:",
        json
    );


    validarResposta(json);


    return json;

}


/* ============================================================
   VALIDAR RESPOSTA
============================================================ */

function validarResposta(resposta) {

    if (!resposta) {

        throw new Error(
            "A API não retornou dados."
        );

    }


    if (
        resposta.sucesso === false
    ) {

        throw new Error(
            resposta.erro ||
            resposta.message ||
            "Erro retornado pela API."
        );

    }


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


/* ============================================================
   EXTRAIR DADOS
============================================================ */

function extrairDados(resposta) {

    /*
     * Formato:
     *
     * {
     *     sucesso: true,
     *     dados: [...]
     * }
     */

    if (
        Array.isArray(
            resposta?.dados
        )
    ) {

        return resposta.dados;

    }


    /*
     * Formato:
     *
     * {
     *     sucesso: true,
     *     dados: {
     *         sucesso: true,
     *         dados: [...]
     *     }
     * }
     */

    if (
        Array.isArray(
            resposta?.dados?.dados
        )
    ) {

        return resposta.dados.dados;

    }


    return [];

}


/* ============================================================
   CACHE — GERAR CHAVE
============================================================ */

function chaveCacheListar(aba) {

    return `listar:${aba}`;

}


function chaveCacheObter(
    aba,
    id
) {

    return `obter:${aba}:${id}`;

}


/* ============================================================
   CACHE — VERIFICAR VALIDADE
============================================================ */

function cacheValido(item) {

    if (!item) {

        return false;

    }


    return (
        Date.now() - item.timestamp <
        CACHE_TTL
    );

}


/* ============================================================
   CACHE — OBTER
============================================================ */

function obterDoCache(chave) {

    const item =
        cache.get(chave);


    if (
        !cacheValido(item)
    ) {

        cache.delete(chave);

        return null;

    }


    return item.dados;

}


/* ============================================================
   CACHE — SALVAR
============================================================ */

function salvarNoCache(
    chave,
    dados
) {

    cache.set(
        chave,
        {
            dados,
            timestamp: Date.now()
        }
    );

}


/* ============================================================
   CACHE — INVALIDAR ABA
============================================================ */

function invalidarCache(aba) {

    /*
     * Remove:
     *
     * listar:VEICULOS
     * obter:VEICULOS:VEI000001
     * obter:VEICULOS:VEI000002
     * etc.
     */

    for (
        const chave of cache.keys()
    ) {

        if (
            chave.startsWith(
                `listar:${aba}`
            ) ||
            chave.startsWith(
                `obter:${aba}:`
            )
        ) {

            cache.delete(chave);

        }

    }


    console.log(
        `CRUD SERVICE → CACHE INVALIDADO: ${aba}`
    );

}


/* ============================================================
   LIMPAR TODO O CACHE
============================================================ */

export function limparCache() {

    cache.clear();


    console.log(
        "CRUD SERVICE → CACHE COMPLETAMENTE LIMPO."
    );

}


/* ============================================================
   LISTAR
============================================================ */

export async function listar(
    aba,
    opcoes = {}
) {

    validarAba(aba);


    const forcar =
        opcoes?.forcar === true;


    const chave =
        chaveCacheListar(aba);


    /*
     * Se não forçar atualização,
     * tenta utilizar o cache.
     */

    if (!forcar) {

        const dadosCache =
            obterDoCache(chave);


        if (
            dadosCache !== null
        ) {

            console.log(
                `CRUD SERVICE → CACHE HIT: ${aba}`
            );


            return dadosCache;

        }

    }


    /*
     * Cache MISS.
     */

    console.log(
        `CRUD SERVICE → CACHE MISS: ${aba}`
    );


    const resposta =
        await requisicao({

            acao: "listar",

            aba

        });


    const dados =
        extrairDados(resposta);


    salvarNoCache(
        chave,
        dados
    );


    return dados;

}


/* ============================================================
   OBTER
============================================================ */

export async function obter(
    aba,
    id,
    opcoes = {}
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


    const forcar =
        opcoes?.forcar === true;


    const chave =
        chaveCacheObter(
            aba,
            id
        );


    /*
     * Tentar cache.
     */

    if (!forcar) {

        const dadosCache =
            obterDoCache(chave);


        if (
            dadosCache !== null
        ) {

            console.log(
                `CRUD SERVICE → CACHE HIT: ${aba}/${id}`
            );


            return dadosCache;

        }

    }


    console.log(
        `CRUD SERVICE → CACHE MISS: ${aba}/${id}`
    );


    const resposta =
        await requisicao({

            acao: "obter",

            aba,

            id

        });


    const dados =
        resposta?.dados?.dados ??
        resposta?.dados ??
        resposta;


    salvarNoCache(
        chave,
        dados
    );


    return dados;

}


/* ============================================================
   SALVAR
============================================================ */

export async function salvar(
    aba,
    dados
) {

    validarAba(aba);

    validarDados(dados);


    const resposta =
        await requisicao({

            acao: "criar",

            aba,

            dados:
                JSON.stringify(dados)

        });


    /*
     * Como a planilha mudou,
     * o cache daquela aba deixa
     * de ser confiável.
     */

    invalidarCache(aba);


    return resposta;

}


/* ============================================================
   CRIAR
============================================================ */

export async function criar(
    aba,
    dados
) {

    return salvar(
        aba,
        dados
    );

}


/* ============================================================
   ATUALIZAR
============================================================ */

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


    const resposta =
        await requisicao({

            acao: "atualizar",

            aba,

            id:
                dados.ID,

            dados:
                JSON.stringify(dados)

        });


    /*
     * Remove dados antigos.
     */

    invalidarCache(aba);


    return resposta;

}


/* ============================================================
   EXCLUIR
============================================================ */

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


    const resposta =
        await requisicao({

            acao: "excluir",

            aba,

            id

        });


    /*
     * Remove dados antigos.
     */

    invalidarCache(aba);


    return resposta;

}


/* ============================================================
   VALIDAÇÃO — ABA
============================================================ */

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


/* ============================================================
   VALIDAÇÃO — DADOS
============================================================ */

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
