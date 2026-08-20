/**
 * ============================================================
 * ENGINE PRINCIPAL
 * ============================================================
 *
 * Responsável por integrar:
 *
 * - State
 * - CRUD
 * - Form
 * - Table
 * - Toolbar
 *
 * O Engine não conhece nenhuma entidade específica.
 * ============================================================
 */

import { createState } from "./state.js";
import { createCrud } from "./crud.js";
import { createForm } from "./form.js";
import { createTable } from "./table.js";
import { createToolbar } from "./toolbar.js";


/**
 * Cria um Engine.
 *
 * @param {Object} config
 *
 * @returns {Object}
 */
export function createEngine(config = {}) {

    const {
        entity,
        schema,
        container,
        stateName = entity,
        options = {}
    } = config;


    // ------------------------------------------------------------
    // Validação
    // ------------------------------------------------------------

    if (!entity) {

        throw new Error(
            "Engine: entity não informado."
        );

    }


    if (!schema) {

        throw new Error(
            `Engine ${entity}: schema não informado.`
        );

    }


    if (!container) {

        throw new Error(
            `Engine ${entity}: container não informado.`
        );

    }


    // ------------------------------------------------------------
    // Container principal
    // ------------------------------------------------------------

    const app =
        resolverElemento(container);


    if (!app) {

        throw new Error(
            `Engine ${entity}: container não encontrado: ${container}`
        );

    }


    // ------------------------------------------------------------
    // State
    // ------------------------------------------------------------

    const state =
        createState(stateName);


    // ------------------------------------------------------------
    // CRUD
    // ------------------------------------------------------------

    const crud =
        createCrud(entity);


    // ------------------------------------------------------------
    // Estrutura da tela
    // ------------------------------------------------------------

    app.innerHTML = "";


    const toolbarContainer =
        criarContainer(
            "engine-toolbar-container"
        );


    const formContainer =
        criarContainer(
            "engine-form-container"
        );


    const tableContainer =
        criarContainer(
            "engine-table-container"
        );


    app.appendChild(
        toolbarContainer
    );


    app.appendChild(
        formContainer
    );


    app.appendChild(
        tableContainer
    );


    // ------------------------------------------------------------
    // Toolbar
    // ------------------------------------------------------------

    const toolbar =
        createToolbar({

            container: toolbarContainer,

            titulo:
                options.titulo ||
                entity,

            permitirNovo:
                options.permitirNovo !== false,

            onNovo

        });


    // ------------------------------------------------------------
    // Form
    // ------------------------------------------------------------

    const form =
        createForm({

            schema,

            container:
                formContainer,

            onSubmit:
                salvarFormulario,

            onCancel:
                cancelarFormulario

        });


    // ------------------------------------------------------------
    // Table
    // ------------------------------------------------------------

    const table =
        createTable({

            schema,

            container:
                tableContainer,

            actions: {

                editar:
                    options.permitirEditar !== false
                        ? editar
                        : null,

                excluir:
                    options.permitirExcluir !== false
                        ? excluir
                        : null

            }

        });


    // ------------------------------------------------------------
    // Inicialização
    // ------------------------------------------------------------

    formContainer.style.display =
        "none";


    // ------------------------------------------------------------
    // Carregar dados
    // ------------------------------------------------------------

    async function carregar() {

        try {

            state.carregando = true;

            table.renderLoading(
                "Carregando..."
            );


            const registros =
                await crud.listar();


            state.registros =
                Array.isArray(registros)
                    ? registros
                    : [];


            table.render(
                state.registros
            );


        } catch (erro) {

            console.error(
                `Engine ${entity}:`,
                erro
            );


            state.registros = [];


            table.renderVazio(
                "Não foi possível carregar os registros."
            );


            mostrarErro(
                erro
            );


        } finally {

            state.carregando = false;

        }

    }


    // ------------------------------------------------------------
    // Novo
    // ------------------------------------------------------------

    function onNovo() {

        state.registroEditando =
            null;


        form.reset();


        mostrarFormulario();


    }


    // ------------------------------------------------------------
    // Editar
    // ------------------------------------------------------------

    function editar(
        registro,
        indice
    ) {

        state.registroEditando =
            registro;


        state.indiceEditando =
            indice;


        form.setData(
            registro
        );


        mostrarFormulario();

    }


    // ------------------------------------------------------------
    // Salvar
    // ------------------------------------------------------------

    async function salvarFormulario(dados) {

    try {

        state.carregando = true;


        // --------------------------------------------------------
        // EDIÇÃO
        // --------------------------------------------------------

        if (state.registroEditando) {

            const registroOriginal =
                state.registroEditando;


            const dadosAtualizacao = {

                ...registroOriginal,

                ...dados,

                ID: registroOriginal.ID

            };


            console.log(
                `Engine ${entity}: atualizando`,
                dadosAtualizacao
            );


            await crud.atualizar(
                dadosAtualizacao
            );

        }


        // --------------------------------------------------------
        // NOVO
        // --------------------------------------------------------

        else {

            console.log(
                `Engine ${entity}: criando`,
                dados
            );


            await crud.criar(
                dados
            );

        }


        // --------------------------------------------------------
        // Finalização
        // --------------------------------------------------------

        esconderFormulario();


        state.registroEditando =
            null;


        state.indiceEditando =
            null;


        await carregar();


    } catch (erro) {

        console.error(
            `Engine ${entity}:`,
            erro
        );


        mostrarErro(
            erro
        );


    } finally {

        state.carregando =
            false;

    }

}


    // ------------------------------------------------------------
    // Excluir
    // ------------------------------------------------------------

    async function excluir(
        registro,
        indice
    ) {

        const id =
            registro?.ID;


        if (!id) {

            mostrarErro(
                new Error(
                    "Registro sem ID."
                )
            );

            return;

        }


        const confirmar =
            window.confirm(
                `Deseja excluir o registro ${id}?`
            );


        if (!confirmar) {
            return;
        }


        try {

            state.carregando = true;


            await crud.excluir(
                id
            );


            await carregar();


        } catch (erro) {

            console.error(
                `Engine ${entity}:`,
                erro
            );


            mostrarErro(
                erro
            );


        } finally {

            state.carregando = false;

        }

    }


    // ------------------------------------------------------------
    // Cancelar
    // ------------------------------------------------------------

    function cancelarFormulario() {

        form.reset();

        state.registroEditando =
            null;

        state.indiceEditando =
            null;


        esconderFormulario();

    }


    // ------------------------------------------------------------
    // Mostrar formulário
    // ------------------------------------------------------------

    function mostrarFormulario() {

        formContainer.style.display =
            "";


        tableContainer.style.display =
            "none";


        if (toolbar.botaoNovo) {

            toolbar.ocultarNovo();

        }

    }


    // ------------------------------------------------------------
    // Esconder formulário
    // ------------------------------------------------------------

    function esconderFormulario() {

        formContainer.style.display =
            "none";


        tableContainer.style.display =
            "";


        if (toolbar.botaoNovo) {

            toolbar.mostrarNovo();

        }

    }


    // ------------------------------------------------------------
    // Mensagem de erro
    // ------------------------------------------------------------

    function mostrarErro(erro) {

        const mensagem =
            erro?.message ||
            "Ocorreu um erro.";

        console.error(
            mensagem
        );


        window.alert(
            mensagem
        );

    }


    // ------------------------------------------------------------
    // Cria container
    // ------------------------------------------------------------

    function criarContainer(classe) {

        const elemento =
            document.createElement("div");


        elemento.className =
            classe;


        return elemento;

    }


    // ------------------------------------------------------------
    // Carrega inicialmente
    // ------------------------------------------------------------

    carregar();


    // ------------------------------------------------------------
    // API pública
    // ------------------------------------------------------------

    return {

        entity,

        schema,

        state,

        crud,

        form,

        table,

        toolbar,

        carregar,

        novo: onNovo,

        editar,

        cancelar: cancelarFormulario

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
