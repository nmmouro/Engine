/**
 * ============================================================
 * APP
 * Painel Frota
 *
 * Arquivo:
 *     js/app.js
 *
 * Responsabilidades:
 *
 * - Inicializar a aplicação
 * - Detectar a página atual
 * - Carregar o módulo correspondente
 * - Não utilizar localStorage
 * - Não utilizar sessionStorage
 * - Não depender de scripts externos
 *
 * Arquitetura:
 *
 *     index.html
 *          │
 *          ▼
 *       app.js
 *          │
 *          ├── veículos
 *          ├── empregados
 *          ├── lançamentos
 *          └── dashboard
 *
 * ============================================================
 */

console.log(
    "APP → INICIANDO PAINEL FROTA"
);


/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */

const APP_CONFIG = {

    /*
     * Página padrão.
     */

    paginaPadrao: "veiculos",

    /*
     * Container principal da aplicação.
     */

    container: "#app"

};


/* ============================================================
   ESTADO
   ============================================================ */

const APP_STATE = {

    iniciado: false,

    pagina: null,

    modulo: null

};


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

async function iniciarApp() {

    if (APP_STATE.iniciado) {

        console.warn(
            "APP → já iniciado"
        );

        return;
    }


    console.log(
        "APP → preparando aplicação"
    );


    /*
     * --------------------------------------------------------
     * VERIFICAR DOM
     * --------------------------------------------------------
     */

    if (
        document.readyState !== "complete" &&
        document.readyState !== "interactive"
    ) {

        await esperarDOMContentLoaded();

    }


    /*
     * --------------------------------------------------------
     * VERIFICAR CONTAINER
     * --------------------------------------------------------
     */

    const container =
        document.querySelector(
            APP_CONFIG.container
        );


    if (!container) {

        console.error(
            "APP → #app não encontrado"
        );

        return;
    }


    /*
     * --------------------------------------------------------
     * DETECTAR PÁGINA
     * --------------------------------------------------------
     */

    const pagina =
        detectarPagina();


    APP_STATE.pagina =
        pagina;


    console.log(
        "APP → PÁGINA:",
        pagina
    );


    /*
     * --------------------------------------------------------
     * CARREGAR MÓDULO
     * --------------------------------------------------------
     */

    try {

        const modulo =
            await carregarModulo(
                pagina
            );


        if (!modulo) {

            throw new Error(
                `Módulo "${pagina}" não retornou conteúdo.`
            );

        }


        APP_STATE.modulo =
            modulo;


        APP_STATE.iniciado =
            true;


        console.log(
            "APP → INICIADO",
            {
                pagina,
                modulo
            }
        );


    } catch (erro) {

        console.error(
            "APP → ERRO AO INICIAR:",
            erro
        );


        mostrarErroAplicacao(
            erro
        );

    }

}


/* ============================================================
   DOM CONTENT LOADED
   ============================================================ */

function esperarDOMContentLoaded() {

    return new Promise(
        resolve => {

            document.addEventListener(
                "DOMContentLoaded",
                resolve,
                {
                    once: true
                }
            );

        }
    );

}


/* ============================================================
   DETECTAR PÁGINA
   ============================================================ */

function detectarPagina() {

    /*
     * --------------------------------------------------------
     * 1. data-page
     * --------------------------------------------------------
     *
     * Exemplo:
     *
     * <body data-page="veiculos">
     */

    const body =
        document.body;


    if (body) {

        const dataPage =
            body.dataset.page;


        if (dataPage) {

            return normalizarPagina(
                dataPage
            );

        }

    }


    /*
     * --------------------------------------------------------
     * 2. data-module
     * --------------------------------------------------------
     *
     * Exemplo:
     *
     * <body data-module="veiculos">
     */

    if (body) {

        const dataModule =
            body.dataset.module;


        if (dataModule) {

            return normalizarPagina(
                dataModule
            );

        }

    }


    /*
     * --------------------------------------------------------
     * 3. URL
     * --------------------------------------------------------
     *
     * /veiculos.html
     * /empregados.html
     * /lancamentos.html
     * /dashboard.html
     */

    const caminho =
        window.location.pathname
            .toLowerCase();


    if (
        caminho.includes(
            "empregados"
        )
    ) {

        return "empregados";

    }


    if (
        caminho.includes(
            "lancamentos"
        )
    ) {

        return "lancamentos";

    }


    if (
        caminho.includes(
            "dashboard"
        )
    ) {

        return "dashboard";

    }


    if (
        caminho.includes(
            "veiculos"
        )
    ) {

        return "veiculos";

    }


    /*
     * --------------------------------------------------------
     * 4. PÁGINA PADRÃO
     * --------------------------------------------------------
     */

    return APP_CONFIG.paginaPadrao;

}


