/**
 * ============================================================
 * MODULE
 * Painel Frota
 * Arquivo: module.js
 *
 * Responsabilidade:
 *
 * - Criar o módulo completo
 * - Localizar o container
 * - Criar estrutura HTML base
 * - Criar State
 * - Criar Engine
 * - Criar Toolbar
 * - Criar Form
 * - Criar Table
 * - Conectar os componentes
 *
 * NÃO conhece:
 *
 * - PostgreSQL
 * - Supabase
 * - Google Sheets
 * - Regras específicas de VEÍCULOS
 * - Regras específicas de EMPREGADOS
 * - Regras específicas de LANÇAMENTOS
 *
 * ============================================================
 */


// ============================================================
// IMPORTS
// ============================================================

import {
    createEngine
} from "./engine.js";


import {
    createState
} from "./state.js";


import {
    createForm
} from "./form.js";


import {
    createTable
} from "./table.js";


import {
    createToolbar
} from "./toolbar.js";


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
            `Module ${config.entity}: container não informado.`
        );

    }


    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    const entity =
        String(
            config.entity
        )
        .trim()
        .toLowerCase();


    const schema =
        config.schema || null;


    const options =
        config.options || {};


    const containerSelector =
        config.container;


    // ========================================================
    // LOCALIZAR CONTAINER
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
    // ESTADO
    // ========================================================

    const state =
        createState({

            entity,

            pageSize:
                options.pageSize ||
                config.pageSize ||
                10

        });


    // ========================================================
    // ESTRUTURA BASE
    // ========================================================

    renderizarEstrutura();


    // ========================================================
    // ENGINE
    // ========================================================

    /*
     * O engine é criado com:
     *
     * - entity
     * - schema
     * - container
     * - state
     * - options
     *
     * IMPORTANTE:
     *
     * engine.js NÃO deve criar novamente
     * form, table ou toolbar.
     */

    const engine =
        createEngine({

            entity,

            schema,

            container,

            state,

            options,

            autoStart: false

        });


    // ========================================================
    // TOOLBAR
    // ========================================================

    const toolbar =
        createToolbar({

            entity,

            container,

            engine,

            options

        });


    // ========================================================
    // FORM
    // ========================================================

    const form =
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

    const table =
        createTable({

            entity,

            schema,

            container,

            state,

            engine,

            options

        });


    // ========================================================
    // API PÚBLICA
    // ========================================================

    const module = {

        entity,

        schema,

        options,

        container,

        state,

        engine,

        toolbar,

        form,

        table,

        iniciar,

        recarregar,

        destruir

    };


    // ========================================================
    // CONECTAR COMPONENTES AO ENGINE
    // ========================================================

    /*
     * O Engine continua sendo responsável pelo CRUD,
     * mas delega atualização visual aos componentes.
     */

    conectarComponentes();


    // ========================================================
    // INICIALIZAÇÃO
    // ========================================================

    iniciar()
        .catch(
            erro => {

                console.error(
                    `Module ${entity}: falha na inicialização`,
                    erro
                );

            }
        );


    // ========================================================
    // INICIAR
    // ========================================================

    async function iniciar() {

        console.log(
            `MODULE → INICIAR → ${entity}`
        );


        /*
         * Iniciar componentes visuais primeiro.
         */

        toolbar.iniciar();

        form.iniciar();

        table.iniciar();


        /*
         * Depois carregar dados.
         */

        await engine.carregar();


        return module;

    }


    // ========================================================
    // RECONECTAR / RECARREGAR
    // ========================================================

    async function recarregar() {

        console.log(
            `MODULE → RECARREGAR → ${entity}`
        );


        return engine.recarregar();

    }


    // ========================================================
    // CONECTAR COMPONENTES
    // ========================================================

    function conectarComponentes() {

        /*
         * ====================================================
         * ENGINE → FORM
         * ====================================================
         */

        engine.mostrarFormulario =
            function () {

                form.mostrar();

            };


        engine.esconderFormulario =
            function () {

                form.esconder();

            };


        engine.limparFormulario =
            function () {

                form.limpar();

            };


        engine.preencherFormulario =
            function (
                registro
            ) {

                form.preencher(
                    registro
                );

            };


        /*
         * ====================================================
         * ENGINE → TABLE
         * ====================================================
         */

        engine.renderizarTabela =
            function () {

                table.renderizar();

            };


        /*
         * ====================================================
         * ATUALIZAÇÃO APÓS EVENTOS
         * ====================================================
         */

        container.addEventListener(
            "engine:carregado",
            () => {

                table.renderizar();

            }
        );


        container.addEventListener(
            "engine:salvo",
            () => {

                table.renderizar();

            }
        );


        container.addEventListener(
            "engine:excluido",
            () => {

                table.renderizar();

            }
        );

    }


    // ========================================================
    // ESTRUTURA BASE
    // ========================================================

    function renderizarEstrutura() {

        /*
         * IMPORTANTE:
         *
         * O module é dono da estrutura principal.
         *
         * Cada componente preenche apenas sua área.
         */

        container.innerHTML = `

            <section
                class="engine"
                data-engine-module="${escaparAtributo(
                    entity
                )}"
            >

                <!-- ==========================================
                     TOOLBAR
                =========================================== -->

                <header
                    class="engine-header"
                    data-engine-toolbar-container
                >

                    <div
                        class="engine-toolbar"
                        data-engine-toolbar
                    ></div>

                </header>


                <!-- ==========================================
                     FORM
                =========================================== -->

                <section
                    class="engine-form-container"
                    data-engine-form
                    hidden
                ></section>


                <!-- ==========================================
                     LOADING
                =========================================== -->

                <div
                    class="engine-loading"
                    data-engine-loading
                    hidden
                >

                    Carregando...

                </div>


                <!-- ==========================================
                     TABLE
                =========================================== -->

                <section
                    class="engine-table-container"
                    data-engine-table-container
                >

                    <div
                        data-engine-table
                    ></div>

                </section>

            </section>

        `;

    }


    // ========================================================
    // ESCAPAR ATRIBUTO
    // ========================================================

    function escaparAtributo(
        valor
    ) {

        return String(
            valor ?? ""
        )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

    }


    // ========================================================
    // DESTRUIR
    // ========================================================

    function destruir() {

        console.log(
            `MODULE → DESTRUIR → ${entity}`
        );


        /*
         * Destruir componentes.
         */

        if (
            toolbar &&
            typeof toolbar.destruir === "function"
        ) {

            toolbar.destruir();

        }


        if (
            form &&
            typeof form.destruir === "function"
        ) {

            form.destruir();

        }


        if (
            table &&
            typeof table.destruir === "function"
        ) {

            table.destruir();

        }


        /*
         * Limpar HTML.
         */

        container.innerHTML =
            "";

    }


    // ========================================================
    // RETORNAR MODULE
    // ========================================================

    return module;

}
