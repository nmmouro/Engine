/**
 * ============================================================
 * MODULE
 * Painel Frota
 *
 * Arquivo:
 * js/engine/module.js
 *
 * Responsabilidade:
 *
 * - Montar a estrutura do módulo
 * - Criar State
 * - Criar Engine
 * - Criar Form
 * - Criar Table
 * - Criar Toolbar
 * - Conectar os componentes
 *
 * O Module NÃO executa CRUD diretamente.
 *
 * Arquitetura:
 *
 * PAGE
 *   ↓
 * MODULE
 *   ├── STATE
 *   ├── ENGINE
 *   ├── FORM
 *   ├── TABLE
 *   └── TOOLBAR
 *          ↓
 *     CRUD SERVICE
 *          ↓
 *       SUPABASE
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

export function createModule(
    config = {}
) {

    // ========================================================
    // VALIDAR
    // ========================================================

    validarConfiguracao(
        config
    );


    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    const entity =
        config.entity;


    const schema =
        config.schema || {};


    const options =
        config.options || {};


    // ========================================================
    // CONTAINER
    // ========================================================

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
    // EVITAR DUPLICAÇÃO
    // ========================================================

    /*
     * Se este módulo já foi criado neste container,
     * retornamos a instância existente.
     */

    if (
        container.__engineModule
    ) {

        console.warn(

            `Module ${entity}: ` +
            "módulo já inicializado."

        );


        return container.__engineModule;

    }


    // ========================================================
    // ESTRUTURA
    // ========================================================

    prepararEstrutura();


    // ========================================================
    // ÁREAS
    // ========================================================

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

        /*
         * IMPORTANTE:
         *
         * Passamos o container principal.
         * O table.js localiza internamente:
         *
         * [data-engine-table]
         */

        container,

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

        /*
         * IMPORTANTE:
         *
         * Passamos o container principal.
         * O form.js localiza internamente:
         *
         * [data-engine-form]
         */

        container,

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

        /*
         * IMPORTANTE:
         *
         * Passamos o container principal.
         * O toolbar.js localiza internamente:
         *
         * [data-engine-toolbar]
         */

        container,

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

            if (
                state.iniciado
            ) {

                console.warn(

                    `Module ${entity}: ` +
                    "já foi iniciado."

                );


                return module;

            }


            console.log(
                `MODULE → INICIAR → ${entity}`
            );


            try {

                // --------------------------------------------
                // FORM
                // --------------------------------------------

                if (
                    form &&
                    typeof form.iniciar ===
                    "function"
                ) {

                    form.iniciar();

                }


                // --------------------------------------------
                // TABLE
                // --------------------------------------------

                if (
                    table &&
                    typeof table.iniciar ===
                    "function"
                ) {

                    table.iniciar();

                }


                // --------------------------------------------
                // TOOLBAR
                // --------------------------------------------

                if (
                    toolbar &&
                    typeof toolbar.iniciar ===
                    "function"
                ) {

                    toolbar.iniciar();

                }


                // --------------------------------------------
                // ENGINE
                // --------------------------------------------

                if (
                    engine &&
                    typeof engine.iniciar ===
                    "function"
                ) {

                    await engine.iniciar();

                }


                state.iniciado =
                    true;


                // --------------------------------------------
                // EVENTO
                // --------------------------------------------

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
        // RECARREGAR
        // ====================================================

        async recarregar() {

            return engine.recarregar();

        },


        // ====================================================
        // NOVO
        // ====================================================

        novo() {

            return engine.novo();

        },


        // ====================================================
        // EDITAR
        // ====================================================

        async editar(
            id
        ) {

            return engine.editar(
                id
            );

        },


        // ====================================================
        // SALVAR
        // ====================================================

        async salvar(
            dados
        ) {

            return engine.salvar(
                dados
            );

        },


        // ====================================================
        // EXCLUIR
        // ====================================================

        async excluir(
            id
        ) {

            return engine.excluir(
                id
            );

        },


        // ====================================================
        // FILTRAR
        // ====================================================

        filtrar(
            valor
        ) {

            return engine.filtrar(
                valor
            );

        },


        // ====================================================
        // FECHAR FORM
        // ====================================================

        fecharFormulario() {

            return engine.fecharFormulario();

        }

    };


    // ========================================================
    // EVENTOS
    // ========================================================

    conectarEventos();


    // ========================================================
    // GUARDAR INSTÂNCIA
    // ========================================================

    container.__engineModule =
        module;


    // ========================================================
    // INICIALIZAÇÃO
    // ========================================================

    /*
     * IMPORTANTE:
     *
     * O createModule retorna imediatamente.
     * A inicialização ocorre uma única vez.
     */

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
         * Não sobrescrever HTML se a estrutura
         * já estiver pronta.
         */

        const estruturaExistente =

            container.querySelector(
                "[data-engine-form]"
            ) &&

            container.querySelector(
                "[data-engine-table]"
            );


        if (
            estruturaExistente
        ) {

            /*
             * Mesmo que exista HTML próprio,
             * precisamos garantir a toolbar.
             */

            if (
                !container.querySelector(
                    "[data-engine-toolbar]"
                )
            ) {

                criarToolbarHTML();

            }


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
                data-engine-module="${escaparHTML(entity)}"
            >

                <!-- ========================================
                     CABEÇALHO
                ========================================= -->

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
                        data-engine-toolbar
                    >

                    </div>

                </header>


                <!-- ========================================
                     FORMULÁRIO
                ========================================= -->

                <section
                    class="engine-form-container"
                    data-engine-form
                    hidden
                >

                </section>


                <!-- ========================================
                     TABELA
                ========================================= -->

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
                        data-engine-table
                    >

                    </div>

                </section>

            </section>

        `;

    }


    // ========================================================
    // TOOLBAR HTML
    // ========================================================

    function criarToolbarHTML() {

        const header =
            container.querySelector(
                ".engine-header"
            );


        if (!header) {

            return;

        }


        const toolbarExistente =
            header.querySelector(
                "[data-engine-toolbar]"
            );


        if (
            toolbarExistente
        ) {

            return;

        }


        const toolbar =
            document.createElement(
                "div"
            );


        toolbar.className =
            "engine-toolbar";


        toolbar.setAttribute(
            "data-engine-toolbar",
            ""
        );


        header.appendChild(
            toolbar
        );

    }


    // ========================================================
    // LOCALIZAR ÁREAS
    // ========================================================

    function localizarAreas() {

        const toolbar =
            container.querySelector(
                "[data-engine-toolbar]"
            );


        const formulario =
            container.querySelector(
                "[data-engine-form]"
            );


        const tabela =
            container.querySelector(
                "[data-engine-table]"
            );


        /*
         * IMPORTANTE:
         *
         * Esses nomes precisam corresponder
         * exatamente aos seletores usados
         * pelos componentes separados.
         */

        if (!formulario) {

            throw new Error(

                `Module ${entity}: ` +
                "elemento [data-engine-form] não encontrado."

            );

        }


        if (!tabela) {

            throw new Error(

                `Module ${entity}: ` +
                "elemento [data-engine-table] não encontrado."

            );

        }


        if (!toolbar) {

            throw new Error(

                `Module ${entity}: ` +
                "elemento [data-engine-toolbar] não encontrado."

            );

        }


        return {

            toolbar,

            formulario,

            tabela

        };

    }


    // ========================================================
    // EVENTOS
    // ========================================================

    function conectarEventos() {

        // ----------------------------------------------------
        // ENGINE → CARREGADO
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // ENGINE → NOVO
        // ----------------------------------------------------

        container.addEventListener(

            "engine:novo",

            () => {

                if (
                    typeof form?.novo ===
                    "function"
                ) {

                    form.novo();

                }

            }

        );


        // ----------------------------------------------------
        // ENGINE → EDITAR
        // ----------------------------------------------------

        container.addEventListener(

            "engine:editar",

            evento => {

                if (
                    typeof form?.editar ===
                    "function"
                ) {

                    form.editar(
                        evento.detail
                    );

                }

            }

        );


        // ----------------------------------------------------
        // ENGINE → SALVO
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // ENGINE → EXCLUÍDO
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // ENGINE → FORM FECHADO
        // ----------------------------------------------------

        container.addEventListener(

            "engine:formulario-fechado",

            () => {

                if (
                    typeof form?.fechar ===
                    "function"
                ) {

                    form.fechar();

                }

            }

        );

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
