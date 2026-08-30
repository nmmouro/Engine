/**
 * ============================================================
 * MODULE
 * Painel Frota
 *
 * Arquivo:
 *     js/engine/module.js
 *
 * RESPONSABILIDADE
 * ------------------------------------------------------------
 * Orquestrar:
 *
 *     Form
 *     Table
 *     Toolbar
 *     Engine
 *
 * Fluxo:
 *
 *     createModule()
 *          ↓
 *     criar containers
 *          ↓
 *     criar Form
 *     criar Table
 *     criar Toolbar
 *     criar Engine
 *          ↓
 *     engine.setComponents()
 *          ↓
 *     iniciar componentes
 *          ↓
 *     engine.iniciar()
 *
 * O Module NÃO conhece Supabase.
 * O Module NÃO conhece PostgreSQL.
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
    // VALIDAR
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
        String(config.entity);

    const schema =
        config.schema || null;

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
            `Module ${entity}: container não encontrado.`
        );

    }


    console.log(
        `MODULE → CRIAR → ${entity}`
    );


    // ========================================================
    // ESTRUTURA
    // ========================================================

    criarEstrutura(
        container,
        entity,
        options
    );


    // ========================================================
    // LOCALIZAR CONTAINERS
    // ========================================================

    const headerContainer =
        container.querySelector(
            "[data-engine-header]"
        );


    const toolbarContainer =
        container.querySelector(
            "[data-engine-toolbar]"
        );


    const formContainer =
        container.querySelector(
            "[data-engine-form]"
        );


    const tableContainer =
        container.querySelector(
            "[data-engine-table]"
        );


    if (!toolbarContainer) {

        throw new Error(
            `Module ${entity}: [data-engine-toolbar] não encontrado.`
        );

    }


    if (!formContainer) {

        throw new Error(
            `Module ${entity}: [data-engine-form] não encontrado.`
        );

    }


    if (!tableContainer) {

        throw new Error(
            `Module ${entity}: [data-engine-table] não encontrado.`
        );

    }


    // ========================================================
    // COMPONENTES
    // ========================================================

    let form = null;

    let table = null;

    let toolbar = null;

    let engine = null;


    // ========================================================
    // CRIAR FORM
    // ========================================================

    form =
        createForm({

            entity,

            schema,

            options,

            container:
                formContainer

        });


    // ========================================================
    // CRIAR TABLE
    // ========================================================

    table =
        createTable({

            entity,

            schema,

            options,

            container:
                tableContainer

        });


    // ========================================================
    // CRIAR TOOLBAR
    // ========================================================

    toolbar =
        createToolbar({

            entity,

            schema,

            options,

            container:
                toolbarContainer

        });


    // ========================================================
    // CRIAR ENGINE
    // ========================================================

    engine =
        createEngine({

            entity,

            schema,

            options,

            container

        });


    // ========================================================
    // CONECTAR COMPONENTES AO ENGINE
    // ========================================================
    //
    // ESTA É A CORREÇÃO PRINCIPAL.
    //
    // Sem isso:
    //
    //     ENGINE: Form não configurado
    //     ENGINE: Table não configurado
    //     ENGINE: Toolbar não configurado
    //
    // ========================================================

    engine.setComponents({

        form,

        table,

        toolbar

    });


    // ========================================================
    // CONECTAR FORM → ENGINE
    // ========================================================

    if (
        form &&
        typeof form.setEngine === "function"
    ) {

        form.setEngine(
            engine
        );

    }


    // ========================================================
    // CONECTAR TABLE → ENGINE
    // ========================================================

    if (
        table &&
        typeof table.setEngine === "function"
    ) {

        table.setEngine(
            engine
        );

    }


    // ========================================================
    // CONECTAR TOOLBAR → ENGINE
    // ========================================================

    if (
        toolbar &&
        typeof toolbar.setEngine === "function"
    ) {

        toolbar.setEngine(
            engine
        );

    }


    // ========================================================
    // EVENTOS DO ENGINE
    // ========================================================

    registrarEventos(

        container,

        engine,

        form,

        table,

        toolbar

    );


    // ========================================================
    // API DO MODULE
    // ========================================================

    const module = {

        entity,

        schema,

        options,

        container,

        headerContainer,

        toolbarContainer,

        formContainer,

        tableContainer,

        state:
            engine.state,

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

                // --------------------------------------------
                // FORM
                // --------------------------------------------

                if (
                    form &&
                    typeof form.iniciar === "function"
                ) {

                    await form.iniciar();

                }


                // --------------------------------------------
                // TABLE
                // --------------------------------------------

                if (
                    table &&
                    typeof table.iniciar === "function"
                ) {

                    await table.iniciar();

                }


                // --------------------------------------------
                // TOOLBAR
                // --------------------------------------------

                if (
                    toolbar &&
                    typeof toolbar.iniciar === "function"
                ) {

                    await toolbar.iniciar();

                }


                // --------------------------------------------
                // ENGINE
                // --------------------------------------------

                await engine.iniciar();


                console.log(
                    `MODULE → INICIADO → ${entity}`
                );


                return module;


            } catch (erro) {

                console.error(
                    `Module ${entity}: falha na inicialização`,
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

        editar(id) {

            return engine.editar(
                id
            );

        },


        // ====================================================
        // SALVAR
        // ====================================================

        salvar(dados) {

            return engine.salvar(
                dados
            );

        },


        // ====================================================
        // EXCLUIR
        // ====================================================

        excluir(id) {

            return engine.excluir(
                id
            );

        },


        // ====================================================
        // FILTRAR
        // ====================================================

        filtrar(valor) {

            return engine.filtrar(
                valor
            );

        },


        // ====================================================
        // PAGINA
        // ====================================================

        pagina(numero) {

            return engine.pagina(
                numero
            );

        }

    };


    // ========================================================
    // INICIALIZAÇÃO
    // ========================================================

    module.iniciar()

        .catch(
            erro => {

                console.error(
                    `Module ${entity}: erro fatal`,
                    erro
                );

            }
        );


    return module;

}


// ============================================================
// CRIAR ESTRUTURA
// ============================================================

function criarEstrutura(
    container,
    entity,
    options
) {

    /*
     * IMPORTANTE:
     *
     * Não reconstruir a estrutura se ela já existir.
     *
     * Isso evita que o botão Novo seja apagado.
     */

    if (
        container.querySelector(
            "[data-engine-module]"
        )
    ) {

        return;

    }


    const titulo =
        options.titulo ||
        entity;


    container.innerHTML = `

        <section
            class="engine-module"
            data-engine-module
            data-entity="${escaparHTML(entity)}"
        >

            <!-- ==========================================
                 CABEÇALHO
            =========================================== -->

            <header
                class="engine-header"
            >

                <div
                    class="engine-header-content"
                    data-engine-header
                >

                    <h1>
                        ${escaparHTML(titulo)}
                    </h1>

                </div>

            </header>


            <!-- ==========================================
                 TOOLBAR
            =========================================== -->

            <div
                class="engine-toolbar-container"
                data-engine-toolbar
            ></div>


            <!-- ==========================================
                 FORMULÁRIO
            =========================================== -->

            <div
                class="engine-form-container"
                data-engine-form
            ></div>


            <!-- ==========================================
                 TABELA
            =========================================== -->

            <section
                class="engine-table-section"
            >

                <div
                    class="engine-loading"
                    data-engine-loading
                    hidden
                >
                    Carregando...
                </div>


                <div
                    class="engine-table-container"
                    data-engine-table
                ></div>

            </section>

        </section>

    `;

}


