```javascript
/**
 * ============================================================
 * TABLE
 * Painel Frota
 *
 * Responsabilidades:
 *
 * - Renderizar somente a tabela
 * - Editar
 * - Excluir
 * - Paginação
 * - Filtro
 *
 * NÃO altera:
 *
 * - Toolbar
 * - Formulário
 * - Container principal
 * ============================================================
 */


export function createTable(
    config = {}
) {

    const container =
        config.container || null;

    const engine =
        config.engine || null;

    const schema =
        config.schema || {};

    const options =
        config.options || {};


    // ========================================================
    // VALIDAR
    // ========================================================

    if (!container) {

        throw new Error(
            "Table: container não informado."
        );

    }


    if (!engine) {

        throw new Error(
            "Table: engine não informado."
        );

    }


    // ========================================================
    // INICIAR
    // ========================================================

    function iniciar() {

        console.log(
            `TABLE ${engine.entity} → INICIAR`
        );


        registrarEventos();


        renderizar();


        console.log(
            `TABLE ${engine.entity} → INICIADO`
        );

    }


    // ========================================================
    // RENDERIZAR
    // ========================================================

    function renderizar() {

        /*
         * IMPORTANTE:
         *
         * Somente o elemento da tabela
         * pode ser alterado.
         */

        const tabela =
            container.querySelector(
                "[data-engine-table]"
            );


        if (!tabela) {

            console.warn(
                `TABLE ${engine.entity}: ` +
                "[data-engine-table] não encontrado."
            );

            return;

        }


        const registros =
            obterRegistros();


        if (!registros.length) {

            tabela.innerHTML = `
                <div class="engine-empty">
                    Nenhum registro encontrado.
                </div>
            `;

            return;

        }


        const colunas =
            obterColunas();


        let html = `
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
                            obterTitulo(
                                coluna
                            )
                        )}
                    </th>
                `;

            }
        );


        if (
            options.permitirEditar !== false ||
            options.permitirExcluir !== false
        ) {

            html += `
                <th>Ações</th>
            `;

        }


        html += `
                    </tr>

                </thead>

                <tbody>
        `;


        // ====================================================
        // LINHAS
        // ====================================================

        registros.forEach(
            registro => {

                const id =
                    obterId(
                        registro
                    );


                html += `
                    <tr>
                `;


                colunas.forEach(
                    coluna => {

                        const nome =
                            obterNome(
                                coluna
                            );


                        html += `
                            <td>
                                ${formatarValor(
                                    registro?.[nome],
                                    coluna
                                )}
                            </td>
                        `;

                    }
                );


                // ============================================
                // AÇÕES
                // ============================================

                if (
                    options.permitirEditar !== false ||
                    options.permitirExcluir !== false
                ) {

                    html += `
                        <td class="engine-actions">
                    `;


                    if (
                        options.permitirEditar !== false
                    ) {

                        html += `
                            <button
                                type="button"
                                data-action="editar"
                                data-id="${escaparAtributo(
                                    id
                                )}"
                            >
                                Editar
                            </button>
                        `;

                    }


                    if (
                        options.permitirExcluir !== false
                    ) {

                        html += `
                            <button
                                type="button"
                                data-action="excluir"
                                data-id="${escaparAtributo(
                                    id
                                )}"
                            >
                                Excluir
                            </button>
                        `;

                    }


                    html += `
                        </td>
                    `;

                }


                html += `
                    </tr>
                `;

            }
        );


        html += `
                </tbody>

            </table>
        `;


        /*
         * SOMENTE a tabela é alterada.
         *
         * Nunca:
         *
         * container.innerHTML
         *
         */

        tabela.innerHTML =
            html;

    }


    // ========================================================
    // OBTER REGISTROS
    // ========================================================

    function obterRegistros() {

        if (
            typeof engine.obterRegistrosFiltrados ===
            "function"
        ) {

            return engine.obterRegistrosFiltrados();

        }


        return Array.isArray(
            engine.state?.registros
        )

            ? engine.state.registros

            : [];

    }


    // ========================================================
    // COLUNAS
    // ========================================================

    function obterColunas() {

        if (
            Array.isArray(
                options.colunas
            )
        ) {

            return options.colunas;

        }


        if (
            Array.isArray(
                schema.fields
            )
        ) {

            return schema.fields.filter(

                campo =>

                    campo?.visible !== false &&

                    campo?.hidden !== true &&

                    campo?.name !== "ID" &&

                    campo?.name !== "id"

            );

        }


        const primeiro =
            obterRegistros()[0];


        if (!primeiro) {

            return [];

        }


        return Object.keys(
            primeiro
        )
        .filter(
            nome =>
                nome !== "ID" &&
                nome !== "id"
        )
        .map(
            nome => ({
                name: nome,
                label: nome
            })
        );

    }


    // ========================================================
    // NOME
    // ========================================================

    function obterNome(
        coluna
    ) {

        return (

            coluna?.name ||

            coluna?.campo ||

            coluna

        );

    }


    // ========================================================
    // TÍTULO
    // ========================================================

    function obterTitulo(
        coluna
    ) {

        return (

            coluna?.label ||

            coluna?.titulo ||

            coluna?.name ||

            coluna?.campo ||

            coluna

        );

    }


    // ========================================================
    // ID
    // ========================================================

    function obterId(
        registro
    ) {

        return (

            registro?.id ??

            registro?.ID ??

            registro?.Id ??

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
            valor === undefined
        ) {

            return "";

        }


        if (
            valor === ""
        ) {

            return "";

        }


        if (
            coluna?.type === "boolean" ||
            coluna?.tipo === "boolean"
        ) {

            return valor
                ? "SIM"
                : "NÃO";

        }


        return escaparHTML(
            String(
                valor
            )
        );

    }


    // ========================================================
    // EVENTOS
    // ========================================================

    function registrarEventos() {

        if (
            container.dataset.tableEventos ===
            "true"
        ) {

            return;

        }


        container.dataset.tableEventos =
            "true";


        container.addEventListener(
            "click",
            evento => {

                const botao =
                    evento.target.closest(
                        "[data-action]"
                    );


                if (!botao) {

                    return;

                }


                const acao =
                    botao.getAttribute(
                        "data-action"
                    );


                const id =
                    botao.getAttribute(
                        "data-id"
                    );


                if (
                    !id
                ) {

                    console.error(

                        `TABLE ${engine.entity} → ` +
                        `${acao.toUpperCase()} → ` +
                        "botão sem data-id",

                        botao

                    );

                    return;

                }


                console.log(

                    `TABLE ${engine.entity} → ` +
                    `${acao.toUpperCase()} → ID:`,

                    id

                );


                if (
                    acao === "editar"
                ) {

                    engine.editar(
                        id
                    );

                    return;

                }


                if (
                    acao === "excluir"
                ) {

                    engine.excluir(
                        id
                    );

                    return;

                }

            }
        );

    }


    // ========================================================
    // EVENTO ENGINE → RENDERIZAR
    // ========================================================

    function registrarEventosEngine() {

        if (
            !container
        ) {

            return;

        }


        container.addEventListener(

            "engine:renderizar",

            () => {

                renderizar();

            }

        );

    }


    // ========================================================
    // API PÚBLICA
    // ========================================================

    return {

        iniciar,

        renderizar

    };

}
```
