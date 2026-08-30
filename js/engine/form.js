/**
 * ============================================================
 * FORM
 * Painel Frota
 *
 * Responsabilidades:
 *
 * - Localizar formulário
 * - Abrir formulário
 * - Fechar formulário
 * - Limpar formulário
 * - Preencher formulário
 * - Ler dados
 * - Salvar
 * - Cancelar
 *
 * NÃO conhece:
 * - Supabase
 * - PostgreSQL
 * - CRUD
 * - tabela
 * - toolbar
 * ============================================================
 */


/**
 * ============================================================
 * CREATE FORM
 * ============================================================
 */

export function createForm(config = {}) {

    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    const moduleContainer =
        config.container || null;

    const engine =
        config.engine || null;

    const schema =
        config.schema || {};

    const options =
        config.options || {};


    // ========================================================
    // VARIÁVEIS INTERNAS
    // ========================================================

    let container = null;

    let formulario = null;

    let btnSalvar = null;

    let btnCancelar = null;

    let eventosRegistrados = false;


    // ========================================================
    // VALIDAR
    // ========================================================

    if (!moduleContainer) {

        throw new Error(
            "Form: container não informado."
        );

    }


    if (!engine) {

        throw new Error(
            "Form: engine não informado."
        );

    }


    // ========================================================
    // INICIAR
    // ========================================================

    async function iniciar() {

        console.log(
            `FORM ${engine.entity} → INICIAR`
        );


        localizarContainer();

        criarFormularioSeNecessario();

        localizarFormulario();

        registrarEventos();


        esconder();


        console.log(
            `FORM ${engine.entity} → INICIADO`
        );

    }


    // ========================================================
    // LOCALIZAR CONTAINER
    // ========================================================

    function localizarContainer() {

        container =
            moduleContainer.querySelector(
                "[data-engine-form]"
            );


        if (!container) {

            throw new Error(
                `Form ${engine.entity}: ` +
                "elemento [data-engine-form] não encontrado."
            );

        }

    }


    // ========================================================
    // CRIAR FORMULÁRIO
    // ========================================================

    function criarFormularioSeNecessario() {

        if (!container) {

            return;

        }


        /*
         * Se o module.js ou o HTML já criou
         * um formulário, não substituir.
         */

        if (
            container.querySelector("form")
        ) {

            return;

        }


        const titulo =
            options.tituloFormulario ||
            "Cadastro";


        const campos =
            Array.isArray(schema.fields)
                ? schema.fields
                : [];


        let camposHTML = "";


        campos.forEach(
            campo => {

                /*
                 * ID não aparece no formulário.
                 */

                if (
                    campo?.name === "ID" ||
                    campo?.name === "id"
                ) {

                    return;

                }


                if (
                    campo?.hidden === true
                ) {

                    return;

                }


                camposHTML +=
                    criarCampoHTML(
                        campo
                    );

            }
        );


        container.innerHTML = `

            <form
                class="engine-form"
                data-engine-formulario
                novalidate
            >

                <div class="engine-form-header">

                    <h2 data-engine-form-title>
                        ${escaparHTML(titulo)}
                    </h2>

                </div>


                <div class="engine-form-fields">

                    ${camposHTML}

                </div>


                <div class="engine-form-actions">

                    <button
                        type="submit"
                        class="btn btn-primary"
                        data-engine-salvar
                    >
                        Salvar
                    </button>


                    <button
                        type="button"
                        class="btn btn-secondary"
                        data-engine-cancelar
                    >
                        Cancelar
                    </button>

                </div>

            </form>

        `;

    }


    // ========================================================
    // CRIAR CAMPO
    // ========================================================

    function criarCampoHTML(
        campo
    ) {

        const nome =
            campo?.name ||
            campo?.campo ||
            "";


        if (!nome) {

            return "";

        }


        const label =
            campo?.label ||
            campo?.titulo ||
            nome;


        const tipo =
            campo?.type ||
            campo?.tipo ||
            "text";


        const obrigatorio =
            campo?.required === true ||
            campo?.obrigatorio === true;


        const required =
            obrigatorio
                ? "required"
                : "";


        const placeholder =
            campo?.placeholder ||
            "";


        // ====================================================
        // SELECT
        // ====================================================

        if (
            tipo === "select"
        ) {

            const opcoes =
                Array.isArray(
                    campo.options
                )
                    ? campo.options
                    : [];


            const optionsHTML =
                opcoes
                    .map(
                        opcao => {

                            const value =
                                typeof opcao ===
                                "object"

                                    ? opcao.value
                                    : opcao;


                            const texto =
                                typeof opcao ===
                                "object"

                                    ? (
                                        opcao.label ??
                                        opcao.text ??
                                        opcao.value
                                    )

                                    : opcao;


                            return `

                                <option
                                    value="${escaparAtributo(value)}"
                                >
                                    ${escaparHTML(texto)}
                                </option>

                            `;

                        }
                    )
                    .join("");


            return `

                <div class="engine-field">

                    <label
                        for="engine-${escaparAtributo(nome)}"
                    >
                        ${escaparHTML(label)}
                    </label>


                    <select
                        id="engine-${escaparAtributo(nome)}"
                        name="${escaparAtributo(nome)}"
                        ${required}
                    >

                        <option value="">
                            Selecione...
                        </option>

                        ${optionsHTML}

                    </select>

                </div>

            `;

        }


        // ====================================================
        // CHECKBOX
        // ====================================================

        if (
            tipo === "checkbox" ||
            tipo === "boolean"
        ) {

            return `

                <div class="engine-field engine-field-checkbox">

                    <label>

                        <input
                            type="checkbox"
                            name="${escaparAtributo(nome)}"
                            value="true"
                        >

                        ${escaparHTML(label)}

                    </label>

                </div>

            `;

        }


        // ====================================================
        // TEXTAREA
        // ====================================================

        if (
            tipo === "textarea"
        ) {

            return `

                <div class="engine-field">

                    <label
                        for="engine-${escaparAtributo(nome)}"
                    >
                        ${escaparHTML(label)}
                    </label>

                    <textarea
                        id="engine-${escaparAtributo(nome)}"
                        name="${escaparAtributo(nome)}"
                        placeholder="${escaparAtributo(placeholder)}"
                        ${required}
                    ></textarea>

                </div>

            `;

        }


        // ====================================================
        // INPUT
        // ====================================================

        return `

            <div class="engine-field">

                <label
                    for="engine-${escaparAtributo(nome)}"
                >
                    ${escaparHTML(label)}
                </label>


                <input
                    id="engine-${escaparAtributo(nome)}"
                    type="${escaparAtributo(tipo)}"
                    name="${escaparAtributo(nome)}"
                    placeholder="${escaparAtributo(placeholder)}"
                    ${required}
                >

            </div>

        `;

    }


    // ========================================================
    // LOCALIZAR FORMULÁRIO
    // ========================================================

    function localizarFormulario() {

        formulario =
            container?.querySelector(
                "form"
            );


        if (!formulario) {

            throw new Error(
                `Form ${engine.entity}: ` +
                "elemento <form> não encontrado."
            );

        }


        btnSalvar =
            formulario.querySelector(
                "[data-engine-salvar]"
            );


        btnCancelar =
            formulario.querySelector(
                "[data-engine-cancelar]"
            );

    }


    // ========================================================
    // REGISTRAR EVENTOS
    // ========================================================

    function registrarEventos() {

        /*
         * Proteção contra registro duplicado.
         */

        if (
            eventosRegistrados
        ) {

            return;

        }


        if (!formulario) {

            return;

        }


        eventosRegistrados =
            true;


        // ====================================================
        // SUBMIT
        // ====================================================

        formulario.addEventListener(
            "submit",
            async evento => {

                evento.preventDefault();

                evento.stopPropagation();


                /*
                 * Impedir duplo salvamento.
                 */

                if (
                    engine.state?.salvando
                ) {

                    console.warn(
                        `FORM ${engine.entity} → ` +
                        "SALVAMENTO JÁ EM ANDAMENTO"
                    );

                    return;

                }


                try {

                    const dados =
                        obterDados();


                    console.log(
                        `FORM ${engine.entity} → ` +
                        "DADOS PARA SALVAR:",
                        dados
                    );


                    await engine.salvar(
                        dados
                    );


                } catch (erro) {

                    console.error(
                        `FORM ${engine.entity} → ` +
                        "ERRO AO SALVAR:",
                        erro
                    );

                }

            }
        );


        // ====================================================
        // CANCELAR
        // ====================================================

        if (btnCancelar) {

            btnCancelar.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();

                    engine.fecharFormulario();

                }
            );

        }

    }


    // ========================================================
    // OBTER DADOS
    // ========================================================

    function obterDados() {

        const dados = {};


        if (!formulario) {

            return dados;

        }


        const elementos =
            formulario.querySelectorAll(
                "[name]"
            );


        elementos.forEach(
            campo => {

                const nome =
                    campo.name;


                if (!nome) {

                    return;

                }


                if (
                    campo.type ===
                    "checkbox"
                ) {

                    dados[nome] =
                        campo.checked;

                    return;

                }


                dados[nome] =
                    campo.value;

            }
        );


        return dados;

    }


    // ========================================================
    // PREENCHER
    // ========================================================

    function preencher(
        registro = {}
    ) {

        if (!formulario) {

            return;

        }


        Object.entries(
            registro
        )
        .forEach(
            ([nome, valor]) => {

                const campo =
                    formulario.querySelector(
                        `[name="${cssEscape(nome)}"]`
                    );


                if (!campo) {

                    return;

                }


                if (
                    campo.type ===
                    "checkbox"
                ) {

                    campo.checked =
                        Boolean(valor);

                } else {

                    campo.value =
                        valor ?? "";

                }

            }
        );

    }


    // ========================================================
    // LIMPAR
    // ========================================================

    function limpar() {

        if (!formulario) {

            return;

        }


        formulario.reset();

    }


    // ========================================================
    // MOSTRAR
    // ========================================================

    function mostrar() {

        if (!container) {

            return;

        }


        container.hidden =
            false;


        container.style.display =
            "";

    }


    // ========================================================
    // ESCONDER
    // ========================================================

    function esconder() {

        if (!container) {

            return;

        }


        container.hidden =
            true;

    }


    // ========================================================
    // NOVO
    // ========================================================

    function novo() {

        limpar();

        mostrar();


        definirTitulo(
            options.tituloNovo ||
            "Novo veículo"
        );

    }


    // ========================================================
    // EDITAR
    // ========================================================

    function editar(
        registro
    ) {

        limpar();

        preencher(
            registro
        );

        mostrar();


        definirTitulo(
            options.tituloEditar ||
            "Editar veículo"
        );

    }


    // ========================================================
    // TÍTULO
    // ========================================================

    function definirTitulo(
        titulo
    ) {

        const elemento =
            formulario?.querySelector(
                "[data-engine-form-title]"
            );


        if (elemento) {

            elemento.textContent =
                titulo;

        }

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
    // CSS ESCAPE
    // ========================================================

    function cssEscape(
        valor
    ) {

        if (
            window.CSS &&
            typeof window.CSS.escape ===
            "function"
        ) {

            return window.CSS.escape(
                valor
            );

        }


        return String(
            valor
        )
        .replace(
            /["\\]/g,
            "\\$&"
        );

    }


    // ========================================================
    // API PÚBLICA
    // ========================================================

    return {

        iniciar,

        mostrar,

        esconder,

        limpar,

        preencher,

        obterDados,

        novo,

        editar

    };

}