// ============================================================
// EVENTOS
// ============================================================

function registrarEventos(

    container,

    engine,

    form,

    table,

    toolbar

) {

    // ========================================================
    // ENGINE → CARREGADO
    // ========================================================

    container.addEventListener(
        "engine:carregado",
        evento => {

            const registros =
                evento.detail || [];


            /*
             * A tabela recebe os registros.
             *
             * O toolbar NÃO é tocado.
             */

            if (
                table &&
                typeof table.renderizar === "function"
            ) {

                table.renderizar(

                    registros,

                    engine.state,

                    engine

                );

            }

        }
    );


    // ========================================================
    // ENGINE → SALVO
    // ========================================================

    container.addEventListener(
        "engine:salvo",
        () => {

            /*
             * Após salvar, atualiza somente a tabela.
             */

            if (
                table &&
                typeof table.renderizar === "function"
            ) {

                table.renderizar(

                    engine.obterRegistrosFiltrados(),

                    engine.state,

                    engine

                );

            }

        }
    );


    // ========================================================
    // ENGINE → NOVO
    // ========================================================

    container.addEventListener(
        "engine:novo",
        () => {

            /*
             * Form é responsável pela exibição.
             */

            if (
                form &&
                typeof form.mostrar === "function"
            ) {

                form.mostrar();

            }

        }
    );


    // ========================================================
    // ENGINE → EDITAR
    // ========================================================

    container.addEventListener(
        "engine:editar",
        evento => {

            const registro =
                evento.detail;


            if (
                !registro
            ) {

                return;

            }


            if (
                form &&
                typeof form.mostrar === "function"
            ) {

                form.mostrar();

            }

        }
    );


    // ========================================================
    // ENGINE → FORMULÁRIO FECHADO
    // ========================================================

    container.addEventListener(
        "engine:formulario-fechado",
        () => {

            if (
                form &&
                typeof form.esconder === "function"
            ) {

                form.esconder();

            }

        }
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


// ============================================================
// EXPORT DEFAULT
// ============================================================

export default createModule;