/* ============================================================
   NORMALIZAR PÁGINA
   ============================================================ */

function normalizarPagina(
    pagina
) {

    return String(
        pagina || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            ".html",
            ""
        );

}


/* ============================================================
   CARREGAR MÓDULO
   ============================================================ */

async function carregarModulo(
    pagina
) {

    console.log(
        `APP → CARREGANDO MÓDULO: ${pagina}`
    );


    switch (pagina) {


        /* ====================================================
           VEÍCULOS
           ==================================================== */

        case "veiculos": {

            const modulo =
                await import(
                    "./pages/veiculos.js"
                );


            console.log(
                "APP → VEÍCULOS CARREGADO"
            );


            /*
             * O page module pode:
             *
             * 1. exportar uma função iniciar
             * 2. exportar um módulo pronto
             * 3. executar sua inicialização no próprio arquivo
             */

            return await executarModulo(
                modulo,
                "veiculos"
            );

        }


        /* ====================================================
           EMPREGADOS
           ==================================================== */

        case "empregados": {

            const modulo =
                await import(
                    "./pages/empregados.js"
                );


            console.log(
                "APP → EMPREGADOS CARREGADO"
            );


            return await executarModulo(
                modulo,
                "empregados"
            );

        }


        /* ====================================================
           LANÇAMENTOS
           ==================================================== */

        case "lancamentos": {

            const modulo =
                await import(
                    "./pages/lancamentos.js"
                );


            console.log(
                "APP → LANÇAMENTOS CARREGADO"
            );


            return await executarModulo(
                modulo,
                "lancamentos"
            );

        }


        /* ====================================================
           DASHBOARD
           ==================================================== */

        case "dashboard": {

            const modulo =
                await import(
                    "./pages/dashboard.js"
                );


            console.log(
                "APP → DASHBOARD CARREGADO"
            );


            return await executarModulo(
                modulo,
                "dashboard"
            );

        }


        /* ====================================================
           DESCONHECIDO
           ==================================================== */

        default:

            throw new Error(
                `Página não reconhecida: ${pagina}`
            );

    }

}


/* ============================================================
   EXECUTAR MÓDULO
   ============================================================ */

async function executarModulo(
    modulo,
    nome
) {

    if (!modulo) {

        throw new Error(
            `Módulo "${nome}" não carregado.`
        );

    }


    /*
     * --------------------------------------------------------
     * PADRÃO 1
     *
     * export function iniciar()
     * --------------------------------------------------------
     */

    if (
        typeof modulo.iniciar ===
        "function"
    ) {

        console.log(
            `APP → ${nome} → iniciar()`
        );


        return await modulo.iniciar();

    }


    /*
     * --------------------------------------------------------
     * PADRÃO 2
     *
     * export function init()
     * --------------------------------------------------------
     */

    if (
        typeof modulo.init ===
        "function"
    ) {

        console.log(
            `APP → ${nome} → init()`
        );


        return await modulo.init();

    }


    /*
     * --------------------------------------------------------
     * PADRÃO 3
     *
     * export default
     * --------------------------------------------------------
     */

    if (
        modulo.default !==
        undefined
    ) {

        const padrao =
            modulo.default;


        if (
            typeof padrao ===
            "function"
        ) {

            console.log(
                `APP → ${nome} → default()`
            );


            return await padrao();

        }


        return padrao;

    }


    /*
     * --------------------------------------------------------
     * O módulo já executou sua inicialização.
     * --------------------------------------------------------
     */

    console.log(
        `APP → ${nome} → módulo carregado`
    );


    return modulo;

}


/* ============================================================
   ERRO DA APLICAÇÃO
   ============================================================ */

function mostrarErroAplicacao(
    erro
) {

    const container =
        document.querySelector(
            APP_CONFIG.container
        );


    if (!container) {
        return;
    }


    const mensagem =
        erro instanceof Error
            ? erro.message
            : String(erro);


    container.innerHTML = `

        <div class="engine-error">

            <div class="engine-error-icon">
                ⚠
            </div>

            <h2>
                Erro ao carregar a aplicação
            </h2>

            <p>
                ${escaparHTMLApp(
                    mensagem
                )}
            </p>

            <button
                type="button"
                class="btn btn-primary"
                id="btnRecarregarApp"
            >
                Recarregar
            </button>

        </div>

    `;


    const botao =
        document.querySelector(
            "#btnRecarregarApp"
        );


    if (botao) {

        botao.addEventListener(
            "click",
            () => {

                window.location.reload();

            }
        );

    }

}


/* ============================================================
   ESCAPAR HTML
   ============================================================ */

