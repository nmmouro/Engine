/**
 * ============================================================
 * TABLE ENGINE
 * Painel Frota
 * Arquivo: js/engine/table.js
 *
 * Responsabilidade:
 *
 * - Renderizar tabela
 * - Renderizar cabeçalho
 * - Renderizar registros
 * - Renderizar ações
 * - Gerar data-id corretamente
 *
 * Não conhece:
 *
 * - Supabase
 * - PostgreSQL
 * - crudService
 *
 * ============================================================
 */


// ============================================================
// CREATE TABLE
// ============================================================

export function createTable(
    config = {}
) {

    const container =
        config.container;


    const schema =
        config.schema || {};


    const state =
        config.state;


    const engine =
        config.engine;


    const options =
        config.options || {};


    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (!container) {

        throw new Error(
            "TABLE: container não informado."
        );

    }


    if (!state) {

        throw new Error(
            "TABLE: state não informado."
        );

    }


    // ========================================================
    // API
    // ========================================================

    const table = {

        render,

        limpar,

        atualizar:
            render

    };


    // ========================================================
    // RENDERIZAR
    // ========================================================

    function render() {

        const registros =
            Array.isArray(
                state.registros
            )
                ? state.registros
                : [];


        const colunas =
            obterColunas();


        // ----------------------------------------------------
        // VAZIO
        // ----------------------------------------------------

        if (
            registros.length === 0
        ) {

            container.innerHTML = `

                <div class="engine-empty">

                    Nenhum registro encontrado.

                </div>

            `;

            return;

        }


        // ----------------------------------------------------
        // TABELA
        // ----------------------------------------------------

        let html = `

            <div class="engine-table-wrapper">

                <table class="engine-table">

                    <thead>

                        <tr>

        `;


        // ----------------------------------------------------
        // CABEÇALHO
        // ----------------------------------------------------

        colunas.forEach(
            coluna => {

                html += `

                    <th>

                        ${escaparHTML(
                            obterLabel(
                                coluna
                            )
                        )}

                    </th>

                `;

            }
        );


        // ----------------------------------------------------
        // AÇÕES
        // ----------------------------------------------------

        if (
            options.permitirEditar !== false ||
            options.permitirExcluir !== false
        ) {

            html += `

                <th class="engine-actions-header">

                    Ações

                </th>

            `;

        }


        html += `

                        </tr>

                    </thead>

                    <tbody>

        `;


        // ----------------------------------------------------
        // REGISTROS
        // ----------------------------------------------------

        registros.forEach(
            registro => {

                html += criarLinha(
                    registro,
                    colunas
                );

            }
        );


        html += `

                    </tbody>

                </table>

            </div>

        `;


        container.innerHTML =
            html;

    }


    // ========================================================
    // CRIAR LINHA
    // ========================================================

    function criarLinha(
        registro,
        colunas
    ) {

        let html =
            "<tr>";


        // ----------------------------------------------------
        // COLUNAS
        // ----------------------------------------------------

        colunas.forEach(
            coluna => {

                const nome =
                    obterNome(
                        coluna
                    );


                const valor =
                    registro?.[
                        nome
                    ];


                html += `

                    <td>

                        ${formatarValor(
                            valor,
                            coluna
                        )}

                    </td>

                `;

            }
        );


        // ----------------------------------------------------
        // AÇÕES
        // ----------------------------------------------------

        if (
            options.permitirEditar !== false ||
            options.permitirExcluir !== false
        ) {

            html += criarAcoes(
                registro
            );

        }


        html +=
            "</tr>";


        return html;

    }


    // ========================================================
    // AÇÕES
    // ========================================================

    function criarAcoes(
        registro
    ) {

        /*
         * IMPORTANTE:
         *
         * Seu Supabase retorna:
         *
         * {
         *     id: "VEI000002"
         * }
         *
         * Portanto o ID principal é:
         *
         * registro.id
         *
         * Mantemos fallback para ID
         * por compatibilidade.
         */

        const id =
            registro?.id ??
            registro?.ID ??
            "";


        const idSeguro =
            escaparAtributo(
                id
            );


        let html = `

            <td class="engine-actions">

        `;


        // ----------------------------------------------------
        // EDITAR
        // ----------------------------------------------------

        if (
            options.permitirEditar !== false
        ) {

            html += `

                <button
                    type="button"
                    class="btn-editar"
                    data-action="editar"
                    data-id="${idSeguro}"
                >
                    Editar
                </button>

            `;

        }


        // ----------------------------------------------------
        // EXCLUIR
        // ----------------------------------------------------

        if (
            options.permitirExcluir !== false
        ) {

            html += `

                <button
                    type="button"
                    class="btn-excluir"
                    data-action="excluir"
                    data-id="${idSeguro}"
                >
                    Excluir
                </button>

            `;

        }


        // ----------------------------------------------------
        // ACTIONS PERSONALIZADAS
        // ----------------------------------------------------

        html +=
            criarActionsPersonalizadas(
                registro
            );


        html += `

            </td>

        `;


        return html;

    }


    // ========================================================
    // ACTIONS PERSONALIZADAS
    // ========================================================

    function criarActionsPersonalizadas(
        registro
    ) {

        const actions =
            options.actions || {};


        return Object.entries(
            actions
        )
        .filter(
            ([, funcao]) =>
                typeof funcao ===
                "function"
        )
        .map(
            ([nome]) => {

                const id =
                    registro?.id ??
                    registro?.ID ??
                    "";


                return `

                    <button
                        type="button"
                        data-engine-action="${escaparAtributo(
                            nome
                        )}"
                        data-id="${escaparAtributo(
                            id
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
        )
        .join("");

    }


    // ========================================================
    // COLUNAS
    // ========================================================

    function obterColunas() {

        // ----------------------------------------------------
        // COLUNAS PERSONALIZADAS
        // ----------------------------------------------------

        if (
            Array.isArray(
                options.colunas
            )
        ) {

            return options.colunas;

        }


        // ----------------------------------------------------
        // SCHEMA
        // ----------------------------------------------------

        if (
            Array.isArray(
                schema.fields
            )
        ) {

            return schema.fields.filter(

                campo =>

                    campo.visible !== false &&

                    campo.hidden !== true &&

                    campo.name !== "id" &&

                    campo.name !== "ID"

            );

        }


        // ----------------------------------------------------
        // AUTOMÁTICO
        // ----------------------------------------------------

        const primeiro =
            state.registros?.[0];


        if (!primeiro) {

            return [];

        }


        return Object.keys(
            primeiro
        )
        .filter(
            campo =>

                campo !== "id" &&

                campo !== "ID"

        )
        .map(
            campo => ({

                name:
                    campo,

                label:
                    campo

            })
        );

    }


    // ========================================================
    // NOME DA COLUNA
    // ========================================================

    function obterNome(
        coluna
    ) {

        if (
            typeof coluna ===
            "string"
        ) {

            return coluna;

        }


        return (

            coluna?.name ||

            coluna?.campo ||

            coluna?.field ||

            ""

        );

    }


    // ========================================================
    // LABEL
    // ========================================================

    function obterLabel(
        coluna
    ) {

        if (
            typeof coluna ===
            "string"
        ) {

            return coluna;

        }


        return (

            coluna?.label ||

            coluna?.titulo ||

            coluna?.name ||

            coluna?.campo ||

            ""

        );

    }


    // ========================================================
    // FORMATAR VALOR
    // ========================================================

    function formatarValor(
        valor,
        coluna
    ) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return "";

        }


        // ----------------------------------------------------
        // BOOLEAN
        // ----------------------------------------------------

        if (
            coluna?.type ===
            "boolean"
        ) {

            return valor
                ? "SIM"
                : "NÃO";

        }


        // ----------------------------------------------------
        // DATA
        // ----------------------------------------------------

        if (
            coluna?.type ===
            "date"
        ) {

            return escaparHTML(
                formatarData(
                    valor
                )
            );

        }


        // ----------------------------------------------------
        // DATETIME
        // ----------------------------------------------------

        if (
            coluna?.type ===
            "datetime-local"
        ) {

            return escaparHTML(
                formatarDataHora(
                    valor
                )
            );

        }


        return escaparHTML(
            String(
                valor
            )
        );

    }


    // ========================================================
    // DATA
    // ========================================================

    function formatarData(
        valor
    ) {

        const texto =
            String(
                valor
            );


        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                texto
            )
        ) {

            const [
                ano,
                mes,
                dia
            ] =
                texto.split(
                    "-"
                );


            return `${dia}/${mes}/${ano}`;

        }


        return texto;

    }


    // ========================================================
    // DATA + HORA
    // ========================================================

    function formatarDataHora(
        valor
    ) {

        const texto =
            String(
                valor
            );


        if (
            texto.includes("T")
        ) {

            const partes =
                texto.split("T");


            const data =
                formatarData(
                    partes[0]
                );


            const hora =
                (partes[1] || "")
                .substring(
                    0,
                    5
                );


            return `${data} ${hora}`;

        }


        return texto;

    }


    // ========================================================
    // TÍTULO ACTION
    // ========================================================

    function obterTituloAction(
        nome
    ) {

        const titulos = {

            abrirChecklist:
                "Checklist",

            abastecer:
                "Abastecer",

            visualizar:
                "Visualizar",

            finalizar:
                "Finalizar"

        };


        return (
            titulos[nome] ||
            nome
        );

    }


    // ========================================================
    // LIMPAR
    // ========================================================

    function limpar() {

        container.innerHTML =
            "";

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
    // RETORNO
    // ========================================================

    return table;

}
