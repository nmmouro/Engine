```javascript
/**
 * ============================================================
 * CRUD SERVICE
 * Painel Frota
 *
 * Arquivo:
 *
 *     js/services/crudService.js
 *
 * ============================================================
 *
 * RESPONSABILIDADE
 * ============================================================
 *
 * Fazer a comunicação entre:
 *
 *     Engine
 *        ↓
 *     CRUD Service
 *        ↓
 *     Google Apps Script
 *        ↓
 *     Router
 *        ↓
 *     Google Sheets
 *
 *
 * O Service NÃO conhece detalhes das páginas.
 *
 * Exemplos:
 *
 *     listar("VEICULOS")
 *     obter("VEICULOS", "VEI000001")
 *     criar("VEICULOS", dados)
 *     atualizar("VEICULOS", dados)
 *     excluir("VEICULOS", "VEI000001")
 *
 * ============================================================
 */

import { CONFIG } from "../config/config.js";


// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

const API_URL =
    CONFIG?.api?.url || "";


// ============================================================
// VALIDAR URL DA API
// ============================================================

if (!API_URL) {

    console.error(
        "CRUD SERVICE: CONFIG.api.url não foi configurada."
    );

}


// ============================================================
// MAPA DAS ENTIDADES
// ============================================================
//
// O Engine trabalha com nomes simples:
//
//     VEICULOS
//     EMPREGADOS
//     LANCAMENTOS
//
// A planilha pode possuir nomes diferentes.
//
// Aqui fazemos a conversão.
//
// ============================================================

const MAPA_ABAS = {

    VEICULOS:
        "VEÍCULOS",

    "VEÍCULOS":
        "VEÍCULOS",

    EMPREGADOS:
        "EMPREGADOS",

    LANCAMENTOS:
        "LANCAMENTOS"

};


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


    const nome =
        entidade
            .trim()
            .toUpperCase();


    return MAPA_ABAS[nome] || nome;

}


// ============================================================
// VALIDAR CONFIGURAÇÃO
// ============================================================

function validarAPI() {

    if (!API_URL) {

        throw new Error(
            "CRUD Service: URL da API não configurada. " +
            "Verifique CONFIG.api.url."
        );

    }


    if (
        API_URL.includes("localhost")
    ) {

        throw new Error(
            "CRUD Service: CONFIG.api.url ainda aponta para localhost. " +
            "Configure a URL do Google Apps Script."
        );

    }

}


// ============================================================
// REQUISIÇÃO GET
// ============================================================

async function requisicaoGET(
    parametros = {}
) {

    validarAPI();


    const url =
        new URL(API_URL);


    Object.entries(parametros)
        .forEach(
            ([chave, valor]) => {

                if (
                    valor !== undefined &&
                    valor !== null &&
                    valor !== ""
                ) {

                    url.searchParams.set(
                        chave,
                        valor
                    );

                }

            }
        );


    console.log(
        "CRUD SERVICE → GET:",
        url.toString()
    );


    let resposta;


    try {

        resposta =
            await fetch(
                url.toString(),
                {

                    method: "GET",

                    cache: "no-store"

                }
            );

    } catch (erro) {

        console.error(
            "CRUD SERVICE → erro de conexão:",
            erro
        );


        throw new Error(
            "Não foi possível conectar ao Google Apps Script."
        );

    }


    return processarResposta(
        resposta
    );

}


// ============================================================
// REQUISIÇÃO POST
// ============================================================

async function requisicaoPOST(
    dados = {}
) {

    validarAPI();


    console.log(
        "CRUD SERVICE → POST:",
        dados
    );


    let resposta;


    try {

        resposta =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify(
                            dados
                        )

                }
            );

    } catch (erro) {

        console.error(
            "CRUD SERVICE → erro de conexão:",
            erro
        );


        throw new Error(
            "Não foi possível conectar ao Google Apps Script."
        );

    }


    return processarResposta(
        resposta
    );

}


// ============================================================
// PROCESSAR RESPOSTA
// ============================================================

async function processarResposta(
    resposta
) {

    // --------------------------------------------------------
    // HTTP
    // --------------------------------------------------------

    if (!resposta) {

        throw new Error(
            "CRUD Service: resposta vazia da API."
        );

    }


    let dadosResposta;


    try {

        dadosResposta =
            await resposta.json();

    } catch (erro) {

        console.error(
            "CRUD SERVICE → resposta não é JSON:",
            erro
        );


        throw new Error(
            `Resposta inválida do servidor. HTTP ${resposta.status}.`
        );

    }


    console.log(
        "CRUD SERVICE → RESPOSTA:",
        dadosResposta
    );


    // --------------------------------------------------------
    // ERRO HTTP
    // --------------------------------------------------------

    if (
        !resposta.ok
    ) {

        const mensagem =

            dadosResposta?.erro ||

            dadosResposta?.message ||

            dadosResposta?.mensagem ||

            `Erro HTTP ${resposta.status}.`;


        throw new Error(
            mensagem
        );

    }


    // --------------------------------------------------------
    // ERRO DA API
    // --------------------------------------------------------

    if (
        dadosResposta &&
        dadosResposta.sucesso === false
    ) {

        throw new Error(

            dadosResposta.erro ||

            dadosResposta.message ||

            dadosResposta.mensagem ||

            "Erro retornado pela API."

        );

    }


    return dadosResposta;

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


    // --------------------------------------------------------
    // { sucesso: true, dados: [...] }
    // --------------------------------------------------------

    if (
        resposta.dados !== undefined
    ) {

        return resposta.dados;

    }


    // --------------------------------------------------------
    // { sucesso: true, data: [...] }
    // --------------------------------------------------------

    if (
        resposta.data !== undefined
    ) {

        return resposta.data;

    }


    // --------------------------------------------------------
    // Resposta direta
    // --------------------------------------------------------

    return resposta;

}


// ============================================================
// LISTAR
// ============================================================

export async function listar(
    entidade
) {

    const aba =
        normalizarEntidade(
            entidade
        );


    console.log(
        `CRUD SERVICE → LISTAR ${aba}`
    );


    const resposta =
        await requisicaoGET({

            acao:
                "listar",

            aba:
                aba

        });


    const dados =
        extrairDados(
            resposta
        );


    return Array.isArray(dados)
        ? dados
        : [];

}


// ============================================================
// OBTER
// ============================================================

export async function obter(
    entidade,
    id
) {

    const aba =
        normalizarEntidade(
            entidade
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


    console.log(
        `CRUD SERVICE → OBTER ${aba}:`,
        id
    );


    const resposta =
        await requisicaoGET({

            acao:
                "obter",

            aba:
                aba,

            id:
                id

        });


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

    const aba =
        normalizarEntidade(
            entidade
        );


    validarDados(
        dados
    );


    console.log(
        `CRUD SERVICE → CRIAR ${aba}:`,
        dados
    );


    const resposta =
        await requisicaoPOST({

            acao:
                "criar",

            aba:
                aba,

            dados:
                dados

        });


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
// salvar() = criar()
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

    const aba =
        normalizarEntidade(
            entidade
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
        `CRUD SERVICE → ATUALIZAR ${aba}:`,
        dados
    );


    const resposta =
        await requisicaoPOST({

            acao:
                "atualizar",

            aba:
                aba,

            id:
                dados.ID,

            dados:
                dados

        });


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

    const aba =
        normalizarEntidade(
            entidade
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
        `CRUD SERVICE → EXCLUIR ${aba}:`,
        id
    );


    const resposta =
        await requisicaoPOST({

            acao:
                "excluir",

            aba:
                aba,

            id:
                id

        });


    return extrairDados(
        resposta
    );

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
        Array.isArray(dados)
    ) {

        throw new Error(
            "CRUD Service: dados inválidos."
        );

    }

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