function escaparHTMLApp(
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


/* ============================================================
   INICIAR
   ============================================================ */

iniciarApp();
```
```javascript
/**
 * ============================================================
 * APP
 * Painel Frota
 *
 * Arquivo:
 *     js/app.js
 *
 * Responsabilidades:
 *
 * - Inicializar a aplicação
 * - Detectar a página atual
 * - Carregar o módulo correspondente
 * - Não utilizar localStorage
 * - Não utilizar sessionStorage
 * - Não depender de scripts externos
 *
 * Arquitetura:
 *
 *     index.html
 *          │
 *          ▼
 *       app.js
 *          │
 *          ├── veículos
 *          ├── empregados
 *          ├── lançamentos
 *          └── dashboard
 *
 * ============================================================
 */

console.log(
    "APP → INICIANDO PAINEL FROTA"
);


/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */

const APP_CONFIG = {

    /*
     * Página padrão.
     */

    paginaPadrao: "veiculos",

    /*
     * Container principal da aplicação.
     */

    container: "#app"

};


/* ============================================================
   ESTADO
   ============================================================ */

const APP_STATE = {

    iniciado: false,

    pagina: null,

    modulo: null

};


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

async function iniciarApp() {

    if (APP_STATE.iniciado) {

        console.warn(
            "APP → já iniciado"
        );

        return;
    }


    console.log(
        "APP → preparando aplicação"
    );


    /*
     * --------------------------------------------------------
     * VERIFICAR DOM
     * --------------------------------------------------------
     */

    if (
        document.readyState !== "complete" &&
        document.readyState !== "interactive"
    ) {

        await esperarDOMContentLoaded();

    }


    /*
     * --------------------------------------------------------
     * VERIFICAR CONTAINER
     * --------------------------------------------------------
     */

    const container =
        document.querySelector(
            APP_CONFIG.container
        );


    if (!container) {

        console.error(
            "APP → #app não encontrado"
        );

        return;
    }


    /*
     * --------------------------------------------------------
     * DETECTAR PÁGINA
     * --------------------------------------------------------
     */

    const pagina =
        detectarPagina();


    APP_STATE.pagina =
        pagina;


    console.log(
        "APP → PÁGINA:",
        pagina
    );


    /*
     * --------------------------------------------------------
     * CARREGAR MÓDULO
     * --------------------------------------------------------
     */

    try {

        const modulo =
            await carregarModulo(
                pagina
            );


        if (!modulo) {

            throw new Error(
                `Módulo "${pagina}" não retornou conteúdo.`
            );

        }


        APP_STATE.modulo =
            modulo;


        APP_STATE.iniciado =
            true;


        console.log(
            "APP → INICIADO",
            {
                pagina,
                modulo
            }
        );


    } catch (erro) {

        console.error(
            "APP → ERRO AO INICIAR:",
            erro
        );


        mostrarErroAplicacao(
            erro
        );

    }

}


/* ============================================================
   DOM CONTENT LOADED
   ============================================================ */

function esperarDOMContentLoaded() {

    return new Promise(
        resolve => {

            document.addEventListener(
                "DOMContentLoaded",
                resolve,
                {
                    once: true
                }
            );

        }
    );

}


/* ============================================================
   DETECTAR PÁGINA
   ============================================================ */

function detectarPagina() {

    /*
     * --------------------------------------------------------
     * 1. data-page
     * --------------------------------------------------------
     *
     * Exemplo:
     *
     * <body data-page="veiculos">
     */

    const body =
        document.body;


    if (body) {

        const dataPage =
            body.dataset.page;


        if (dataPage) {

            return normalizarPagina(
                dataPage
            );

        }

    }


    /*
     * --------------------------------------------------------
     * 2. data-module
     * --------------------------------------------------------
     *
     * Exemplo:
     *
     * <body data-module="veiculos">
     */

    if (body) {

        const dataModule =
            body.dataset.module;


        if (dataModule) {

            return normalizarPagina(
                dataModule
            );

        }

    }


    /*
     * --------------------------------------------------------
     * 3. URL
     * --------------------------------------------------------
     *
     * /veiculos.html
     * /empregados.html
     * /lancamentos.html
     * /dashboard.html
     */

    const caminho =
        window.location.pathname
            .toLowerCase();


    if (
        caminho.includes(
            "empregados"
        )
    ) {

        return "empregados";

    }


    if (
        caminho.includes(
            "lancamentos"
        )
    ) {

        return "lancamentos";

    }


    if (
        caminho.includes(
            "dashboard"
        )
    ) {

        return "dashboard";

    }


    if (
        caminho.includes(
            "veiculos"
        )
    ) {

        return "veiculos";

    }


    /*
     * --------------------------------------------------------
     * 4. PÁGINA PADRÃO
     * --------------------------------------------------------
     */

    return APP_CONFIG.paginaPadrao;

}


/* ============================================================
   NORMALIZAR PÁGINA
   ============================================================ */

function normalizarPagina(
    pagina
) {

    return String(
        pagina || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            ".html",
            ""
        );

}


/* ============================================================
   CARREGAR MÓDULO
   ============================================================ */

async function carregarModulo(
    pagina
) {

    console.log(
        `APP → CARREGANDO MÓDULO: ${pagina}`
    );


    switch (pagina) {


        /* ====================================================
           VEÍCULOS
           ==================================================== */

        case "veiculos": {

            const modulo =
                await import(
                    "./pages/veiculos.js"
                );


            console.log(
                "APP → VEÍCULOS CARREGADO"
            );


            /*
             * O page module pode:
             *
             * 1. exportar uma função iniciar
             * 2. exportar um módulo pronto
             * 3. executar sua inicialização no próprio arquivo
             */

            return await executarModulo(
                modulo,
                "veiculos"
            );

        }


        /* ====================================================
           EMPREGADOS
           ==================================================== */

        case "empregados": {

            const modulo =
                await import(
                    "./pages/empregados.js"
                );


            console.log(
                "APP → EMPREGADOS CARREGADO"
            );


            return await executarModulo(
                modulo,
                "empregados"
            );

        }


        /* ====================================================
           LANÇAMENTOS
           ==================================================== */

        case "lancamentos": {

            const modulo =
                await import(
                    "./pages/lancamentos.js"
                );


            console.log(
                "APP → LANÇAMENTOS CARREGADO"
            );


            return await executarModulo(
                modulo,
                "lancamentos"
            );

        }


        /* ====================================================
           DASHBOARD
           ==================================================== */

        case "dashboard": {

            const modulo =
                await import(
                    "./pages/dashboard.js"
                );


            console.log(
                "APP → DASHBOARD CARREGADO"
            );


            return await executarModulo(
                modulo,
                "dashboard"
            );

        }


        /* ====================================================
           DESCONHECIDO
           ==================================================== */

        default:

            throw new Error(
                `Página não reconhecida: ${pagina}`
            );

    }

}


/* ============================================================
   EXECUTAR MÓDULO
   ============================================================ */

async function executarModulo(
    modulo,
    nome
) {

    if (!modulo) {

        throw new Error(
            `Módulo "${nome}" não carregado.`
        );

    }


    /*
     * --------------------------------------------------------
     * PADRÃO 1
     *
     * export function iniciar()
     * --------------------------------------------------------
     */

    if (
        typeof modulo.iniciar ===
        "function"
    ) {

        console.log(
            `APP → ${nome} → iniciar()`
        );


        return await modulo.iniciar();

    }


    /*
     * --------------------------------------------------------
     * PADRÃO 2
     *
     * export function init()
     * --------------------------------------------------------
     */

    if (
        typeof modulo.init ===
        "function"
    ) {

        console.log(
            `APP → ${nome} → init()`
        );


        return await modulo.init();

    }


    /*
     * --------------------------------------------------------
     * PADRÃO 3
     *
     * export default
     * --------------------------------------------------------
     */

    if (
        modulo.default !==
        undefined
    ) {

        const padrao =
            modulo.default;


        if (
            typeof padrao ===
            "function"
        ) {

            console.log(
                `APP → ${nome} → default()`
            );


            return await padrao();

        }


        return padrao;

    }


    /*
     * --------------------------------------------------------
     * O módulo já executou sua inicialização.
     * --------------------------------------------------------
     */

    console.log(
        `APP → ${nome} → módulo carregado`
    );


    return modulo;

}


/* ============================================================
   ERRO DA APLICAÇÃO
   ============================================================ */

function mostrarErroAplicacao(
    erro
) {

    const container =
        document.querySelector(
            APP_CONFIG.container
        );


    if (!container) {
        return;
    }


    const mensagem =
        erro instanceof Error
            ? erro.message
            : String(erro);


    container.innerHTML = `

        <div class="engine-error">

            <div class="engine-error-icon">
                ⚠
            </div>

            <h2>
                Erro ao carregar a aplicação
            </h2>

            <p>
                ${escaparHTMLApp(
                    mensagem
                )}
            </p>

            <button
                type="button"
                class="btn btn-primary"
                id="btnRecarregarApp"
            >
                Recarregar
            </button>

        </div>

    `;


    const botao =
        document.querySelector(
            "#btnRecarregarApp"
        );


    if (botao) {

        botao.addEventListener(
            "click",
            () => {

                window.location.reload();

            }
        );

    }

}


/* ============================================================
   ESCAPAR HTML
   ============================================================ */

function escaparHTMLApp(
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


/* ============================================================
   INICIAR
   ============================================================ */

iniciarApp();
