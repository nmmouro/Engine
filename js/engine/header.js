/**
 * ============================================================
 * HEADER ENGINE
 * ============================================================
 *
 * Cabeçalho padrão do Painel Frota.
 *
 * Ordem:
 * 1. Logo
 * 2. Título
 * 3. Data / Hora
 * 4. Botão Tela Cheia
 * ============================================================
 */

export function createHeader(config = {}) {

    const {
        container,
        titulo = "Painel Frota",
        logo = "img/logo.png"
    } = config;


    // ============================================================
    // CONTAINER
    // ============================================================

    const elemento =
        resolverElemento(container);


    if (!elemento) {

        throw new Error(
            `Header: container não encontrado: ${container}`
        );

    }


    // ============================================================
    // HEADER
    // ============================================================

    const header =
        document.createElement("header");

    header.className =
        "engine-header";


    // ============================================================
    // LOGO
    // ============================================================

    const logoContainer =
        document.createElement("div");

    logoContainer.className =
        "engine-header-logo";


    const imagem =
        document.createElement("img");

    imagem.src =
        logo;

    imagem.alt =
        "Logo";


    logoContainer.appendChild(
        imagem
    );


    // ============================================================
    // TÍTULO
    // ============================================================

    const tituloElemento =
        document.createElement("h1");

    tituloElemento.className =
        "engine-header-title";

    tituloElemento.textContent =
        titulo;


    // ============================================================
    // DATA / HORA
    // ============================================================

    const dataHora =
        document.createElement("div");

    dataHora.className =
        "engine-header-datetime";


    function atualizarDataHora() {

        const agora =
            new Date();


        const data =
            agora.toLocaleDateString(
                "pt-BR"
            );


        const hora =
            agora.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        dataHora.textContent =
            `${data} ${hora}`;

    }


    atualizarDataHora();


    const intervalo =
        setInterval(
            atualizarDataHora,
            1000
        );


    // ============================================================
    // TELA CHEIA
    // ============================================================

    const btnFullscreen =
        document.createElement("button");

    btnFullscreen.type =
        "button";

    btnFullscreen.className =
        "engine-header-fullscreen";

    btnFullscreen.title =
        "Tela cheia";

    btnFullscreen.setAttribute(
        "aria-label",
        "Tela cheia"
    );

    btnFullscreen.innerHTML =
        "⛶";


    btnFullscreen.addEventListener(
        "click",
        alternarTelaCheia
    );


    async function alternarTelaCheia() {

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch (erro) {

            console.error(
                "Erro ao alternar tela cheia:",
                erro
            );

        }

    }


    // ============================================================
    // ATUALIZA ÍCONE
    // ============================================================

    document.addEventListener(
        "fullscreenchange",
        atualizarBotaoFullscreen
    );


    function atualizarBotaoFullscreen() {

        if (document.fullscreenElement) {

            btnFullscreen.innerHTML =
                "⛶";

            btnFullscreen.title =
                "Sair da tela cheia";

        } else {

            btnFullscreen.innerHTML =
                "⛶";

            btnFullscreen.title =
                "Tela cheia";

        }

    }


    // ============================================================
    // MONTAGEM
    // ============================================================

    header.appendChild(
        logoContainer
    );


    header.appendChild(
        tituloElemento
    );


    header.appendChild(
        dataHora
    );


    header.appendChild(
        btnFullscreen
    );


    elemento.appendChild(
        header
    );


    // ============================================================
    // API
    // ============================================================

    return {

        elemento: header,

        atualizarDataHora,

        destruir() {

            clearInterval(
                intervalo
            );

            document.removeEventListener(
                "fullscreenchange",
                atualizarBotaoFullscreen
            );

        }

    };

}


// ============================================================
// RESOLVE ELEMENTO
// ============================================================

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
