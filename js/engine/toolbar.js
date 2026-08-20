/**
 * ============================================================
 * TOOLBAR ENGINE
 * ============================================================
 *
 * Responsável por:
 * - Criar barra de ferramentas
 * - Botão Novo
 * - Título
 * - Área de ações
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * Cria a Toolbar.
 *
 * @param {Object} config
 *
 * @returns {Object}
 */
export function createToolbar(config = {}) {

    const {
        container,
        titulo = "",
        permitirNovo = true,
        onNovo
    } = config;


    // ------------------------------------------------------------
    // Resolve container
    // ------------------------------------------------------------

    const elemento =
        resolverElemento(container);


    if (!elemento) {
        throw new Error(
            `Toolbar: container não encontrado: ${container}`
        );
    }


    // ------------------------------------------------------------
    // Elementos
    // ------------------------------------------------------------

    const toolbar =
        document.createElement("div");

    toolbar.className =
        "engine-toolbar";


    // ------------------------------------------------------------
    // Área esquerda
    // ------------------------------------------------------------

    const esquerda =
        document.createElement("div");

    esquerda.className =
        "engine-toolbar-left";


    // ------------------------------------------------------------
    // Título
    // ------------------------------------------------------------

    if (titulo) {

        const tituloElemento =
            document.createElement("h2");

        tituloElemento.className =
            "engine-toolbar-title";

        tituloElemento.textContent =
            titulo;

        esquerda.appendChild(
            tituloElemento
        );

    }


    // ------------------------------------------------------------
    // Área direita
    // ------------------------------------------------------------

    const direita =
        document.createElement("div");

    direita.className =
        "engine-toolbar-right";


    // ------------------------------------------------------------
    // Botão Novo
    // ------------------------------------------------------------

    let botaoNovo = null;


    if (permitirNovo) {

        botaoNovo =
            document.createElement("button");

        botaoNovo.type =
            "button";

        botaoNovo.className =
            "btn btn-primary engine-btn-novo";

        botaoNovo.textContent =
            "Novo";


        botaoNovo.addEventListener(
            "click",
            evento => {

                evento.preventDefault();

                if (typeof onNovo === "function") {
                    onNovo();
                }

            }
        );


        direita.appendChild(
            botaoNovo
        );

    }


    // ------------------------------------------------------------
    // Montagem
    // ------------------------------------------------------------

    toolbar.appendChild(
        esquerda
    );

    toolbar.appendChild(
        direita
    );

    elemento.appendChild(
        toolbar
    );


    // ------------------------------------------------------------
    // API pública
    // ------------------------------------------------------------

    return {

        elemento: toolbar,

        botaoNovo,

        habilitarNovo() {

            if (botaoNovo) {
                botaoNovo.disabled = false;
            }

        },

        desabilitarNovo() {

            if (botaoNovo) {
                botaoNovo.disabled = true;
            }

        },

        mostrarNovo() {

            if (botaoNovo) {
                botaoNovo.style.display = "";
            }

        },

        ocultarNovo() {

            if (botaoNovo) {
                botaoNovo.style.display = "none";
            }

        }

    };

}


/**
 * ============================================================
 * RESOLVE ELEMENTO
 * ============================================================
 */

function resolverElemento(valor) {

    if (!valor) {
        return null;
    }


    if (
        valor instanceof HTMLElement
    ) {

        return valor;

    }


    if (
        typeof valor === "string"
    ) {

        return document.querySelector(
            valor
        );

    }


    return null;

}
