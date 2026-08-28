/**
 * ============================================================
 * HEADER ENGINE
 * ============================================================
 *
 * Exibe:
 *
 * LOGO → TÍTULO → DATA/HORA → TELA CHEIA
 *
 * ============================================================
 */

export function createHeader(config = {}) {

    const {
        container,
        titulo = "",
        logo = ""
    } = config;


    // ============================================================
    // RESOLVE CONTAINER
    // ============================================================

    const elemento =
        resolverElemento(container);


    if (!elemento) {

        throw new Error(
            "Header: container não encontrado."
        );

    }


    // ============================================================
    // LIMPA CONTAINER
    // ============================================================

    elemento.innerHTML = "";


    // ============================================================
    // HEADER
    // ============================================================

    const header =
        document.createElement(
            "header"
        );


    header.className =
        "engine-header";


    // ============================================================
    // LOGO
    // ============================================================

    const logoContainer =
        document.createElement(
            "div"
        );


    logoContainer.className =
        "engine-header-logo";


    if (logo) {

        const imagem =
            document.createElement(
                "img"
            );


        imagem.src =
            logo;


        imagem.alt =
            titulo;


        imagem.className =
            "engine-header-logo-img";


        logoContainer.appendChild(
            imagem
        );

    }


    // ============================================================
    // TÍTULO
    // ============================================================

    const tituloElemento =
        document.createElement(
            "h1"
        );


    tituloElemento.className =
        "engine-header-title";


    tituloElemento.textContent =
        titulo;


    // ============================================================
    // DATA / HORA
    // ============================================================

    const dataHora =
        document.createElement(
            "div"
        );


    dataHora.className =
        "engine-header-datetime";


    // ============================================================
    // BOTÃO TELA CHEIA
    // ============================================================

    const botaoFullscreen =
        document.createElement(
            "button"
        );


    botaoFullscreen.type =
        "button";


    botaoFullscreen.className =
        "engine-header-fullscreen";


    botaoFullscreen.title =
        "Tela cheia";


    botaoFullscreen.setAttribute(
        "aria-label",
        "Tela cheia"
    );


    botaoFullscreen.textContent =
        "⛶";


    // ============================================================
    // ESTRUTURA
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
        botaoFullscreen
    );


    elemento.appendChild(
        header
    );


    // ============================================================
    // ATUALIZA DATA / HORA
    // ============================================================

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
            `${data} - ${hora}`;

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

    botaoFullscreen.addEventListener(
        "click",
        async () => {

            try {

                if (
                    !document.fullscreenElement
                ) {

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
    );


    // ============================================================
    // ATUALIZA ÍCONE
    // ============================================================

    document.addEventListener(
        "fullscreenchange",
        () => {

            if (
                document.fullscreenElement
            ) {

                botaoFullscreen.textContent =
                    "⛶";

                botaoFullscreen.title =
                    "Sair da tela cheia";

            } else {

                botaoFullscreen.textContent =
                    "⛶";

                botaoFullscreen.title =
                    "Tela cheia";

            }

        }
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

            header.remove();

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
