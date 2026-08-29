```javascript
/**
 * ============================================================
 * MODULE
 * Painel Frota
 * Arquivo: module.js
 *
 * Responsabilidade:
 *
 * - Criar módulos da aplicação
 * - Integrar Engine
 * - Integrar Schema
 * - Integrar State
 * - Integrar Form
 * - Integrar Table
 * - Integrar Toolbar
 *
 * Este arquivo NÃO conhece:
 *
 * - PostgreSQL
 * - Supabase
 * - Google Sheets
 * - URLs da API
 *
 * ============================================================
 */

import { createEngine } from "./engine.js";
import { createState } from "./state.js";
import { createForm } from "./form.js";
import { createTable } from "./table.js";
import { createToolbar } from "./toolbar.js";


// ============================================================
// CREATE MODULE
// ============================================================

export function createModule(config = {}) {

    // ========================================================
    // VALIDAR CONFIGURAÇÃO
    // ========================================================

    if (!config.entity) {

        throw new Error(
            "Module: entidade não informada."
        );

    }


    if (!config.container) {

        throw new Error(
            "Module: container não informado."
        );

    }


    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    const entity =
        config.entity;

    const schema =
        config.schema || null;

    const containerSelector =
        config.container;

    const options =
        config.options || {};


    // ========================================================
    // CONTAINER
    // ========================================================

    const container =
        typeof containerSelector === "string"

            ? document.querySelector(
                containerSelector
            )

            : containerSelector;


    if (!container) {

        throw new Error(
            `Module ${entity}: container "${containerSelector}" não encontrado.`
        );

    }


    // ========================================================
    // STATE
    // ========================================================

    const state =
        createState({
            pageSize:
                options.pageSize
        });


    // ========================================================
    // MÓDULO
    // ========================================================

    const module = {

        entity,

        schema,

        options,

        container,

        state,

        engine: null,

        form: null,

        table: null,

        toolbar: null,

        iniciar,

        destruir

    };


    // ========================================================
    // ENGINE
    // ========================================================

    const engine =
        createEngine({

            entity,

            schema,

            container,

            options,

            state,

            autoStart: false

        });


    module.engine =
        engine;


    // ========================================================
    // FORM
    // ========================================================

    module.form =
        createForm({

            entity,

            schema,

            container,

            state,

            engine,

            options

        });


    // ========================================================
    // TABLE
    // ========================================================

    module.table =
        createTable({

            entity,

            schema,

            container,

            state,

            engine,

            options

        });


    // ========================================================
    // TOOLBAR
    // ========================================================

    module.toolbar =
        createToolbar({

            entity,

            schema,

            container,

            state,

            engine,

            options

        });


    // ========================================================
    // INICIAR
    // ========================================================

    async function iniciar() {

        /*
         * A ordem é importante:
         *
         * 1. Engine
         * 2. Form
         * 3. Table
         * 4. Toolbar
         * 5. Carregar dados
         */

        if (
            module.form &&
            typeof module.form.iniciar === "function"
        ) {

            module.form.iniciar();

        }


        if (
            module.table &&
            typeof module.table.iniciar === "function"
        ) {

            module.table.iniciar();

        }


        if (
            module.toolbar &&
            typeof module.toolbar.iniciar === "function"
        ) {

            module.toolbar.iniciar();

        }


        if (
            module.engine &&
            typeof module.engine.iniciar === "function"
        ) {

            await module.engine.iniciar();

        }


        return module;

    }


    // ========================================================
    // DESTRUIR
    // ========================================================

    function destruir() {

        /*
         * Remove eventos e referências
         * quando o módulo for descartado.
         */


        if (
            module.form &&
            typeof module.form.destruir === "function"
        ) {

            module.form.destruir();

        }


        if (
            module.table &&
            typeof module.table.destruir === "function"
        ) {

            module.table.destruir();

        }


        if (
            module.toolbar &&
            typeof module.toolbar.destruir === "function"
        ) {

            module.toolbar.destruir();

        }


        if (
            module.engine &&
            typeof module.engine.destruir === "function"
        ) {

            module.engine.destruir();

        }


        module.form =
            null;

        module.table =
            null;

        module.toolbar =
            null;

        module.engine =
            null;

    }


    // ========================================================
    // INICIALIZAÇÃO
    // ========================================================

    /*
     * Mantemos a inicialização automática para
     * preservar o comportamento atual dos módulos.
     *
     * Se options.autoStart === false,
     * o módulo poderá ser iniciado manualmente.
     */

    if (
        options.autoStart !== false
    ) {

        iniciar()
            .catch(
                erro => {

                    console.error(
                        `Module ${entity}: erro ao iniciar módulo`,
                        erro
                    );

                }
            );

    }


    // ========================================================
    // RETORNAR MÓDULO
    // ========================================================

    return module;

}
```
