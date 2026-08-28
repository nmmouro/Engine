```javascript
/**
 * ============================================================
 * CRUD SERVICE
 * Painel Frota
 *
 * Comunicação entre o Engine e a API Node.js.
 *
 * Não possui conhecimento específico de:
 * - VEICULOS
 * - EMPREGADOS
 * - LANCAMENTOS
 *
 * O nome da entidade/rota é recebido dinamicamente.
 *
 * Exemplos:
 *
 * listar("VEICULOS")
 * obter("VEICULOS", "VEI000001")
 * criar("VEICULOS", dados)
 * atualizar("VEICULOS", dados)
 * excluir("VEICULOS", "VEI000001")
 * ============================================================
 */

import { CONFIG } from "../config/config.js";


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const API_URL =
    CONFIG?.api?.url || "http://localhost:3000/api";


// ============================================================
// REQUISIÇÃO BASE
// ============================================================

async function requisicao(
    endpoint,
    opcoes = {}
) {

    const url =
        `${API_URL}${endpoint}`;


    const configuracao = {

        method:
            opcoes.method || "GET",

        headers: {

            "Content-Type":
                "application/json",

            ...(opcoes.headers || {})

        }

    };


    if (
        opcoes.body !== undefined
    ) {

        configuracao.body =
            JSON.stringify(
                opcoes.body
            );

    }


    let resposta;


    try {

        resposta =
            await fetch(
                url,
                configuracao
            );

    } catch (erro) {

        console.error(
            "CRUD SERVICE → erro de conexão:",
            erro
        );

        throw new Error(
            "Não foi possível conectar ao servidor."
        );

    }


    // ========================================================
    // TENTAR LER JSON
    // ========================================================

    let dadosResposta = null;


    try {

        dadosResposta =
            await resposta.json();

    } catch (erro) {

        throw new Error(
            `Servidor retornou uma resposta inválida. HTTP ${resposta.status}.`
        );

    }


    // ========================================================
    // ERRO HTTP
    // ========================================================

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


    // ========================================================
    // ERRO DA API
    // ========================================================

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
// NORMALIZAR ENTIDADE
// ============================================================

function normalizarEntidade(
    entidade
) {

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
    // API:
    //
    // {
    //   sucesso: true,
    //   dados: [...]
    // }
    // --------------------------------------------------------

    if (
        resposta.dados !== undefined
    ) {

        return resposta.dados;

    }


    // --------------------------------------------------------
    // API:
    //
    // {
    //   data: [...]
    // }
    // --------------------------------------------------------

    if (
        resposta.data !== undefined
    ) {

        return resposta.data;

    }


    // --------------------------------------------------------
    // API retorna diretamente o objeto/array
    // --------------------------------------------------------

    return resposta;

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
        `CRUD SERVICE → LISTAR ${entidade}`
    );


    const resposta =
        await requisicao(
            `/${nome}`,
            {
                method: "GET"
            }
        );


    return (
        extrairDados(
            resposta
        ) || []
    );

}


// ============================================================
// OBTER
// ============================================================

export async function obter(
    entidade,
    id
) {

    const nome =
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


    const resposta =
        await requisicao(

            `/${nome}/${encodeURIComponent(id)}`,

            {
                method: "GET"
            }

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
        `CRUD SERVICE → CRIAR ${entidade}`,
        dados
    );


    const resposta =
        await requisicao(

            `/${nome}`,

            {

                method: "POST",

                body: dados

            }

        );


    return extrairDados(
        resposta
    );

}


// ============================================================
// SALVAR
// ============================================================
//
// Alias de criar().
//
// Mantido para compatibilidade
// com partes existentes do Engine.
//

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


    if (
        !dados.ID
    ) {

        throw new Error(
            "CRUD Service: ID obrigatório para atualização."
        );

    }


    console.log(
        `CRUD SERVICE → ATUALIZAR ${entidade}`,
        dados
    );


    const resposta =
        await requisicao(

            `/${nome}/${encodeURIComponent(dados.ID)}`,

            {

                method: "PUT",

                body: dados

            }

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
        `CRUD SERVICE → EXCLUIR ${entidade}:`,
        id
    );


    const resposta =
        await requisicao(

            `/${nome}/${encodeURIComponent(id)}`,

            {

                method: "DELETE"

            }

        );


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
// EXPORTAÇÃO
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
