import { CONFIG } from "../config/config.js";

async function requisicao(params = {}) {

    const url = new URL(CONFIG.api.url);

    Object.entries(params).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null) {
            url.searchParams.set(chave, valor);
        }
    });

    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(
            `Erro HTTP ${resposta.status}`
        );
    }

    const json = await resposta.json();

    if (json.sucesso === false) {
        throw new Error(
            json.erro ||
            json.message ||
            "Erro na API."
        );
    }

    return json;
}


function extrairDados(resposta) {

    /*
     * Sua API atualmente retorna:
     *
     * {
     *   sucesso: true,
     *   dados: {
     *      sucesso: true,
     *      dados: [...]
     *   }
     * }
     *
     * O Engine normaliza isso aqui.
     */

    if (Array.isArray(resposta?.dados)) {
        return resposta.dados;
    }

    if (Array.isArray(resposta?.dados?.dados)) {
        return resposta.dados.dados;
    }

    return [];
}


export async function listar(entity) {

    const resposta = await requisicao({
        acao: "listar",
        aba: entity
    });

    return extrairDados(resposta);
}


export async function obter(entity, id) {

    const resposta = await requisicao({
        acao: "obter",
        aba: entity,
        id
    });

    return resposta?.dados?.dados ??
           resposta?.dados ??
           resposta;
}


export async function criar(entity, dados) {

    return requisicao({
        acao: "criar",
        aba: entity,
        dados: JSON.stringify(dados)
    });
}


export async function atualizar(entity, dados) {

    return requisicao({
        acao: "atualizar",
        aba: entity,
        dados: JSON.stringify(dados)
    });
}


export async function excluir(entity, id) {

    return requisicao({
        acao: "excluir",
        aba: entity,
        id
    });
}
