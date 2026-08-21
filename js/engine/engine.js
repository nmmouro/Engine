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
 *
 * Também suporta:
 *
 * - Selects relacionais
 * - Fontes externas do Schema
 * - EMPREGADOS
 * - VEICULOS
 * - Preservação dos IDs técnicos
 * - Novo registro
 * - Edição de registro
 * - Exclusão
 * ============================================================
 */

import { createState } from "./state.js";
import { createCrud } from "./crud.js";
import { createForm } from "./form.js";
import { createTable } from "./table.js";
import { createToolbar } from "./toolbar.js";

import { createHeader } from "./header.js";


/**
 * ============================================================
 * CREATE ENGINE
 * ============================================================
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


    // ============================================================
    // VALIDAÇÃO
    // ============================================================

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


   // ============================================================
// CONTAINER PRINCIPAL
// ============================================================

const app =
    resolverElemento(container);


if (!app) {

    throw new Error(
        `Engine ${entity}: container não encontrado: ${container}`
    );

}


// ============================================================
// LIMPA CONTAINER
// ============================================================

app.innerHTML = "";


// ============================================================
// HEADER
// ============================================================

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
            options.titulo || entity,

        logo:
            options.logo || "img/logo.png"

    });


    // ============================================================
    // STATE
    // ============================================================

    const state =
        createState(stateName);


    // ============================================================
    // CRUD
    // ============================================================

    const crud =
        createCrud(entity);


    // ============================================================
    // ESTRUTURA DA PÁGINA
    // ============================================================

   // ============================================================
// ESTRUTURA
// ============================================================

app.innerHTML = "";


// ============================================================
// HEADER
// ============================================================

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


// ============================================================
// TOOLBAR
// ============================================================

const toolbarContainer =
    criarContainer(
        "engine-toolbar-container"
    );


// ============================================================
// FORMULÁRIO
// ============================================================

const formContainer =
    criarContainer(
        "engine-form-container"
    );


// ============================================================
// TABELA
// ============================================================

const tableContainer =
    criarContainer(
        "engine-table-container"
    );


// ============================================================
// ADICIONA AO APP
// ============================================================

app.appendChild(
    toolbarContainer
);

app.appendChild(
    formContainer
);

app.appendChild(
    tableContainer
);


    // ============================================================
    // ESTADO INICIAL
    // ============================================================

    formContainer.style.display =
        "none";


    // ============================================================
    // CARREGAR FONTES RELACIONADAS
    // ============================================================
    /**
     * Localiza todas as fontes usadas pelos
     * selects relacionais.
     *
     * Exemplo:
     *
     * source: "EMPREGADOS"
     * source: "VEICULOS"
     *
     * Retorno:
     *
     * {
     *     EMPREGADOS: [...],
     *     VEICULOS: [...]
     * }
     */
    async function carregarFontesRelacionadas() {

        const fontes =
            [
                ...new Set(

                    schema.fields

                        .filter(campo =>
                            campo.type === "select" &&
                            campo.source
                        )

                        .map(campo =>
                            campo.source
                        )

                )
            ];


        const resultado = {};


        if (fontes.length === 0) {
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


    // ============================================================
    // APLICA FONTES RELACIONADAS AO SCHEMA
    // ============================================================
    /**
     * Coloca os registros das fontes dentro
     * do próprio campo do Schema.
     *
     * Isso permite que o form.js utilize:
     *
     * campo.records
     *
     * e:
     *
     * campo.options
     */
    function aplicarFontesRelacionadas(fontes) {

        schema.fields.forEach(campo => {

            if (
                campo.type !== "select" ||
                !campo.source
            ) {
                return;
            }


            const registros =
                fontes[campo.source] || [];


            // Guarda os registros completos
            campo.records =
                registros;


            // ----------------------------------------------------
            // Monta options
            // ----------------------------------------------------

            if (
                campo.valueField &&
                Array.isArray(campo.labelFields)
            ) {

                campo.options =
                    registros.map(registro => {

                        const value =
                            registro?.[
                                campo.valueField
                            ] ?? "";


                        const label =
                            campo.labelFields

                                .map(
                                    nome =>
                                        registro?.[
                                            nome
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

                    });

            }

        });

    }


    // ============================================================
    // CARREGAR REGISTROS DA ENTIDADE
    // ============================================================

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
                `Engine ${entity}:`,
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


    // ============================================================
    // NOVO
    // ============================================================

    async function onNovo() {

        state.registroEditando =
            null;


        state.indiceEditando =
            null;


        try {

            // ----------------------------------------------------
            // Carrega EMPREGADOS / VEICULOS
            // ----------------------------------------------------

            const fontes =
                await carregarFontesRelacionadas();


            // ----------------------------------------------------
            // Coloca as fontes no Schema
            // ----------------------------------------------------

            aplicarFontesRelacionadas(
                fontes
            );


            // ----------------------------------------------------
            // Limpa formulário
            // ----------------------------------------------------

            form.reset();


            // ----------------------------------------------------
            // Mostra formulário
            // ----------------------------------------------------

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


    // ============================================================
    // EDITAR
    // ============================================================

    async function editar(
        registro,
        indice
    ) {

        try {

            state.registroEditando =
                registro;


            state.indiceEditando =
                indice;


            // ----------------------------------------------------
            // Carrega fontes relacionais
            // ----------------------------------------------------

            const fontes =
                await carregarFontesRelacionadas();


            // ----------------------------------------------------
            // Aplica fontes
            // ----------------------------------------------------

            aplicarFontesRelacionadas(
                fontes
            );


            // ----------------------------------------------------
            // Preenche formulário
            // ----------------------------------------------------
            //
            // IMPORTANTE:
            //
            // form.setData() precisa ocorrer depois que
            // EMPREGADOS e VEICULOS estiverem carregados.
            //

            await form.setData(
                registro
            );


            // ----------------------------------------------------
            // Mostra formulário
            // ----------------------------------------------------

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


    // ============================================================
    // SALVAR FORMULÁRIO
    // ============================================================

    async function salvarFormulario(
        dados
    ) {

        try {

            state.carregando =
                true;


            // ====================================================
            // EDIÇÃO
            // ====================================================

            if (
                state.registroEditando
            ) {

                const registroOriginal =
                    state.registroEditando;


                // ------------------------------------------------
                // Mantém os dados originais
                // ------------------------------------------------

                const dadosAtualizacao = {

                    ...registroOriginal,

                    ...dados,

                    // ID principal
                    ID:
                        registroOriginal.ID

                };


                // ------------------------------------------------
                // Preserva ID Empregado
                // ------------------------------------------------

                if (
                    registroOriginal["ID Empregado"] &&
                    !dadosAtualizacao["ID Empregado"]
                ) {

                    dadosAtualizacao["ID Empregado"] =
                        registroOriginal["ID Empregado"];

                }


                // ------------------------------------------------
                // Preserva ID Veículo
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


                console.log(
                    `Engine ${entity}: resposta da atualização`,
                    resposta
                );


                validarResposta(
                    resposta,
                    "atualização"
                );

            }


            // ====================================================
            // NOVO
            // ====================================================

            else {

                console.log(
                    `Engine ${entity}: criando`,
                    dados
                );


                const resposta =
                    await crud.criar(
                        dados
                    );


                console.log(
                    `Engine ${entity}: resposta da criação`,
                    resposta
                );


                validarResposta(
                    resposta,
                    "criação"
                );

            }


            // ====================================================
            // FINALIZAÇÃO
            // ====================================================

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


    // ============================================================
    // EXCLUIR
    // ============================================================

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

            state.carregando =
                true;


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

            state.carregando =
                false;

        }

    }


    // ============================================================
    // CANCELAR
    // ============================================================

    function cancelarFormulario() {

        form.reset();


        state.registroEditando =
            null;


        state.indiceEditando =
            null;


        esconderFormulario();

    }


    // ============================================================
    // MOSTRAR FORMULÁRIO
    // ============================================================

    function mostrarFormulario() {

        formContainer.style.display =
            "";


        tableContainer.style.display =
            "none";


        if (
            toolbar.botaoNovo
        ) {

            toolbar.ocultarNovo();

        }

    }


    // ============================================================
    // ESCONDER FORMULÁRIO
    // ============================================================

    function esconderFormulario() {

        formContainer.style.display =
            "none";


        tableContainer.style.display =
            "";


        if (
            toolbar.botaoNovo
        ) {

            toolbar.mostrarNovo();

        }

    }


    // ============================================================
    // MENSAGEM DE ERRO
    // ============================================================

    function mostrarErro(
        erro
    ) {

        const mensagem =
            erro?.message ||
            "Ocorreu um erro.";


        console.error(
            `Engine ${entity}:`,
            mensagem
        );


        window.alert(
            mensagem
        );

    }


    // ============================================================
    // CARREGAMENTO INICIAL
    // ============================================================

    carregar();


    // ============================================================
    // API PÚBLICA
    // ============================================================

    return {

        entity,

        schema,

        state,

        crud,

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


/**
 * ============================================================
 * VALIDAR RESPOSTA DA API
 * ============================================================
 *
 * Trata os dois formatos utilizados pelo backend:
 *
 * 1. resposta.sucesso
 *
 * 2. resposta.dados.sucesso
 */
function validarResposta(
    resposta,
    operacao
) {

    if (!resposta) {

        throw new Error(
            `A API não retornou resposta na ${operacao}.`
        );

    }


    // ============================================================
    // PRIMEIRO NÍVEL
    // ============================================================

    if (
        resposta.sucesso === false
    ) {

        throw new Error(
            resposta.erro ||
            resposta.message ||
            `Erro na ${operacao}.`
        );

    }


    // ============================================================
    // SEGUNDO NÍVEL
    // ============================================================

    const interno =
        resposta?.dados;


    if (
        interno &&
        typeof interno === "object" &&
        interno.sucesso === false
    ) {

        throw new Error(
            interno.erro ||
            interno.message ||
            `Erro na ${operacao}.`
        );

    }

}


/**
 * ============================================================
 * RESOLVE ELEMENTO
 * ============================================================
 */
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


/**
 * ============================================================
 * CRIA CONTAINER
 * ============================================================
 */
function criarContainer(
    classe
) {

    const elemento =
        document.createElement("div");


    elemento.className =
        classe;


    return elemento;

}
