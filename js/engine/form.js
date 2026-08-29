/**
 * ============================================================
 * FORM
 * Painel Frota
 * Arquivo: form.js
 *
 * Responsabilidade:
 *
 * - Criar formulário
 * - Abrir formulário
 * - Fechar formulário
 * - Novo registro
 * - Editar registro
 * - Preencher formulário
 * - Ler formulário
 * - Validar formulário
 * - Salvar registro
 * - Cancelar edição
 *
 * Este arquivo NÃO conhece:
 *
 * - PostgreSQL
 * - Supabase
 * - Google Sheets
 * - API diretamente
 *
 * A comunicação acontece através do:
 *
 *     engine.salvar()
 *     engine.editar()
 *
 * ============================================================
 */


// ============================================================
// CREATE FORM
// ============================================================

export function createForm(config = {}) {

    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    const entity =
        config.entity || "";

    const schema =
        config.schema || null;

    const container =
        config.container || null;

    const state =
        config.state || null;

    const engine =
        config.engine || null;

    const options =
        config.options || {};


    // ========================================================
    // VALIDAR
    // ========================================================

    if (!container) {

        throw new Error(
            `Form ${entity}: container não informado.`
        );

    }

    if (!state) {

        throw new Error(
            `Form ${entity}: state não informado.`
        );

    }

    if (!engine) {

        throw new Error(
            `Form ${entity}: engine não informado.`
        );

    }


    // ========================================================
    // ELEMENTOS
    // ========================================================

    let formContainer = null;

    let form = null;


    // ========================================================
    // API PÚBLICA
    // ========================================================

    const api = {

        entity,

        schema,

        container,

        state,

        engine,

        options,

        iniciar,

        destruir,

        novo,

        editar,

        salvar,

        cancelar,

        abrir,

        fechar,

        limpar,

        preencher,

        obterDados,

        validar

    };


    // ========================================================
    // INICIAR
    // ========================================================

    function iniciar() {

        localizarContainer();

        registrarEventos();

        /*
         * O formulário começa fechado.
         */

        fechar();

        return api;

    }


    // ========================================================
    // LOCALIZAR CONTAINER
    // ========================================================

    function localizarContainer() {

        formContainer =
            container.querySelector(
                "[data-engine-form]"
            );


        if (!formContainer) {

            throw new Error(
                `Form ${entity}: elemento [data-engine-form] não encontrado.`
            );

        }

    }


    // ========================================================
    // CRIAR FORMULÁRIO
    // ========================================================

    function criarFormulario() {

        if (!formContainer) {
            localizarContainer();
        }


        /*
         * Se o módulo já forneceu um formulário,
         * usamos o formulário existente.
         */

        form =
            formContainer.querySelector(
                "form"
            );


        if (form) {

            return form;

        }


        /*
         * Se não existe formulário,
         * criamos automaticamente com o Schema.
         */

        formContainer.innerHTML =
            montarHTMLFormulario();


        form =
            formContainer.querySelector(
                "form"
            );


        if (!form) {

            throw new Error(
                `Form ${entity}: não foi possível criar o formulário.`
            );

        }


        return form;

    }


    // ========================================================
    // MONTAR HTML
    // ========================================================

    function montarHTMLFormulario() {

        const tituloNovo =
            options.tituloNovo ||
            "Novo registro";

        const tituloEditar =
            options.tituloEditar ||
            "Editar registro";


        return `

            <div class="engine-form">

                <div class="engine-form-header">

                    <h2
                        data-form-titulo
                    >
                        ${escaparHTML(
                            tituloNovo
                        )}
                    </h2>

                </div>


                <form
                    data-engine-formulario
                    novalidate
                >

                    <div
                        class="engine-form-fields"
                        data-form-fields
                    >

                        ${montarCampos()}

                    </div>


                    <div class="engine-form-actions">

                        <button
                            type="submit"
                            data-form-salvar
                        >
                            Salvar
                        </button>


                        <button
                            type="button"
                            data-form-cancelar
                        >
                            Cancelar
                        </button>

                    </div>

                </form>

            </div>

        `;

    }


    // ========================================================
    // MONTAR CAMPOS
    // ========================================================

    function montarCampos() {

        if (
            !schema ||
            !Array.isArray(
                schema.fields
            )
        ) {

            return `

                <div class="engine-form-empty">

                    Schema não possui campos.

                </div>

            `;

        }


        return schema.fields

            .filter(
                campo =>

                    campo.hidden !== true &&

                    campo.form !== false &&

                    campo.name !== "id"

            )

            .map(
                campo =>
                    montarCampo(
                        campo
                    )
            )

            .join("");

    }


    // ========================================================
    // MONTAR CAMPO
    // ========================================================

    function montarCampo(
        campo
    ) {

        const nome =
            campo.name;

        const label =
            campo.label ||
            campo.titulo ||
            nome;

        const tipo =
            campo.type ||
            campo.tipo ||
            "text";

        const required =
            campo.required === true;


        const atributoRequired =
            required
                ? "required"
                : "";


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


            const htmlOpcoes =
                opcoes
                    .map(
                        opcao => {

                            const valor =
                                typeof opcao === "object"

                                    ? (
                                        opcao.value ??
                                        opcao.id ??
                                        ""
                                    )

                                    : opcao;


                            const texto =
                                typeof opcao === "object"

                                    ? (
                                        opcao.label ??
                                        opcao.text ??
                                        valor
                                    )

                                    : opcao;


                            return `

                                <option
                                    value="${escaparAtributo(
                                        valor
                                    )}"
                                >
                                    ${escaparHTML(
                                        texto
                                    )}
                                </option>

                            `;

                        }
                    )
                    .join("");


            return `

                <div class="engine-field">

                    <label
                        for="field-${escaparAtributo(
                            nome
                        )}"
                    >
                        ${escaparHTML(
                            label
                        )}
                    </label>


                    <select
                        id="field-${escaparAtributo(
                            nome
                        )}"
                        name="${escaparAtributo(
                            nome
                        )}"
                        ${atributoRequired}
                    >

                        <option value="">
                            Selecione...
                        </option>

                        ${htmlOpcoes}

                    </select>

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
                        for="field-${escaparAtributo(
                            nome
                        )}"
                    >
                        ${escaparHTML(
                            label
                        )}
                    </label>


                    <textarea
                        id="field-${escaparAtributo(
                            nome
                        )}"
                        name="${escaparAtributo(
                            nome
                        )}"
                        ${atributoRequired}
                    ></textarea>

                </div>

            `;

        }


        // ====================================================
        // CHECKBOX
        // ====================================================

        if (
            tipo === "boolean" ||
            tipo === "checkbox"
        ) {

            return `

                <div class="engine-field engine-field-checkbox">

                    <label>

                        <input
                            type="checkbox"
                            name="${escaparAtributo(
                                nome
                            )}"
                        >

                        ${escaparHTML(
                            label
                        )}

                    </label>

                </div>

            `;

        }


        // ====================================================
        // INPUT PADRÃO
        // ====================================================

        return `

            <div class="engine-field">

                <label
                    for="field-${escaparAtributo(
                        nome
                    )}"
                >
                    ${escaparHTML(
                        label
                    )}
                </label>


                <input
                    id="field-${escaparAtributo(
                        nome
                    )}"
                    type="${escaparAtributo(
                        converterTipoInput(
                            tipo
                        )
                    )}"
                    name="${escaparAtributo(
                        nome
                    )}"
                    ${atributoRequired}
                >

            </div>

        `;

    }


    // ========================================================
    // CONVERTER TIPO
    // ========================================================

    function converterTipoInput(
        tipo
    ) {

        const tipos = {

            string: "text",

            text: "text",

            number: "number",

            integer: "number",

            decimal: "number",

            date: "date",

            datetime: "datetime-local",

            time: "time",

            email: "email",

            password: "password",

            url: "url"

        };


        return (
            tipos[tipo] ||
            "text"
        );

    }


    // ========================================================
    // EVENTOS
    // ========================================================

    function registrarEventos() {

        if (!formContainer) {
            return;
        }


        /*
         * Delegação de eventos.
         */

        formContainer.addEventListener(
            "submit",
            evento => {

                const formulario =
                    evento.target.closest(
                        "form"
                    );


                if (!formulario) {
                    return;
                }


                evento.preventDefault();


                salvar();

            }
        );


        formContainer.addEventListener(
            "click",
            evento => {

                const cancelarBotao =
                    evento.target.closest(
                        "[data-form-cancelar]"
                    );


                if (cancelarBotao) {

                    evento.preventDefault();

                    cancelar();

                }

            }
        );

    }


    // ========================================================
    // NOVO
    // ========================================================

    function novo() {

        criarFormulario();


        state.registroEditando =
            null;


        limpar();


        definirTitulo(
            options.tituloNovo ||
            "Novo registro"
        );


        abrir();


        const primeiroCampo =
            obterPrimeiroCampo();


        if (primeiroCampo) {

            setTimeout(
                () => {

                    primeiroCampo.focus();

                },
                0
            );

        }


        emitirEvento(
            "novo"
        );


        return api;

    }


    // ========================================================
    // EDITAR
    // ========================================================

    async function editar(
        id
    ) {

        if (
            id === undefined ||
            id === null ||
            String(id).trim() === ""
        ) {

            throw new Error(
                "Form: ID não informado."
            );

        }


        criarFormulario();


        try {

            /*
             * O Engine é responsável por consultar
             * o backend.
             */

            const registro =
                await engine.obter(
                    String(id).trim()
                );


            if (!registro) {

                throw new Error(
                    `Registro ${id} não encontrado.`
                );

            }


            state.registroEditando =
                registro;


            limpar();


            preencher(
                registro
            );


            definirTitulo(
                options.tituloEditar ||
                "Editar registro"
            );


            abrir();


            emitirEvento(
                "editar",
                registro
            );


            return registro;

        } catch (erro) {

            console.error(
                `Form ${entity}: erro ao editar`,
                erro
            );

            mostrarErro(
                erro
            );

            throw erro;

        }

    }


    // ========================================================
    // SALVAR
    // ========================================================

    async function salvar() {

        criarFormulario();


        /*
         * Evita dois salvamentos simultâneos.
         */

        if (
            state.salvando
        ) {

            return;

        }


        const valido =
            validar();


        if (!valido) {

            return;

        }


        const dados =
            obterDados();


        console.log(
            `FORM ${entity} → DADOS PARA SALVAR:`,
            dados
        );


        try {

            state.salvando =
                true;


            /*
             * IMPORTANTE:
             *
             * Não chamamos Supabase.
             *
             * O Engine decide se será:
             *
             *     criar()
             *
             * ou
             *
             *     atualizar()
             */

            const resposta =
                await engine.salvar(
                    dados
                );


            state.registroEditando =
                null;


            limpar();

            fechar();


            emitirEvento(
                "salvo",
                resposta
            );


            return resposta;

        } catch (erro) {

            console.error(
                `Form ${entity}: erro ao salvar`,
                erro
            );

            mostrarErro(
                erro
            );

            throw erro;

        } finally {

            state.salvando =
                false;

        }

    }


    // ========================================================
    // CANCELAR
    // ========================================================

    function cancelar() {

        state.registroEditando =
            null;


        limpar();

        fechar();


        emitirEvento(
            "cancelado"
        );

    }


    // ========================================================
    // ABRIR
    // ========================================================

    function abrir() {

        criarFormulario();


        formContainer.hidden =
            false;


        formContainer.classList.add(
            "is-open"
        );

    }


    // ========================================================
    // FECHAR
    // ========================================================

    function fechar() {

        if (!formContainer) {
            return;
        }


        formContainer.hidden =
            true;


        formContainer.classList.remove(
            "is-open"
        );

    }


    // ========================================================
    // LIMPAR
    // ========================================================

    function limpar() {

        if (!form) {

            criarFormulario();

        }


        if (form) {

            form.reset();

        }

    }


    // ========================================================
    // PREENCHER
    // ========================================================

    function preencher(
        registro
    ) {

        if (!registro) {
            return;
        }


        if (!form) {

            criarFormulario();

        }


        Object.entries(
            registro
        )
        .forEach(
            ([nome, valor]) => {

                const campo =
                    form.querySelector(
                        `[name="${cssEscape(
                            nome
                        )}"]`
                    );


                if (!campo) {
                    return;
                }


                if (
                    campo.type ===
                    "checkbox"
                ) {

                    campo.checked =
                        Boolean(
                            valor
                        );

                } else {

                    campo.value =
                        valor ?? "";

                }

            }
        );

    }


    // ========================================================
    // OBTER DADOS
    // ========================================================

    function obterDados() {

        if (!form) {

            criarFormulario();

        }


        const dados = {};


        const campos =
            form.querySelectorAll(
                "input, select, textarea"
            );


        campos.forEach(
            campo => {

                if (
                    !campo.name
                ) {

                    return;

                }


                /*
                 * ID não deve ser enviado
                 * no cadastro de novo.
                 *
                 * Na edição o Engine já possui
                 * o registro original em state.
                 */

                if (
                    campo.name === "id"
                ) {

                    return;

                }


                // --------------------------------------------
                // CHECKBOX
                // --------------------------------------------

                if (
                    campo.type ===
                    "checkbox"
                ) {

                    dados[campo.name] =
                        campo.checked;

                    return;

                }


                // --------------------------------------------
                // RADIO
                // --------------------------------------------

                if (
                    campo.type ===
                    "radio"
                ) {

                    if (
                        campo.checked
                    ) {

                        dados[campo.name] =
                            campo.value;

                    }

                    return;

                }


                // --------------------------------------------
                // INPUT NORMAL
                // --------------------------------------------

                dados[campo.name] =
                    campo.value;

            }
        );


        return dados;

    }


    // ========================================================
    // VALIDAR
    // ========================================================

    function validar() {

        if (!form) {

            criarFormulario();

        }


        /*
         * Validação HTML5.
         */

        if (
            typeof form.checkValidity ===
            "function"
        ) {

            if (
                !form.checkValidity()
            ) {

                form.reportValidity();

                return false;

            }

        }


        return true;

    }


    // ========================================================
    // PRIMEIRO CAMPO
    // ========================================================

    function obterPrimeiroCampo() {

        if (!form) {
            return null;
        }


        return form.querySelector(
            "input:not([type='hidden']), select, textarea"
        );

    }


    // ========================================================
    // TÍTULO
    // ========================================================

    function definirTitulo(
        titulo
    ) {

        if (!formContainer) {
            return;
        }


        const elemento =
            formContainer.querySelector(
                "[data-form-titulo]"
            );


        if (elemento) {

            elemento.textContent =
                titulo;

        }

    }


    // ========================================================
    // EVENTO
    // ========================================================

    function emitirEvento(
        nome,
        detalhe
    ) {

        if (!container) {
            return;
        }


        container.dispatchEvent(

            new CustomEvent(
                `form:${nome}`,
                {
                    detail: detalhe
                }
            )

        );

    }


    // ========================================================
    // ERRO
    // ========================================================

    function mostrarErro(
        erro
    ) {

        const mensagem =
            erro?.message ||
            "Ocorreu um erro.";


        if (
            typeof window.mostrarToast ===
            "function"
        ) {

            window.mostrarToast(
                mensagem,
                "erro"
            );

            return;

        }


        console.error(
            erro
        );

        window.alert(
            mensagem
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
    // DESTRUIR
    // ========================================================

    function destruir() {

        /*
         * O container é administrado pelo Module.
         *
         * Não removemos o HTML aqui.
         */

        form =
            null;

        formContainer =
            null;

    }


    // ========================================================
    // RETORNAR
    // ========================================================

    return api;

}
