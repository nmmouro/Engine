```javascript
/**
 * ============================================================
 * STATE
 * Painel Frota
 *
 * Arquivo:
 * js/engine/state.js
 *
 * Responsabilidade:
 *
 * Manter o estado de cada módulo do Engine em memória.
 *
 * O State NÃO acessa:
 *
 * - Supabase
 * - API
 * - DOM
 * - Formulário
 * - Tabela
 *
 * Ele apenas mantém os dados do módulo.
 *
 * ============================================================
 */


// ============================================================
// CRIAR STATE
// ============================================================

export function createState(
    name,
    options = {}
) {

    // ----------------------------------------------------------
    // VALIDAR NOME
    // ----------------------------------------------------------

    if (!name) {

        throw new Error(
            "State: nome não informado."
        );

    }


    // ----------------------------------------------------------
    // CONFIGURAÇÕES
    // ----------------------------------------------------------

    const pageSize =
        Number(
            options.pageSize
        ) > 0

            ? Number(
                options.pageSize
            )

            : 20;


    // ----------------------------------------------------------
    // ESTADO
    // ----------------------------------------------------------

    const state = {

        // ------------------------------------------------------
        // IDENTIFICAÇÃO
        // ------------------------------------------------------

        name,

        entity:
            options.entity ||
            "",


        // ------------------------------------------------------
        // REGISTROS
        // ------------------------------------------------------

        registros: [],

        totalRegistros: 0,


        // ------------------------------------------------------
        // REGISTRO EM EDIÇÃO
        // ------------------------------------------------------

        registroEditando: null,

        modo:
            "lista",


        // ------------------------------------------------------
        // CARREGAMENTO
        // ------------------------------------------------------

        carregando: false,

        carregado: false,

        erro: null,


        // ------------------------------------------------------
        // FILTRO
        // ------------------------------------------------------

        filtro: "",

        filtros: {},


        // ------------------------------------------------------
        // PAGINAÇÃO
        // ------------------------------------------------------

        paginaAtual: 1,

        pageSize,

        totalPaginas: 1,


        // ------------------------------------------------------
        // ORDENAÇÃO
        // ------------------------------------------------------

        ordenarPor: null,

        ordenarDirecao:
            "asc",


        // ------------------------------------------------------
        // CACHE
        // ------------------------------------------------------

        cacheValido: false,

        ultimaAtualizacao:
            null,


        // ------------------------------------------------------
        // CONTROLE DE ALTERAÇÃO
        // ------------------------------------------------------

        alterado: false,


        // ------------------------------------------------------
        // CONTROLE DE INICIALIZAÇÃO
        // ------------------------------------------------------

        inicializado: false

    };


    return state;

}


// ============================================================
// RESETAR STATE
// ============================================================

export function resetState(
    state
) {

    if (!state) {

        return;

    }


    state.registros = [];

    state.totalRegistros = 0;

    state.registroEditando =
        null;

    state.modo =
        "lista";

    state.carregando =
        false;

    state.carregado =
        false;

    state.erro =
        null;

    state.filtro =
        "";

    state.filtros =
        {};

    state.paginaAtual =
        1;

    state.totalPaginas =
        1;

    state.ordenarPor =
        null;

    state.ordenarDirecao =
        "asc";

    state.cacheValido =
        false;

    state.ultimaAtualizacao =
        null;

    state.alterado =
        false;

}


// ============================================================
// DEFINIR REGISTROS
// ============================================================

export function definirRegistros(
    state,
    registros
) {

    if (!state) {

        throw new Error(
            "State: estado não informado."
        );

    }


    state.registros =
        Array.isArray(registros)

            ? registros

            : [];


    state.totalRegistros =
        state.registros.length;


    state.totalPaginas =
        Math.max(

            1,

            Math.ceil(

                state.totalRegistros /
                state.pageSize

            )

        );


    if (
        state.paginaAtual >
        state.totalPaginas
    ) {

        state.paginaAtual =
            state.totalPaginas;

    }


    state.cacheValido =
        true;

    state.carregado =
        true;

    state.erro =
        null;

    state.ultimaAtualizacao =
        Date.now();

}


// ============================================================
// ADICIONAR REGISTRO
// ============================================================

export function adicionarRegistro(
    state,
    registro
) {

    if (!state || !registro) {

        return;

    }


    state.registros.push(
        registro
    );


    atualizarTotais(
        state
    );


    state.alterado =
        true;

}


// ============================================================
// ATUALIZAR REGISTRO
// ============================================================

export function atualizarRegistro(
    state,
    registro
) {

    if (
        !state ||
        !registro
    ) {

        return false;

    }


    const id =
        registro.ID;


    if (!id) {

        return false;

    }


    const indice =
        state.registros.findIndex(

            item =>
                String(
                    item.ID
                ) === String(id)

        );


    if (indice === -1) {

        return false;

    }


    state.registros[indice] =
        registro;


    atualizarTotais(
        state
    );


    state.alterado =
        true;


    return true;

}


// ============================================================
// REMOVER REGISTRO
// ============================================================

export function removerRegistro(
    state,
    id
) {

    if (
        !state ||
        !id
    ) {

        return false;

    }


    const tamanhoAnterior =
        state.registros.length;


    state.registros =
        state.registros.filter(

            registro =>
                String(
                    registro.ID
                ) !== String(id)

        );


    if (
        state.registros.length ===
        tamanhoAnterior
    ) {

        return false;

    }


    atualizarTotais(
        state
    );


    state.alterado =
        true;


    return true;

}


// ============================================================
// OBTER REGISTRO
// ============================================================

export function obterRegistro(
    state,
    id
) {

    if (
        !state ||
        !id
    ) {

        return null;

    }


    return (

        state.registros.find(

            registro =>
                String(
                    registro.ID
                ) === String(id)

        ) ||

        null

    );

}


// ============================================================
// DEFINIR REGISTRO EM EDIÇÃO
// ============================================================

export function definirRegistroEditando(
    state,
    registro
) {

    if (!state) {

        return;

    }


    state.registroEditando =
        registro || null;


    state.modo =
        registro
            ? "edicao"
            : "lista";

}


// ============================================================
// LIMPAR EDIÇÃO
// ============================================================

export function limparEdicao(
    state
) {

    if (!state) {

        return;

    }


    state.registroEditando =
        null;

    state.modo =
        "lista";

}


// ============================================================
// DEFINIR CARREGAMENTO
// ============================================================

export function definirCarregando(
    state,
    valor
) {

    if (!state) {

        return;

    }


    state.carregando =
        Boolean(valor);

}


// ============================================================
// DEFINIR ERRO
// ============================================================

export function definirErro(
    state,
    erro
) {

    if (!state) {

        return;

    }


    state.erro =
        erro
            ? String(
                erro.message ||
                erro
            )
            : null;


    state.carregando =
        false;

}


// ============================================================
// DEFINIR FILTRO
// ============================================================

export function definirFiltro(
    state,
    filtro
) {

    if (!state) {

        return;

    }


    state.filtro =
        String(
            filtro || ""
        );


    state.paginaAtual =
        1;

}


// ============================================================
// DEFINIR FILTROS
// ============================================================

export function definirFiltros(
    state,
    filtros
) {

    if (!state) {

        return;

    }


    state.filtros =
        filtros &&
        typeof filtros === "object"

            ? {
                ...filtros
            }

            : {};


    state.paginaAtual =
        1;

}


// ============================================================
// DEFINIR PÁGINA
// ============================================================

export function definirPagina(
    state,
    pagina
) {

    if (!state) {

        return;

    }


    const novaPagina =
        Number(pagina);


    if (
        !Number.isFinite(
            novaPagina
        )
    ) {

        return;

    }


    state.paginaAtual =
        Math.min(

            Math.max(
                1,
                Math.floor(
                    novaPagina
                )
            ),

            state.totalPaginas

        );

}


// ============================================================
// DEFINIR TAMANHO DA PÁGINA
// ============================================================

export function definirPageSize(
    state,
    tamanho
) {

    if (!state) {

        return;

    }


    const novoTamanho =
        Number(tamanho);


    if (
        !Number.isFinite(
            novoTamanho
        ) ||
        novoTamanho <= 0
    ) {

        return;

    }


    state.pageSize =
        Math.floor(
            novoTamanho
        );


    atualizarTotais(
        state
    );

}


// ============================================================
// DEFINIR ORDENAÇÃO
// ============================================================

export function definirOrdenacao(
    state,
    campo
) {

    if (!state || !campo) {

        return;

    }


    if (
        state.ordenarPor ===
        campo
    ) {

        state.ordenarDirecao =
            state.ordenarDirecao ===
            "asc"

                ? "desc"

                : "asc";

    }

    else {

        state.ordenarPor =
            campo;

        state.ordenarDirecao =
            "asc";

    }

}


// ============================================================
// MARCAR CACHE COMO INVÁLIDO
// ============================================================

export function invalidarCache(
    state
) {

    if (!state) {

        return;

    }


    state.cacheValido =
        false;

}


// ============================================================
// MARCAR CACHE COMO VÁLIDO
// ============================================================

export function validarCache(
    state
) {

    if (!state) {

        return;

    }


    state.cacheValido =
        true;

    state.ultimaAtualizacao =
        Date.now();

}


// ============================================================
// VERIFICAR CACHE
// ============================================================

export function cacheValido(
    state,
    maxAge = 30000
) {

    if (
        !state ||
        !state.cacheValido
    ) {

        return false;

    }


    if (
        !state.ultimaAtualizacao
    ) {

        return false;

    }


    return (
        Date.now() -
        state.ultimaAtualizacao
    ) < maxAge;

}


// ============================================================
// MARCAR ALTERADO
// ============================================================

export function marcarAlterado(
    state,
    valor = true
) {

    if (!state) {

        return;

    }


    state.alterado =
        Boolean(valor);

}


// ============================================================
// ATUALIZAR TOTAIS
// ============================================================

function atualizarTotais(
    state
) {

    state.totalRegistros =
        state.registros.length;


    state.totalPaginas =
        Math.max(

            1,

            Math.ceil(

                state.totalRegistros /
                state.pageSize

            )

        );


    if (
        state.paginaAtual >
        state.totalPaginas
    ) {

        state.paginaAtual =
            state.totalPaginas;

    }

}


// ============================================================
// OBTER PÁGINA ATUAL
// ============================================================

export function obterPaginaAtual(
    state,
    registros = null
) {

    if (!state) {

        return [];

    }


    const lista =
        Array.isArray(registros)

            ? registros

            : state.registros;


    const inicio =
        (
            state.paginaAtual -
            1
        ) *
        state.pageSize;


    return lista.slice(

        inicio,

        inicio +
        state.pageSize

    );

}


// ============================================================
// OBTER SNAPSHOT
// ============================================================
//
// Retorna uma cópia do estado.
// Útil para diagnóstico e debug.
// ============================================================

export function obterSnapshot(
    state
) {

    if (!state) {

        return null;

    }


    return {

        ...state,

        registros:
            Array.isArray(
                state.registros
            )

                ? [
                    ...state.registros
                ]

                : []

    };

}


// ============================================================
// EXPORTAÇÃO AUXILIAR
// ============================================================

export default {

    createState,

    resetState,

    definirRegistros,

    adicionarRegistro,

    atualizarRegistro,

    removerRegistro,

    obterRegistro,

    definirRegistroEditando,

    limparEdicao,

    definirCarregando,

    definirErro,

    definirFiltro,

    definirFiltros,

    definirPagina,

    definirPageSize,

    definirOrdenacao,

    invalidarCache,

    validarCache,

    cacheValido,

    marcarAlterado,

    obterPaginaAtual,

    obterSnapshot

};
```

