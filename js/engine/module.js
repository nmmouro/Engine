/**
 * ============================================================
 * MODULE
 * Painel Frota
 *
 * Arquivo:
 *     js/engine/module.js
 *
 * Responsabilidade:
 *
 *     Conectar:
 *
 *     - Engine
 *     - Form
 *     - Table
 *     - Toolbar
 *     - State
 *     - Schema
 *
 * Fluxo:
 *
 *     createModule()
 *          ↓
 *     createEngine()
 *          ↓
 *     createForm()
 *          ↓
 *     createTable()
 *          ↓
 *     createToolbar()
 *          ↓
 *     iniciar()
 *
 * O Module NÃO acessa PostgreSQL.
 * O Module NÃO acessa Supabase.
 *
 * A comunicação com o backend fica em:
 *
 *     crud.js
 *     crudService.js
 *
 * ============================================================
 */

import { createEngine } from "./engine.js";
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

    const options =
        config.options || {};


    // ========================================================
    // LOCALIZAR CONTAINER
    // ========================================================

    const container =
        typeof config.container === "string"

            ? document.querySelector(
                config.container
            )

            : config.container;


    if (!container) {

        throw new Error(
            `Module ${entity}: container não encontrado.`
        );

    }


    // ========================================================
    // GARANTIR ESTRUTURA DO CONTAINER
    // ========================================================

    prepararEstrutura();


    // ========================================================
    // CRIAR ENGINE PRIMEIRO
    //
    // IMPORTANTE:
    //
    // Form, Table e Toolbar dependem do Engine.
    //
    // Portanto o Engine precisa existir antes.
    // ========================================================

    const engine =
        createEngine({

            entity,

            schema,

            container,

            options

        });


    // ========================================================
    // CRIAR FORM
    // ========================================================

    const form =
        createForm({

            engine,

            schema,

            container,

            options

        });


    // ========================================================
    // CRIAR TABLE
    // ========================================================

    const table =
        createTable({

            engine,

            schema,

            container,

            options

        });


    // ========================================================
    // CRIAR TOOLBAR
    // ========================================================

    const toolbar =
        createToolbar({

            engine,

            schema,

            container,

            options

        });


    // ========================================================
    // CONECTAR COMPONENTES AO ENGINE
    // ========================================================

    engine.form =
        form;

    engine.table =
        table;

    engine.toolbar =
        toolbar;


    // ========================================================
    // API DO MODULE
    // ========================================================

    const module = {

        entity,

        schema,

        options,

        container,

        engine,

        form,

        table,

        toolbar,


        // ====================================================
        // INICIAR
        // ====================================================

        async iniciar() {

            console.log(
                `MODULE → INICIAR → ${entity}`
            );


            // -----------------------------------------------
            // FORM
            // -----------------------------------------------

            if (
                form &&
                typeof form.iniciar === "function"
            ) {

                await form.iniciar();

            }


            // -----------------------------------------------
            // TABLE
            // -----------------------------------------------

            if (
                table &&
                typeof table.iniciar === "function"
            ) {

                await table.iniciar();

            }


            // -----------------------------------------------
            // TOOLBAR
            // -----------------------------------------------

            if (
                toolbar &&
                typeof toolbar.iniciar === "function"
            ) {

                await toolbar.iniciar();

            }


            // -----------------------------------------------
            // ENGINE
            // -----------------------------------------------

            if (
                engine &&
                typeof engine.iniciar === "function"
            ) {

                await engine.iniciar();

            }


            console.log(
                `MODULE → INICIADO → ${entity}`
            );


            return module;

        },


        // ====================================================
        // DELEGAR MÉTODOS
        // ====================================================

        carregar() {

            return engine.carregar();

        },


        recarregar() {

            return engine.recarregar();

        },


        novo() {

            return engine.novo();

        },


        editar(id) {

            return engine.editar(id);

        },


        salvar(dados) {

            return engine.salvar(dados);

        },


        excluir(id) {

            return engine.excluir(id);

        },


        filtrar(valor) {

            return engine.filtrar(valor);

        },


        pagina(numero) {

            return engine.pagina(numero);

        },


        fecharFormulario() {

            return engine.fecharFormulario();

        },


        action(nome, registro) {

            return engine.action(
                nome,
                registro
            );

        }

    };


    // ========================================================
    // EXPOR NO CONTAINER
    // ========================================================

    container.__module =
        module;


    // ========================================================
    // INICIAR
    //
    // NÃO inicializar automaticamente aqui.
    //
    // A página controla o fluxo.
    // ========================================================

    module.iniciar()
        .catch(
            erro => {

                console.error(
                    `Module ${entity}: falha na inicialização`,
                    erro
                );

            }
        );


    return module;

}


// ============================================================
// PREPARAR ESTRUTURA
// ============================================================

function prepararEstrutura() {

    // --------------------------------------------------------
    // FORM
    // --------------------------------------------------------

    if (
        !document.querySelector(
            "[data-engine-form]"
        )
    ) {

        const formContainer =
            document.createElement("div");

        formContainer.setAttribute(
            "data-engine-form",
            ""
        );

        formContainer.className =
            "engine-form-container";

        document.querySelector(
            "#app"
        )?.appendChild(
            formContainer
        );

    }


    // --------------------------------------------------------
    // TABLE
    // --------------------------------------------------------

    if (
        !document.querySelector(
            "[data-engine-table]"
        )
    ) {

        const tableContainer =
            document.createElement("div");

        tableContainer.setAttribute(
            "data-engine-table",
            ""
        );

        tableContainer.className =
            "engine-table-container";

        document.querySelector(
            "#app"
        )?.appendChild(
            tableContainer
        );

    }


    // --------------------------------------------------------
    // TOOLBAR
    // --------------------------------------------------------

    if (
        !document.querySelector(
            "[data-engine-toolbar]"
        )
    ) {

        const toolbarContainer =
            document.createElement("div");

        toolbarContainer.setAttribute(
            "data-engine-toolbar",
            ""
        );

        toolbarContainer.className =
            "engine-toolbar";

        document.querySelector(
            "#app"
        )?.prepend(
            toolbarContainer
        );

    }

}
