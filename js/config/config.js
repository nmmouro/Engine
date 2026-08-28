// ============================================================================
// CONFIGURAÇÃO
// Painel Frota
// Arquivo: js/config/config.js
//
// Configurações gerais do frontend.
//
// Arquitetura:
//
//   Página
//      ↓
//   Engine
//      ↓
//   CRUD Service
//      ↓
//   API / server.js
//      ↓
//   Supabase
//
// IMPORTANTE:
// Nunca coloque a SUPABASE_SERVICE_ROLE_KEY neste arquivo.
// A Service Role Key deve existir somente no backend.
// ============================================================================


// ============================================================================
// URL DA API
// ============================================================================
//
// Durante o desenvolvimento:
//
//   http://localhost:3000
//
// Em produção, substitua pela URL pública da API.
//
// Exemplo:
//
//   https://painel-frota-api.onrender.com
//
// ============================================================================

const API_URL =
    "http://localhost:3000";


// ============================================================================
// CONFIGURAÇÃO PRINCIPAL
// ============================================================================

export const CONFIG = {

    // ========================================================================
    // API
    // ========================================================================

    api: {

        // URL base do servidor
        url:
            API_URL,


        // Tempo máximo de espera das requisições
        timeout:
            15000,


        // Não utilizar cache HTTP nas operações da API
        cache:
            "no-store"

    },


    // ========================================================================
    // ENGINE
    // ========================================================================

    engine: {

        // Atualização automática
        autoRefresh:
            false,


        // Quantidade de registros por página
        pageSize:
            20,


        // Cache dos dados carregados
        cache:
            true,


        // Tempo do cache em milissegundos
        cacheTime:
            30000

    },


    // ========================================================================
    // INTERFACE
    // ========================================================================

    ui: {

        // Localização
        locale:
            "pt-BR",


        // Animações da interface
        animation:
            true,


        // Exibir loading durante operações
        loading:
            true,


        // Tempo das mensagens Toast
        toastDuration:
            3000

    },


    // ========================================================================
    // PAGINAÇÃO
    // ========================================================================

    pagination: {

        // Página inicial
        paginaInicial:
            1,


        // Quantidade padrão de registros
        porPagina:
            20

    },


    // ========================================================================
    // DEBUG
    // ========================================================================

    debug: {

        // Ativar logs no console
        enabled:
            true

    }

};


// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================


/**
 * Retorna a URL completa de um endpoint da API.
 *
 * Exemplo:
 *
 * apiUrl("/veiculos")
 *
 * retorna:
 *
 * http://localhost:3000/veiculos
 */
export function apiUrl(endpoint = "") {

    const base =
        CONFIG.api.url.replace(/\/+$/, "");


    const caminho =
        String(endpoint || "")
            .replace(/^\/+/, "");


    return caminho
        ? `${base}/${caminho}`
        : base;

}


/**
 * Retorna se o modo debug está ativo.
 */
export function isDebug() {

    return Boolean(
        CONFIG.debug.enabled
    );

}


/**
 * Log controlado do Engine.
 */
export function debugLog(...args) {

    if (
        !CONFIG.debug.enabled
    ) {

        return;

    }


    console.log(
        "[Painel Frota]",
        ...args
    );

}


// ============================================================================
// EXPORTAÇÃO PADRÃO
// ============================================================================

export default CONFIG;
