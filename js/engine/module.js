/**
 * ============================================================
 * MODULE
 * Painel Frota
 * Arquivo: js/engine/module.js
 *
 * Responsabilidade:
 *
 * - Criar um módulo
 * - Criar State
 * - Criar Engine
 * - Criar Form
 * - Criar Table
 * - Criar Toolbar
 * - Conectar os componentes
 * - Inicializar o módulo
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
 *      CRUD SERVICE
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
    // VALIDAR CONFIGURAÇÃO
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


    const containerSelector =
        config.container;


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

            `Module ${entity}: ` +

            `container "${containerSelector}" não encontrado.`

        );

    }


    // ========================================================
    // ESTADO
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
    // COMPONENTES
    // ========================================================

    let engine =
        null;


    let form =
        null;


    let table =
        null;


    let toolbar =
        null;


    // ========================================================
    // ESTRUTURA HTML
    // ========================================================

    prepararContainer();


    // ========================================================
    // LOCALIZAR ÁREAS
    // ========================================================

    const areas =
        localizarAreas();


    // ========================================================
    // CRIAR ENGINE
    // ========================================================

    engine =
        createEngine({

            entity,

            schema,

            container,

            options,

            state,

            autoStart:
                false

        });


    // ========================================================
    // CRIAR TABLE
    // ========================================================

    table =
        createTable({

            container:
                areas.tabela,

            schema,

            state,

            engine,

            options

        });


    // ========================================================
    // CRIAR FORM
    // ========================================================

    form =
        createForm({

            container:
                areas.formulario,

            schema,

            state,

            engine,

            options

        });


    // ========================================================
    // CRIAR TOOLBAR
    // ========================================================

    toolbar =
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
    // CONECTAR ENGINE
    // ========================================================

    conectarEngine();


    // ========================================================
    // OBJETO MODULE
    // ========================================================

    const module = {

        // ----------------------------------------------------
        // IDENTIFICAÇÃO
        // ----------------------------------------------------

        entity,

        schema,

        options,

        container,


        // ----------------------------------------------------
        // COMPONENTES
        // ----------------------------------------------------

        state,

        engine,

        form,

        table,

        toolbar,


        // ----------------------------------------------------
        // INICIAR
        // ----------------------------------------------------

        async iniciar() {

            console.log(
                `MODULE → INICIAR → ${entity}`
            );


            try {

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
                // ENGINE
                // --------------------------------------------

                if (
                    engine &&
                    typeof engine.iniciar ===
                    "function"
                ) {

                    await engine.iniciar();

                }


                // --------------------------------------------
                // EVENTO
                // --------------------------------------------

                emitirEvento(
                    container,
                    "modulo-iniciado",
                    module
                );


                console.log(
                    `MODULE → INICIADO → ${entity}`
                );


                return module;

            } catch (erro) {

                console.error(

                    `Module ${entity}: ` +
                    `falha na inicialização`,

                    erro

                );


                throw erro;

            }

        },


        // ----------------------------------------------------
        // RECARREGAR
        // ----------------------------------------------------

        async recarregar() {

            if (
                engine &&
                typeof engine.recarregar ===
                "function"
            ) {

                return engine.recarregar();

            }

        },


        // ----------------------------------------------------
        // NOVO
        // ----------------------------------------------------

        novo() {

            if (
                engine &&
                typeof engine.novo ===
                "function"
            ) {

                return engine.novo();

            }

        },


        // ----------------------------------------------------
        // EDITAR
        // ----------------------------------------------------

        async editar(
            id
        ) {

            if (
                engine &&
                typeof engine.editar ===
                "function"
            ) {

                return engine.editar(
                    id
                );

            }

        },


        // ----------------------------------------------------
        // SALVAR
        // ----------------------------------------------------

        async salvar(
            dados
        ) {

            if (
                engine &&
                typeof engine.salvar ===
                "function"
            ) {

                return engine.salvar(
                    dados
                );

            }

        },


        // ----------------------------------------------------
        // EXCLUIR
        // ----------------------------------------------------

        async excluir(
            id
        ) {

            if (
                engine &&
                typeof engine.excluir ===
                "function"
            ) {

                return engine.excluir(
                    id
                );

            }

        },


        // ----------------------------------------------------
        // FILTRAR
        // ----------------------------------------------------

        filtrar(
            valor
        ) {

            if (
                engine &&
                typeof engine.filtrar ===
                "function"
            ) {

                return engine.filtrar(
                    valor
                );

            }

        },


        // ----------------------------------------------------
        // FECHAR FORMULÁRIO
        // ----------------------------------------------------

        fecharFormulario() {

            if (
                engine &&
                typeof engine.fecharFormulario ===
                "function"
            ) {

                return engine.fecharFormulario();

            }

        }

    };


    // ========================================================
    // DISPONIBILIZAR MODULE
    // ========================================================

    return module;

}


// ============================================================
// PREPARAR CONTAINER
// ============================================================

function prepararContainer() {

    /*
     * Se o container já possui estrutura criada
     * pelo HTML, preservamos.
     */

    let estrutura =
        containerEstruturaExistente();


    if (estrutura) {

        return;

    }


    /*
     * O module cria somente a estrutura
     * das áreas.
     */

    const titulo =
        optionsTitulo();


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

                        ${escaparHTML(titulo)}

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


