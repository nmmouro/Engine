/**
 * ============================================================
 * MODULE
 * Painel Frota
 * Arquivo: js/engine/module.js
 * ============================================================
 */

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

export function createModule(
    config = {}
) {

    validarConfiguracao(
        config
    );


    const entity =
        config.entity;


    const schema =
        config.schema || {};


    const options =
        config.options || {};


    const container =
        typeof config.container === "string"

            ? document.querySelector(
                config.container
            )

            : config.container;


    if (!container) {

        throw new Error(

            `Module ${entity}: ` +
            `container "${config.container}" não encontrado.`

        );

    }


    // ========================================================
    // PREPARAR ESTRUTURA
    // ========================================================

    prepararEstrutura();


    const areas =
        localizarAreas();


    // ========================================================
    // STATE
    // ========================================================

    const state =
        createState({

            name:
                options.stateName ||
                entity,

            pageSize:
                options.pageSize ||
                10

        });


    // ========================================================
    // ENGINE
    // ========================================================

    const engine =
        createEngine({

            entity,

            schema,

            options,

            container,

            state,

            autoStart:
                false

        });


    // ========================================================
    // TABLE
    // ========================================================

    const table =
        createTable({

            container:
                areas.tabela,

            schema,

            state,

            engine,

            options

        });


    // ========================================================
    // FORM
    // ========================================================

    const form =
        createForm({

            container:
                areas.formulario,

            schema,

            state,

            engine,

            options

        });


    // ========================================================
    // TOOLBAR
    // ========================================================

    const toolbar =
        createToolbar({

            container:
                areas.toolbar,

            schema,

            state,

            engine,

            form,

            table,

            options

        });


    // ========================================================
    // MODULE
    // ========================================================

    const module = {

        entity,

        schema,

        options,

        container,

        state,

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


            try {

                if (
                    typeof toolbar?.iniciar ===
                    "function"
                ) {

                    toolbar.iniciar();

                }


                if (
                    typeof form?.iniciar ===
                    "function"
                ) {

                    form.iniciar();

                }


                if (
                    typeof table?.iniciar ===
                    "function"
                ) {

                    table.iniciar();

                }


                if (
                    typeof engine?.iniciar ===
                    "function"
                ) {

                    await engine.iniciar();

                }


                container.dispatchEvent(

                    new CustomEvent(
                        "module:iniciado",
                        {
                            detail:
                                module
                        }
                    )

                );


                console.log(
                    `MODULE → INICIADO → ${entity}`
                );


                return module;

            } catch (erro) {

                console.error(

                    `Module ${entity}: ` +
                    "falha na inicialização",

                    erro

                );


                throw erro;

            }

        },


        // ====================================================
        // MÉTODOS DELEGADOS
        // ====================================================

        recarregar() {

            return engine.recarregar();

        },


        novo() {

            return engine.novo();

        },


        editar(
            id
        ) {

            return engine.editar(
                id
            );

        },


        salvar(
            dados
        ) {

            return engine.salvar(
                dados
            );

        },


        excluir(
            id
        ) {

            return engine.excluir(
                id
            );

        },


        filtrar(
            valor
        ) {

            return engine.filtrar(
                valor
            );

        },


        fecharFormulario() {

            return engine.fecharFormulario();

        }

    };


    // ========================================================
    // EVENTOS ENGINE → TABLE
    // ========================================================

    container.addEventListener(

        "engine:carregado",

        () => {

            if (
                typeof table?.renderizar ===
                "function"
            ) {

                table.renderizar();

            }

        }

    );


    container.addEventListener(

        "engine:salvo",

        () => {

            if (
                typeof table?.renderizar ===
                "function"
            ) {

                table.renderizar();

            }

        }

    );


    container.addEventListener(

        "engine:excluido",

        () => {

            if (
                typeof table?.renderizar ===
                "function"
            ) {

                table.renderizar();

            }

        }

    );


    // ========================================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================================

    module.iniciar()
        .catch(
            erro => {

                console.error(

                    `Module ${entity}: ` +
                    "erro fatal",

                    erro

                );

            }
        );


    return module;


    // ========================================================
    // PREPARAR ESTRUTURA
    // ========================================================

    function prepararEstrutura() {

        /*
         * Se a estrutura já existe,
         * não sobrescrevemos.
         */

        if (
            container.querySelector(
                "[data-module-table]"
            )
        ) {

            return;

        }


        const titulo =
            options.titulo ||
            schema.title ||
            schema.titulo ||
            entity;


        container.innerHTML = `

            <section
                class="engine-module"
                data-module="${escaparHTML(entity)}"
            >

                <header
                    class="engine-header"
                >

                    <div
                        class="engine-title"
                    >

                        <h1>

                            ${escaparHTML(
                                titulo
                            )}

                        </h1>

                    </div>


                    <div
                        class="engine-toolbar"
                        data-module-toolbar
                    >
                    </div>

                </header>


                <section
                    class="engine-form-container"
                    data-module-form
                    hidden
                >
                </section>


                <section
                    class="engine-table-container"
                >

                    <div
                        class="engine-loading"
                        data-engine-loading
                        hidden
                    >

                        Carregando...

                    </div>


                    <div
                        class="engine-table-area"
                        data-module-table
                    >
                    </div>

                </section>

            </section>

        `;

    }


    // ========================================================
    // LOCALIZAR ÁREAS
    // ========================================================

    function localizarAreas() {

        return {

            toolbar:
                container.querySelector(
                    "[data-module-toolbar]"
                ),

            formulario:
                container.querySelector(
                    "[data-module-form]"
                ),

            tabela:
                container.querySelector(
                    "[data-module-table]"
                )

        };

    }

}


// ============================================================
// VALIDAR CONFIGURAÇÃO
// ============================================================

function validarConfiguracao(
    config
) {

    if (
        !config ||
        typeof config !== "object"
    ) {

        throw new Error(
            "Module: configuração inválida."
        );

    }


    if (
        !config.entity
    ) {

        throw new Error(
            "Module: entidade não informada."
        );

    }


    if (
        !config.container
    ) {

        throw new Error(
            "Module: container não informado."
        );

    }

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(
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
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}
