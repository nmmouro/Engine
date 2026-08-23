/**
 * ============================================================
 * ENGINE PRINCIPAL
 * ============================================================
 *
 * Integra:
 *
 * - Header
 * - Toolbar
 * - State
 * - CRUD
 * - Form
 * - Table
 *
 * O Engine não conhece nenhuma entidade específica.
 *
 * A entidade é informada pelo módulo:
 *
 * createModule({
 *     entity: "VEICULOS",
 *     schema: SCHEMA_VEICULOS
 * });
 *
 * ============================================================
 */

import { createState } from "./state.js";
import { createCrud } from "./crud.js";
import { createForm } from "./form.js";
import { createTable } from "./table.js";
import { createToolbar } from "./toolbar.js";
import { createHeader } from "./header.js";


// ============================================================
// CREATE ENGINE
// ============================================================

export function createEngine(config = {}) {

    const {
        entity,
        schema,
        container,
        stateName = entity,
        options = {}
    } = config;


    // ========================================================
    // VALIDAÇÕES
    // ========================================================

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


    if (
        !Array.isArray(schema.fields)
    ) {

        throw new Error(
            `Engine ${entity}: schema.fields inválido.`
        );

    }


    // ========================================================
    // CONTAINER
    // ========================================================

    const app =
        resolverElemento(container);


    if (!app) {

        throw new Error(
            `Engine ${entity}: container não encontrado: ${container}`
        );

    }


    // ========================================================
    // STATE
    // ========================================================

    const state =
        createState(stateName);


    // ========================================================
    // CRUD
    // ========================================================
    //
    // IMPORTANTE:
    //
    // O Engine não chama mais:
    //
    // salvar(...)
    // atualizar(...)
    // excluir(...)
    //
    // diretamente.
    //
    // Tudo passa pelo objeto:
    //
    // crud.listar()
    // crud.criar()
    // crud.atualizar()
    // crud.excluir()
    //
    // ========================================================

    const crud =
        createCrud(entity);


    // ========================================================
    // LIMPAR APP
    // ========================================================

    app.innerHTML = "";


    // ========================================================
    // HEADER
    // ========================================================

    const headerContainer =
        criarContainer(
            "engine-header-container"
        );


    app.appendChild(
        headerContainer
    );


    const header =
        createHeader({

            container:
                headerContainer,

            titulo:
                options.titulo ||
                entity,

            logo:
                options.logo ||
                "img/logo.png"

        });


    // ========================================================
    // TOOLBAR
    // ========================================================

    const toolbarContainer =
        criarContainer(
            "engine-toolbar-container"
        );


    app.appendChild(
        toolbarContainer
    );


    // ========================================================
    // FORM CONTAINER
    // ========================================================

    const formContainer =
        criarContainer(
            "engine-form-container"
        );


    app.appendChild(
        formContainer
    );


    // ========================================================
    // TABLE CONTAINER
    // ========================================================

    const tableContainer =
        criarContainer(
            "engine-table-container"
        );


    app.appendChild(
        tableContainer
    );


    // ========================================================
    // TOOLBAR
    // ========================================================

    const toolbar =
        createToolbar({

            container:
                toolbarContainer,

            titulo:
                options.titulo ||
                entity,

            permitirNovo:
                options.permitirNovo !== false,

            onNovo:
                onNovo

        });


    // ========================================================
    // FORM
    // ========================================================

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


    // ========================================================
    // TABLE
    // ========================================================

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
                        ? excluirRegistro
                        : null,



                                (
                                                        options.actions || {}
                                )

                

            }

        });


    // ========================================================
    // ESTADO VISUAL INICIAL
    // ========================================================

    formContainer.style.display =
        "none";


    // ========================================================
    // FONTES RELACIONADAS
    // ========================================================

    async function carregarFontesRelacionadas() {

        const fontes = [

            ...new Set(

                schema.fields

                    .filter(
                        campo =>
                            campo.type === "select" &&
                            campo.source
                    )

                    .map(
                        campo =>
                            campo.source
                    )

            )

        ];


        const resultado = {};


        if (
            fontes.length === 0
        ) {

            return resultado;

        }


        await Promise.all(

            fontes.map(
                async source => {

                    try {

                        const crudFonte =
                            createCrud(source);


                        const registros =
                            await crudFonte.listar();


                        resultado[source] =
                            Array.isArray(registros)
                                ? registros
                                : [];


                    } catch (erro) {

                        console.error(
                            `Engine ${entity}: erro ao carregar fonte ${source}`,
                            erro
                        );


                        resultado[source] =
                            [];

                    }

                }
            )

        );


        return resultado;

    }


    // ========================================================
    // APLICAR FONTES RELACIONADAS
    // ========================================================

    function aplicarFontesRelacionadas(
        fontes
    ) {

        schema.fields.forEach(
            campo => {

                if (
                    campo.type !== "select" ||
                    !campo.source
                ) {

                    return;

                }


                const registros =
                    fontes[campo.source] ||
                    [];


                campo.records =
                    registros;


                // ------------------------------------------------
                // Monta options
                // ------------------------------------------------

                if (
                    campo.valueField &&
                    Array.isArray(campo.labelFields)
                ) {

                    campo.options =
                        registros.map(
                            registro => {

                                const value =
                                    registro?.[
                                        campo.valueField
                                    ] ?? "";


                                const label =
                                    campo.labelFields

                                        .map(
                                            campoLabel =>
                                                registro?.[
                                                    campoLabel
                                                ] ?? ""
                                        )

                                        .filter(
                                            valor =>
                                                valor !== ""
                                        )

                                        .join(
                                            campo.separator ||
                                            " / "
                                        );


                                return {

                                    value,

                                    label

                                };

                            }
                        );

                }

            }
        );

    }


    // ========================================================
    // CARREGAR REGISTROS
    // ========================================================

    async function carregar() {

        try {

            state.carregando =
                true;


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
                `Engine ${entity}: erro ao carregar`,
                erro
            );


            state.registros =
                [];


            table.renderVazio(
                "Não foi possível carregar os registros."
            );


            mostrarErro(
                erro
            );


        } finally {

            state.carregando =
                false;

        }

    }


    // ========================================================
    // NOVO
    // ========================================================

    async function onNovo() {

        state.registroEditando =
            null;


        state.indiceEditando =
            null;


        try {

            const fontes =
                await carregarFontesRelacionadas();


            aplicarFontesRelacionadas(
                fontes
            );


            form.reset();


            mostrarFormulario();


        } catch (erro) {

            console.error(
                `Engine ${entity}: erro ao abrir novo`,
                erro
            );


            mostrarErro(
                erro
            );

        }

    }


    // ========================================================
    // EDITAR
    // ========================================================

    async function editar(
        registro,
        indice
    ) {

        if (!registro) {

            mostrarErro(
                new Error(
                    "Registro não informado para edição."
                )
            );

            return;

        }


        try {

            state.registroEditando =
                registro;


            state.indiceEditando =
                indice;


            const fontes =
                await carregarFontesRelacionadas();


            aplicarFontesRelacionadas(
                fontes
            );


            await form.setData(
                registro
            );


            mostrarFormulario();


        } catch (erro) {

            console.error(
                `Engine ${entity}: erro ao editar`,
                erro
            );


            mostrarErro(
                erro
            );

        }

    }


    // ========================================================
    // SALVAR FORMULÁRIO
    // ========================================================

    async function salvarFormulario(
        dados
    ) {

        try {

            state.carregando =
                true;


            // ==================================================
            // EDIÇÃO
            // ==================================================

            if (
                state.registroEditando
            ) {

                const registroOriginal =
                    state.registroEditando;


                const dadosAtualizacao = {

                    ...registroOriginal,

                    ...dados,

                    ID:
                        registroOriginal.ID

                };


                // ------------------------------------------------
                // PRESERVAR ID EMPREGADO
                // ------------------------------------------------

                if (
                    registroOriginal["ID Empregado"] &&
                    !dadosAtualizacao["ID Empregado"]
                ) {

                    dadosAtualizacao["ID Empregado"] =
                        registroOriginal["ID Empregado"];

                }


                // ------------------------------------------------
                // PRESERVAR ID VEÍCULO
                // ------------------------------------------------

                if (
                    registroOriginal["ID Veículo"] &&
                    !dadosAtualizacao["ID Veículo"]
                ) {

                    dadosAtualizacao["ID Veículo"] =
                        registroOriginal["ID Veículo"];

                }


                console.log(
                    `Engine ${entity}: atualizando`,
                    dadosAtualizacao
                );


                const resposta =
                    await crud.atualizar(
                        dadosAtualizacao
                    );


                validarResposta(
                    resposta,
                    "atualização"
                );

            }


            // ==================================================
            // NOVO
            // ==================================================

            else {

                console.log(
                    `Engine ${entity}: criando`,
                    dados
                );


                const resposta =
                    await crud.criar(
                        dados
                    );


                validarResposta(
                    resposta,
                    "criação"
                );

            }


            // ==================================================
            // FINALIZAÇÃO
            // ==================================================

            form.reset();


            state.registroEditando =
                null;


            state.indiceEditando =
                null;


            esconderFormulario();


            await carregar();


        } catch (erro) {

            console.error(
                `Engine ${entity}: erro ao salvar`,
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


    // ========================================================
    // EXCLUIR
    // ========================================================

    async function excluirRegistro(
        registro,
        indice
    ) {

        const id =
            registro?.ID;


        if (
            id === undefined ||
            id === null ||
            id === ""
        ) {

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

            state.carregando =
                true;


            await crud.excluir(
                id
            );


            await carregar();


        } catch (erro) {

            console.error(
                `Engine ${entity}: erro ao excluir`,
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


    // ========================================================
    // CANCELAR
    // ========================================================

    function cancelarFormulario() {

        form.reset();


        state.registroEditando =
            null;


        state.indiceEditando =
            null;


        esconderFormulario();

    }


    // ========================================================
    // MOSTRAR FORMULÁRIO
    // ========================================================

    function mostrarFormulario() {

        formContainer.style.display =
            "";


        tableContainer.style.display =
            "none";


        if (
            toolbar?.botaoNovo
        ) {

            toolbar.ocultarNovo();

        }

    }


    // ========================================================
    // ESCONDER FORMULÁRIO
    // ========================================================

    function esconderFormulario() {

        formContainer.style.display =
            "none";


        tableContainer.style.display =
            "";


        if (
            toolbar?.botaoNovo
        ) {

            toolbar.mostrarNovo();

        }

    }


    // ========================================================
    // ERRO
    // ========================================================

    function mostrarErro(
        erro
    ) {

        const mensagem =
            erro?.message ||
            "Ocorreu um erro no Engine.";


        console.error(
            `Engine ${entity}:`,
            erro
        );


        window.alert(
            mensagem
        );

    }


    // ========================================================
    // CARREGAMENTO INICIAL
    // ========================================================

    carregar();


    // ========================================================
    // API PÚBLICA
    // ========================================================

    return {

        entity,

        schema,

        state,

        crud,

        header,

        form,

        table,

        toolbar,

        carregar,

        novo:
            onNovo,

        editar,

        cancelar:
            cancelarFormulario

    };

}


// ============================================================
// VALIDAR RESPOSTA
// ============================================================

function validarResposta(
    resposta,
    operacao
) {

    if (!resposta) {

        throw new Error(
            `A API não retornou resposta na ${operacao}.`
        );

    }


    if (
        resposta.sucesso === false
    ) {

        throw new Error(
            resposta.erro ||
            resposta.message ||
            `Erro na ${operacao}.`
        );

    }


    const interno =
        resposta?.dados;


    if (
        interno &&
        typeof interno === "object" &&
        !Array.isArray(interno) &&
        interno.sucesso === false
    ) {

        throw new Error(
            interno.erro ||
            interno.message ||
            `Erro na ${operacao}.`
        );

    }

}


// ============================================================
// RESOLVER ELEMENTO
// ============================================================

function resolverElemento(
    valor
) {

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


// ============================================================
// CRIAR CONTAINER
// ============================================================

function criarContainer(
    classe
) {

    const elemento =
        document.createElement(
            "div"
        );


    elemento.className =
        classe;


    return elemento;

}
