```javascript
/**
 * ============================================================
 * TOOLBAR
 * Painel Frota
 * Arquivo: toolbar.js
 *
 * Responsabilidade:
 *
 * - Criar barra de ferramentas
 * - Botão Novo
 * - Título do módulo
 * - Botões personalizados
 * - Eventos da toolbar
 *
 * NÃO conhece:
 *
 * - PostgreSQL
 * - Supabase
 * - Google Sheets
 * - CRUD diretamente
 *
 * Para executar operações utiliza:
 *
 *     engine.novo()
 *     engine.action()
 *
 * ============================================================
 */


// ============================================================
// CREATE TOOLBAR
// ============================================================

export function createToolbar(config = {}) {

    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    const entity =
        config.entity || "";

    const container =
        config.container || null;

    const engine =
        config.engine || null;

    const options =
        config.options || {};


    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (!container) {

        throw new Error(
            `Toolbar ${entity}: container não informado.`
        );

    }


    if (!engine) {

        throw new Error(
            `Toolbar ${entity}: engine não informado.`
        );

    }


    // ========================================================
    // ELEMENTOS
    // ========================================================

    let toolbar =
        null;


    // ========================================================
    // API PÚBLICA
    // ========================================================

    const api = {

        entity,

        container,

        engine,

        options,

        iniciar,

        renderizar,

        novo,

        destruir

    };


    // ========================================================
    // INICIAR
    // ========================================================

    function iniciar() {

        renderizar();

        localizarToolbar();

        registrarEventos();

        return api;

    }


    // ========================================================
    // RENDERIZAR
    // ========================================================

    function renderizar() {

        /*
         * Se o module.js já criou a toolbar,
         * não devemos duplicá-la.
         */

        toolbar =
            container.querySelector(
                "[data-engine-toolbar]"
            );


        if (!toolbar) {

            toolbar =
                document.createElement(
                    "div"
                );

            toolbar.className =
                "engine-toolbar";

            toolbar.setAttribute(
                "data-engine-toolbar",
                ""
            );


            container.prepend(
                toolbar
            );

        }


        const titulo =
            options.titulo ||
            entity;


        const permitirNovo =
            options.permitirNovo !== false;


        const actions =
            options.toolbarActions ||
            {};


        let html = `

            <div class="engine-toolbar-left">

                <h1 class="engine-title">

                    ${escaparHTML(
                        titulo
                    )}

                </h1>

            </div>

            <div class="engine-toolbar-right">

        `;


        // ====================================================
        // NOVO
        // ====================================================

        if (permitirNovo) {

            html += `

                <button
                    type="button"
                    class="engine-btn engine-btn-primary"
                    data-toolbar-novo
                >

                    Novo

                </button>

            `;

        }


        // ====================================================
        // ACTIONS PERSONALIZADAS
        // ====================================================

        Object.keys(
            actions
        )
        .forEach(
            nome => {

                if (
                    typeof actions[nome] !==
                    "function"
                ) {

                    return;

                }


                html += `

                    <button
                        type="button"
                        class="engine-btn"
                        data-toolbar-action="${escaparAtributo(
                            nome
                        )}"
                    >

                        ${escaparHTML(
                            obterTituloAction(
                                nome
                            )
                        )}

                    </button>

                `;

            }
        );


        html += `

            </div>

        `;


        toolbar.innerHTML =
            html;

    }


    // ========================================================
    // LOCALIZAR TOOLBAR
    // ========================================================

    function localizarToolbar() {

        toolbar =
            container.querySelector(
                "[data-engine-toolbar]"
            );


        if (!toolbar) {

            throw new Error(
                `Toolbar ${entity}: toolbar não encontrada.`
            );

        }

    }


    // ========================================================
    // EVENTOS
    // ========================================================

    function registrarEventos() {

        if (!toolbar) {
            return;
        }


        toolbar.addEventListener(
            "click",
            tratarClique
        );

    }


    // ========================================================
    // TRATAR CLIQUE
    // ========================================================

    function tratarClique(
        evento
    ) {

        // ====================================================
        // NOVO
        // ====================================================

        const botaoNovo =
            evento.target.closest(
                "[data-toolbar-novo]"
            );


        if (botaoNovo) {

            novo();

            return;

        }


        // ====================================================
        // ACTION
        // ====================================================

        const botaoAction =
            evento.target.closest(
                "[data-toolbar-action]"
            );


        if (botaoAction) {

            const nome =
                botaoAction.getAttribute(
                    "data-toolbar-action"
                );


            if (!nome) {
                return;
            }


            if (
                typeof engine.action ===
                "function"
            ) {

                engine.action(
                    nome,
                    null
                );

            }

        }

    }


    // ========================================================
    // NOVO
    // ========================================================

    function novo() {

        console.log(
            `TOOLBAR ${entity} → NOVO`
        );


        if (
            typeof engine.novo !==
            "function"
        ) {

            console.error(
                `Toolbar ${entity}: engine.novo() não está disponível.`
            );

            return;

        }


        engine.novo();

    }


    // ========================================================
    // TÍTULO DE ACTION
    // ========================================================

    function obterTituloAction(
        nome
    ) {

        const titulos = {

            atualizar:
                "Atualizar",

            recarregar:
                "Recarregar",

            exportar:
                "Exportar",

            imprimir:
                "Imprimir",

            visualizar:
                "Visualizar",

            checklist:
                "Checklist"

        };


        return (
            titulos[nome] ||
            nome
        );

    }


    // ========================================================
    // ESCAPAR HTML
    // ========================================================

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


    // ========================================================
    // ESCAPAR ATRIBUTO
    // ========================================================

    function escaparAtributo(
        valor
    ) {

        return escaparHTML(
            valor
        );

    }


    // ========================================================
    // DESTRUIR
    // ========================================================

    function destruir() {

        if (toolbar) {

            toolbar.removeEventListener(
                "click",
                tratarClique
            );

        }


        toolbar =
            null;

    }


    // ========================================================
    // RETORNAR
    // ========================================================

    return api;

}
```
