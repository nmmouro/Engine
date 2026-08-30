/**
 * ============================================================
 * TABLE
 * Painel Frota
 *
 * Responsabilidade:
 * - Renderizar tabela
 * - Paginação
 * - Formatação
 * - Botões de ação
 *
 * Não conhece Supabase.
 * Não conhece PostgreSQL.
 * ============================================================
 */

export function createTable(config = {}) {

    const entity =
        config.entity || "";

    const schema =
        config.schema || {};

    const options =
        config.options || {};

    const container =
        config.container;

    const state =
        config.state;

    const engine =
        config.engine;


    if (!container) {
        throw new Error(
            `Table ${entity}: container não informado.`
        );
    }


    // ========================================================
    // INICIAR
    // ========================================================

    function iniciar() {

        console.log(
            `TABLE ${entity} → INICIAR`
        );

        renderizar();

        console.log(
            `TABLE ${entity} → INICIADO`
        );

    }


    // ========================================================
    // RENDERIZAR
    // ========================================================

    function renderizar() {

        const registros =
            obterRegistrosPagina();


        if (!registros.length) {

            container.innerHTML = `
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


        colunas.forEach(coluna => {

            html += `
                <th>
                    ${escaparHTML(
                        obterTituloColuna(coluna)
                    )}
                </th>
            `;

        });


        html += `
                <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
        `;


        registros.forEach(registro => {

            const id =
                obterId(registro);


            html += `
                <tr>
            `;


            colunas.forEach(coluna => {

                const nome =
                    obterNomeColuna(coluna);

                const valor =
                    registro?.[nome];


                html += `
                    <td>
                        ${formatarCelula(
                            valor,
                            coluna
                        )}
                    </td>
                `;

            });


            html += `
                    <td class="engine-actions">

                        ${
                            options.permitirEditar !== false
                                ? `
                                    <button
                                        type="button"
                                        data-action="editar"
                                        data-id="${escaparAtributo(id)}"
                                    >
                                        Editar
                                    </button>
                                  `
                                : ""
                        }


                        ${
                            options.permitirExcluir !== false
                                ? `
                                    <button
                                        type="button"
                                        data-action="excluir"
                                        data-id="${escaparAtributo(id)}"
                                    >
                                        Excluir
                                    </button>
                                  `
                                : ""
                        }

                        ${renderizarActions(registro)}

                    </td>
                </tr>
            `;

        });


        html += `
                </tbody>

            </table>
        `;


        container.innerHTML =
            html;

    }


    // ========================================================
    // REGISTROS DA PÁGINA
    // ========================================================

    function obterRegistrosPagina() {

        const registros =
            typeof state.obterRegistrosFiltrados === "function"
                ? state.obterRegistrosFiltrados()
                : (
                    Array.isArray(state.registros)
                        ? state.registros
                        : []
                );


        const tamanho =
            Number(
                state.paginaTamanho || 10
            );


        const pagina =
            Number(
                state.paginaAtual || 1
            );


        const inicio =
            (pagina - 1) * tamanho;


        return registros.slice(
            inicio,
            inicio + tamanho
        );

    }


    // ========================================================
    // COLUNAS
    // ========================================================

    function obterColunas() {

        if (
            Array.isArray(options.colunas)
        ) {

            return options.colunas.filter(
                coluna =>
                    obterNomeColuna(coluna) !== "id" &&
                    obterNomeColuna(coluna) !== "ID"
            );

        }


        if (
            Array.isArray(schema.fields)
        ) {

            return schema.fields.filter(
                campo => {

                    const nome =
                        obterNomeColuna(campo);

                    return (
                        campo.visible !== false &&
                        campo.hidden !== true &&
                        nome !== "id" &&
                        nome !== "ID"
                    );

                }
            );

        }


        const primeiro =
            state.registros?.[0] || {};


        return Object.keys(primeiro)
            .filter(
                nome =>
                    nome !== "id" &&
                    nome !== "ID"
            )
            .map(
                nome => ({
                    name: nome,
                    label: nome
                })
            );

    }


    // ========================================================
    // NOME DA COLUNA
    // ========================================================

    function obterNomeColuna(coluna) {

        return (
            coluna?.name ||
            coluna?.campo ||
            coluna
        );

    }


    // ========================================================
    // TÍTULO DA COLUNA
    // ========================================================

    function obterTituloColuna(coluna) {

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

    function obterId(registro) {

        return (
            registro?.id ??
            registro?.ID ??
            ""
        );

    }


    // ========================================================
    // FORMATAR CÉLULA
    // ========================================================

    function formatarCelula(valor, coluna) {

        if (
            valor === null ||
            valor === undefined ||
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
            String(valor)
        );

    }


    // ========================================================
    // ACTIONS PERSONALIZADAS
    // ========================================================

    function renderizarActions(registro) {

        const actions =
            options.actions || {};


        return Object.keys(actions)

            .map(nome => {

                if (
                    typeof actions[nome] !== "function"
                ) {

                    return "";

                }


                return `
                    <button
                        type="button"
                        data-engine-action="${escaparAtributo(nome)}"
                        data-id="${escaparAtributo(
                            obterId(registro)
                        )}"
                    >
                        ${escaparHTML(
                            obterTituloAction(nome)
                        )}
                    </button>
                `;

            })

            .join("");

    }


    // ========================================================
    // TÍTULO ACTION
    // ========================================================

    function obterTituloAction(nome) {

        const titulos = {

            abrirChecklist: "Checklist",
            abastecer: "Abastecer",
            visualizar: "Visualizar",
            finalizar: "Finalizar"

        };


        return (
            titulos[nome] ||
            nome
        );

    }


    // ========================================================
    // ESCAPAR HTML
    // ========================================================

    function escaparHTML(valor) {

        return String(
            valor ?? ""
        )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    }


    // ========================================================
    // ESCAPAR ATRIBUTO
    // ========================================================

    function escaparAtributo(valor) {

        return escaparHTML(valor);

    }


    // ========================================================
    // API PÚBLICA
    // ========================================================

    return {

        iniciar,

        renderizar

    };

}
