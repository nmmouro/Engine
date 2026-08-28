```javascript
// ============================================================================
// CONFIG
// Painel Frota
// Arquivo: js/config/config.js
//
// Configurações gerais do Frontend / Engine
// PostgreSQL é acessado exclusivamente através da API REST.
// ============================================================================


export const CONFIG = {

    // =========================================================================
    // API
    // =========================================================================

    api: {

        // URL base da API Node.js
        //
        // Desenvolvimento:
        // http://localhost:3000/api
        //
        // Produção:
        // https://43E1B5F0/api

        baseUrl:
            "http://localhost:3000/api",


        // Tempo máximo de espera de uma requisição
        timeout:
            10000,


        // Configuração padrão das requisições
        headers: {

            "Content-Type":
                "application/json"

        }

    },


    // =========================================================================
    // ENGINE
    // =========================================================================

    engine: {

        // Atualização automática das tabelas
        autoRefresh:
            false,


        // Intervalo de atualização automática
        // em milissegundos

        refreshInterval:
            30000,


        // Quantidade de registros por página

        pageSize:
            20,


        // Cache no frontend

        cache: {

            enabled:
                true,

            ttl:
                30000

        }

    },


    // =========================================================================
    // INTERFACE
    // =========================================================================

    ui: {

        locale:
            "pt-BR",


        // Animações da interface

        animation:
            true,


        // Mostrar mensagens de carregamento

        loading:
            true,


        // Mostrar mensagens de sucesso/erro

        toast:
            true

    },


    // =========================================================================
    // PAGINAÇÃO
    // =========================================================================

    pagination: {

        enabled:
            true,

        pageSize:
            20,

        maxButtons:
            5

    },


    // =========================================================================
    // ENTIDADES
    // =========================================================================

    entities: {

        VEICULOS:
            "VEICULOS",

        EMPREGADOS:
            "EMPREGADOS",

        LANCAMENTOS:
            "LANCAMENTOS",

        ABASTECIMENTOS:
            "ABASTECIMENTOS",

        MANUTENCOES:
            "MANUTENCOES"

    }

};
```