// ============================================================
// LOCALIZAR ÁREAS
// ============================================================

function localizarAreas() {

    const toolbar =
        container.querySelector(
            "[data-module-toolbar]"
        );


    const formulario =
        container.querySelector(
            "[data-module-form]"
        );


    const tabela =
        container.querySelector(
            "[data-module-table]"
        );


    return {

        toolbar,

        formulario,

        tabela

    };

}


// ============================================================
// CONECTAR ENGINE
// ============================================================

function conectarEngine() {

    // --------------------------------------------------------
    // ENGINE → TABLE
    // --------------------------------------------------------

    container.addEventListener(

        "engine:carregado",

        () => {

            if (
                table &&
                typeof table.renderizar ===
                "function"
            ) {

                table.renderizar();

            }

        }

    );


    // --------------------------------------------------------
    // ENGINE → SALVO
    // --------------------------------------------------------

    container.addEventListener(

        "engine:salvo",

        () => {

            if (
                table &&
                typeof table.renderizar ===
                "function"
            ) {

                table.renderizar();

            }


            if (
                form &&
                typeof form.limpar ===
                "function"
            ) {

                form.limpar();

            }

        }

    );


    // --------------------------------------------------------
    // ENGINE → EXCLUÍDO
    // --------------------------------------------------------

    container.addEventListener(

        "engine:excluido",

        () => {

            if (
                table &&
                typeof table.renderizar ===
                "function"
            ) {

                table.renderizar();

            }

        }

    );


    // --------------------------------------------------------
    // ENGINE → NOVO
    // --------------------------------------------------------

    container.addEventListener(

        "engine:novo",

        () => {

            if (
                form &&
                typeof form.novo ===
                "function"
            ) {

                form.novo();

            }

        }

    );


    // --------------------------------------------------------
    // ENGINE → EDITAR
    // --------------------------------------------------------

    container.addEventListener(

        "engine:editar",

        evento => {

            if (
                form &&
                typeof form.editar ===
                "function"
            ) {

                form.editar(
                    evento.detail
                );

            }

        }

    );


    // --------------------------------------------------------
    // ENGINE → FORMULÁRIO FECHADO
    // --------------------------------------------------------

    container.addEventListener(

        "engine:formulario-fechado",

        () => {

            if (
                form &&
                typeof form.fechar ===
                "function"
            ) {

                form.fechar();

            }

        }

    );

}


// ============================================================
// ESTRUTURA EXISTENTE
// ============================================================

function containerEstruturaExistente() {

    return (

        container.querySelector(
            "[data-module-toolbar]"
        ) &&

        container.querySelector(
            "[data-module-form]"
        ) &&

        container.querySelector(
            "[data-module-table]"
        )

    );

}


// ============================================================
// TÍTULO
// ============================================================

function optionsTitulo() {

    return (

        options.titulo ||

        schema.title ||

        schema.titulo ||

        entity

    );

}


// ============================================================
// VALIDAR CONFIGURAÇÃO
// ============================================================

function validarConfiguracao(
    config
) {

    if (
        !config ||
        typeof config !==
        "object"
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


    if (
        !config.schema
    ) {

        console.warn(

            `Module ${config.entity}: ` +
            "schema não informado."

        );

    }

}


// ============================================================
// EMITIR EVENTO
// ============================================================

function emitirEvento(
    elemento,
    nome,
    detalhe
) {

    elemento.dispatchEvent(

        new CustomEvent(

            `module:${nome}`,

            {

                detail:
                    detalhe

            }

        )

    );

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
