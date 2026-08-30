```javascript
/**
 * ============================================================
 * TABLE
 * Painel Frota
 * Arquivo: js/engine/table.js
 *
 * Responsabilidade:
 *
 * - Criar tabela
 * - Inicializar tabela
 * - Renderizar registros
 * - Renderizar ações
 * - Gerar data-id
 *
 * Não possui:
 *
 * - CRUD
 * - Supabase
 * - PostgreSQL
 * - Formulário
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
    // OBJETO TABLE
    // ========================================================

    const table = {

        // ----------------------------------------------------
        // INICIAR
        // ----------------------------------------------------

        iniciar() {

            renderizar();

        },


        // ----------------------------------------------------
        // RENDERIZAR
        // ----------------------------------------------------

        renderizar,


        // Compatibilidade
        render:
            renderizar,


        // ----------------------------------------------------
        // ATUALIZAR
        // ----------------------------------------------------

        atualizar:
            renderizar,


        // ----------------------------------------------------
        // LIMPAR
        // ----------------------------------------------------

        limpar() {

            container.innerHTML =
                "";

        }

    };


    // ========================================================
    // RENDERIZAR
    // ========================================================

    function renderizar() {

        const registros =
            Array.isArray(
                state.registros
            )
                ? state.registros
                : [];


        const colunas =
            obterColunas();


        // ====================================================
        // NENHUM REGISTRO
        // ====================================================

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


        // ====================================================
        // TABELA
        // ====================================================

        let html = `

            <div class="engine-table-wrapper">

                <table class="engine-table">

                    <thead>

                        <tr>

        `;


        // ====================================================
        // CABEÇALHO
        // ====================================================

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


        // ====================================================
        // COLUNA AÇÕES
        // ====================================================

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


        // ====================================================
        // REGISTROS
        // ====================================================

        registros.forEach(
            registro => {

                html +=
                    criarLinha(
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


        // ====================================================
        // CAMPOS
        // ====================================================

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


        // ====================================================
        // AÇÕES
        // ====================================================

        if (
            options.permitirEditar !== false ||
            options.permitirExcluir !== false
        ) {

            html +=
                criarAcoes(
                    registro
                );

        }


        html +=
            "</tr>";


        return html;

    }


    // ========================================================
    // CRIAR AÇÕES
    // ========================================================

    function criarAcoes(
        registro
    ) {

        /*
         * IMPORTANTE
         *
         * O Supabase retorna:
         *
         * {
         *     id: "VEI000002"
         * }
         *
         * Portanto usamos registro.id.
         *
         * O fallback para ID mantém
         * compatibilidade.
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


        // ====================================================
        // EDITAR
        // ====================================================

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


        // ====================================================
        // EXCLUIR
        // ====================================================

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


        // ====================================================
        // ACTIONS PERSONALIZADAS
        // ====================================================

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


        const id =
            registro?.id ??
            registro?.ID ??
            "";


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
        // COLUNAS DEFINIDAS PELO MÓDULO
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
    // NOME DO CAMPO
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
        // DATA/HORA
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


        // ----------------------------------------------------
        // STATUS
        // ----------------------------------------------------

        if (
            coluna?.name ===
            "status"
        ) {

            return escaparHTML(
                String(valor)
            );

        }


        return escaparHTML(
            String(valor)
        );

    }


    // ========================================================
    // FORMATAR DATA
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

            const partes =
                texto.split("-");


            return `${partes[2]}/${partes[1]}/${partes[0]}`;

        }


        return texto;

    }


    // ========================================================
    // FORMATAR DATA/HORA
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
```
