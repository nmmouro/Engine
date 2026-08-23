/**
 * ============================================================
 * TABLE ENGINE
 * ============================================================
 *
 * Responsável por:
 * - Criar tabela automaticamente a partir do Schema
 * - Exibir registros
 * - Criar cabeçalho
 * - Criar linhas
 * - Criar ações de Editar / Excluir
 * - Exibir estado vazio
 * - Exibir carregamento
 *
 * Não conhece nenhuma entidade específica.
 * ============================================================
 */


/**
 * Cria uma tabela Engine.
 *
 * @param {Object} config
 * @param {Object} config.schema
 * @param {HTMLElement|string} config.container
 * @param {Object} config.actions
 *
 * @returns {Object}
 */
export function createTable(config = {}) {

    const {
        schema,
        container,
        actions = {}
    } = config;


    // ------------------------------------------------------------
    // Validações
    // ------------------------------------------------------------

    if (!schema) {

        throw new Error(
            "Table: schema não informado."
        );

    }


    if (!Array.isArray(schema.fields)) {

        throw new Error(
            `Table ${schema.entity}: fields inválido.`
        );

    }


    const elemento =
        resolverElemento(container);


    if (!elemento) {

        throw new Error(
            `Table: container não encontrado: ${container}`
        );

    }


    // ------------------------------------------------------------
    // Estado
    // ------------------------------------------------------------

    let registros = [];


    // ------------------------------------------------------------
    // Renderiza tabela
    // ------------------------------------------------------------

    function render(lista = []) {

        registros =
            Array.isArray(lista)
                ? lista
                : [];


        elemento.innerHTML = "";


        // --------------------------------------------------------
        // Estado vazio
        // --------------------------------------------------------

        if (registros.length === 0) {

            renderVazio();

            return;

        }


        // --------------------------------------------------------
        // Wrapper
        // --------------------------------------------------------

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "engine-table-wrapper";


        // --------------------------------------------------------
        // Tabela
        // --------------------------------------------------------

        const tabela =
            document.createElement("table");

        tabela.className =
            "engine-table";


        // --------------------------------------------------------
        // Cabeçalho
        // --------------------------------------------------------

        tabela.appendChild(
            criarCabecalho()
        );


        // --------------------------------------------------------
        // Corpo
        // --------------------------------------------------------

        const tbody =
            document.createElement("tbody");


        registros.forEach((registro, indice) => {

            tbody.appendChild(
                criarLinha(
                    registro,
                    indice
                )
            );

        });


        tabela.appendChild(tbody);


        wrapper.appendChild(tabela);

        elemento.appendChild(wrapper);

    }


    // ------------------------------------------------------------
    // Cria cabeçalho
    // ------------------------------------------------------------

    function criarCabecalho() {

        const thead =
            document.createElement("thead");


        const tr =
            document.createElement("tr");


        schema.fields

            .filter(
                campo =>
                    deveExibirColuna(campo)
            )

            .forEach(campo => {

                const th =
                    document.createElement("th");


                th.textContent =
                    campo.tableLabel ||
                    campo.label ||
                    campo.name;


                th.dataset.field =
                    campo.name;


                tr.appendChild(th);

            });


        // --------------------------------------------------------
        // Coluna de ações
        // --------------------------------------------------------

        if (possuiAcoes()) {

            const th =
                document.createElement("th");


            th.textContent =
                "Ações";


            th.className =
                "engine-table-actions-header";


            tr.appendChild(th);

        }


        thead.appendChild(tr);


        return thead;

    }


    // ------------------------------------------------------------
    // Cria linha
    // ------------------------------------------------------------

    function criarLinha(
        registro,
        indice
    ) {

        const tr =
            document.createElement("tr");


        tr.dataset.index =
            indice;


        // --------------------------------------------------------
        // Campos
        // --------------------------------------------------------

        schema.fields

            .filter(
                campo =>
                    deveExibirColuna(campo)
            )

            .forEach(campo => {

                const td =
                    document.createElement("td");


                td.dataset.field =
                    campo.name;


                const valor =
                    registro?.[campo.name];


                td.appendChild(
                    renderValor(
                        campo,
                        valor,
                        registro
                    )
                );


                tr.appendChild(td);

            });


        // --------------------------------------------------------
        // Ações
        // --------------------------------------------------------

        if (possuiAcoes()) {

            tr.appendChild(
                criarAcoes(
                    registro,
                    indice
                )
            );

        }


        return tr;

    }


    // ------------------------------------------------------------
    // Renderiza valor
    // ------------------------------------------------------------

    function renderValor(
        campo,
        valor,
        registro
    ) {

        // --------------------------------------------------------
        // Valor vazio
        // --------------------------------------------------------

        if (
            valor === undefined ||
            valor === null ||
            valor === ""
        ) {

            const span =
                document.createElement("span");

            span.className =
                "engine-table-empty";

            span.textContent =
                "—";


            return span;

        }


        // --------------------------------------------------------
        // Função personalizada
        // --------------------------------------------------------

        if (
            typeof campo.formatter ===
            "function"
        ) {

            const resultado =
                campo.formatter(
                    valor,
                    registro
                );


            return criarTexto(
                resultado
            );

        }


        // --------------------------------------------------------
        // Boolean
        // --------------------------------------------------------

        if (
            campo.type === "checkbox" ||
            typeof valor === "boolean"
        ) {

            return criarTexto(
                valor
                    ? "Sim"
                    : "Não"
            );

        }


        // --------------------------------------------------------
        // Select
        // --------------------------------------------------------

        if (
            campo.type === "select"
        ) {

            return criarTexto(
                obterLabelOption(
                    campo,
                    valor
                )
            );

        }


        // --------------------------------------------------------
        // Date
        // --------------------------------------------------------

        if (
            campo.type === "date"
        ) {

            return criarTexto(
                formatarData(valor)
            );

        }


        // --------------------------------------------------------
        // Number
        // --------------------------------------------------------

        if (
            campo.type === "number"
        ) {

            return criarTexto(
                formatarNumero(valor)
            );

        }


        // --------------------------------------------------------
        // Padrão
        // --------------------------------------------------------

        return criarTexto(valor);

    }


    // ------------------------------------------------------------
    // Cria texto
    // ------------------------------------------------------------

    function criarTexto(valor) {

        const span =
            document.createElement("span");


        span.textContent =
            valor === undefined ||
            valor === null
                ? ""
                : String(valor);


        return span;

    }


    // ------------------------------------------------------------
    // Label de option
    // ------------------------------------------------------------

    function obterLabelOption(
        campo,
        valor
    ) {

        // --------------------------------------------------------
        // Select relacional
        // --------------------------------------------------------

        if (
            campo.source &&
            campo.labelFields
        ) {

            return valor;

        }


        // --------------------------------------------------------
        // Select normal
        // --------------------------------------------------------

        if (
            !Array.isArray(
                campo.options
            )
        ) {

            return valor;

        }


        const encontrada =
            campo.options.find(opcao => {

                if (
                    typeof opcao ===
                    "object" &&
                    opcao !== null
                ) {

                    return (
                        String(opcao.value) ===
                        String(valor)
                    );

                }


                return (
                    String(opcao) ===
                    String(valor)
                );

            });


        if (
            encontrada &&
            typeof encontrada ===
            "object"
        ) {

            return (
                encontrada.label ??
                encontrada.value ??
                valor
            );

        }


        return encontrada ?? valor;

    }


    // ------------------------------------------------------------
    // Cria ações
    // ------------------------------------------------------------

    function criarAcoes(
        registro,
        indice        
    ) {

        const td =
            document.createElement("td");


        td.className =
            "engine-table-actions";


        // --------------------------------------------------------
        // Editar
        // --------------------------------------------------------

        if (
            typeof actions.editar ===
            "function"
        ) {

            const botaoEditar =
                criarBotao(
                    "Editar",
                    "btn btn-sm btn-edit"
                );


            botaoEditar.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();


                    actions.editar(
                        registro,
                        indice
                    );

                }
            );


            td.appendChild(
                botaoEditar
            );

        }

        // ========================================================
        // REALIZAR CHECKLIST
                                                                                        // ========================================================
        
        if ( typeof actions.abrirChecklist === "function"
           ) {
            
           const botaoChecklist =
        document.createElement("button");

    botaoChecklist.type =
        "button";

    botaoChecklist.className =
        "btn btn-secondary";

    botaoChecklist.textContent =
        "Realizar Checklist";


    botaoChecklist.addEventListener(
        "click",
        () => {

            actions.abrirChecklist(
                registro,
                indice
            );

        }
    );


    containerAcoes.appendChild(
        botaoChecklist
    );

}


        // --------------------------------------------------------
        // Excluir
        // --------------------------------------------------------

        if (
            typeof actions.excluir ===
            "function"
        ) {

            const botaoExcluir =
                criarBotao(
                    "Excluir",
                    "btn btn-sm btn-delete"
                );


            botaoExcluir.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();


                    actions.excluir(
                        registro,
                        indice
                    );

                }
            );


            td.appendChild(
                botaoExcluir
            );

        }


        return td;

    }


    // ------------------------------------------------------------
    // Cria botão
    // ------------------------------------------------------------

    function criarBotao(
        texto,
        classe
    ) {

        const botao =
            document.createElement("button");


        botao.type =
            "button";


        botao.className =
            classe;


        botao.textContent =
            texto;


        return botao;

    }


    // ------------------------------------------------------------
    // Verifica ações
    // ------------------------------------------------------------

    function possuiAcoes() {

        return (
            typeof actions.editar ===
                "function" ||

            typeof actions.excluir ===
                "function"
        );

    }


    // ------------------------------------------------------------
    // Estado vazio
    // ------------------------------------------------------------

    function renderVazio(
        mensagem =
            "Nenhum registro encontrado."
    ) {

        const vazio =
            document.createElement("div");


        vazio.className =
            "engine-table-empty-state";


        vazio.textContent =
            mensagem;


        elemento.appendChild(
            vazio
        );

    }


    // ------------------------------------------------------------
    // Loading
    // ------------------------------------------------------------

    function renderLoading(
        mensagem =
            "Carregando..."
    ) {

        elemento.innerHTML = "";


        const loading =
            document.createElement("div");


        loading.className =
            "engine-table-loading";


        loading.textContent =
            mensagem;


        elemento.appendChild(
            loading
        );

    }


    // ------------------------------------------------------------
    // Atualiza um registro
    // ------------------------------------------------------------

    function atualizar(
        registro,
        indice
    ) {

        if (
            indice < 0 ||
            indice >= registros.length
        ) {

            return;

        }


        registros[indice] =
            registro;


        render(registros);

    }


    // ------------------------------------------------------------
    // Remove um registro
    // ------------------------------------------------------------

    function remover(indice) {

        if (
            indice < 0 ||
            indice >= registros.length
        ) {

            return;

        }


        registros.splice(
            indice,
            1
        );


        render(registros);

    }


    // ------------------------------------------------------------
    // Obtém registros
    // ------------------------------------------------------------

    function getData() {

        return [...registros];

    }


    // ------------------------------------------------------------
    // Decide quais colunas aparecem
    // ------------------------------------------------------------

    function deveExibirColuna(campo) {

        const nome =
            typeof campo === "string"
                ? campo
                : campo?.name;


        if (!nome) {

            return false;

        }


        // --------------------------------------------------------
        // Campos técnicos
        // --------------------------------------------------------

        if (
            nome === "ID" ||
            nome.startsWith("ID ")
        ) {

            return false;

        }


        return true;

    }


    // ------------------------------------------------------------
    // Formata data
    // ------------------------------------------------------------

    function formatarData(valor) {

        if (!valor) {

            return "";

        }


        const texto =
            String(valor);


        // dd/mm/yyyy

        if (
            /^\d{2}\/\d{2}\/\d{4}$/
                .test(texto)
        ) {

            return texto;

        }


        // yyyy-mm-dd

        if (
            /^\d{4}-\d{2}-\d{2}$/
                .test(texto)
        ) {

            const [
                ano,
                mes,
                dia
            ] =
                texto.split("-");


            return (
                `${dia}/${mes}/${ano}`
            );

        }


        return texto;

    }


    // ------------------------------------------------------------
    // Formata número
    // ------------------------------------------------------------

    function formatarNumero(valor) {

        if (valor === "") {

            return "";

        }


        const numero =
            Number(valor);


        if (
            Number.isNaN(numero)
        ) {

            return String(valor);

        }


        return new Intl.NumberFormat(
            "pt-BR"
        ).format(numero);

    }


    // ------------------------------------------------------------
    // Resolve container
    // ------------------------------------------------------------

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


    // ------------------------------------------------------------
    // API pública
    // ------------------------------------------------------------

    return {

        render,

        renderLoading,

        renderVazio,

        atualizar,

        remover,

        getData

    };

}
