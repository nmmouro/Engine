/**
 * ============================================================
 * FORM / SELECT
 * ============================================================
 */

export async function configurarCampoSelect(config = {}) {

    const {
        field,
        input,
        listar,
        valorAtual = ""
    } = config;


    if (!field || !input) {

        return;

    }


    // ============================================================
    // SELECT NORMAL
    // ============================================================

    if (!field.source) {

        preencherSelect(

            input,

            normalizarOpcoes(
                field.options || []
            ),

            valorAtual

        );

        return;

    }


    // ============================================================
    // SELECT RELACIONAL
    // ============================================================

    input.disabled =
        true;


    input.innerHTML =
        "";


    const carregando =
        document.createElement(
            "option"
        );


    carregando.value =
        "";


    carregando.textContent =
        "Carregando...";


    input.appendChild(
        carregando
    );


    try {

        if (
            typeof listar !==
            "function"
        ) {

            throw new Error(
                "select.js: função listar não foi fornecida."
            );

        }


        const registros =
            await listar(
                field.source
            );


        const opcoes =
            montarOpcoesRelacionadas(
                field,
                registros
            );


        preencherSelect(
            input,
            opcoes,
            valorAtual
        );


    } catch (erro) {

        console.error(
            `Erro ao carregar ${field.source}:`,
            erro
        );


        input.innerHTML =
            "";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "Erro ao carregar opções";


        input.appendChild(
            option
        );


    } finally {

        input.disabled =
            false;

    }

}


/**
 * ============================================================
 * NORMALIZAR OPÇÕES
 * ============================================================
 */

function normalizarOpcoes(opcoes) {

    return opcoes.map(
        valor => {

            if (
                typeof valor ===
                    "object" &&
                valor !== null
            ) {

                return {

                    value:
                        valor.value ?? "",

                    label:
                        valor.label ??
                        valor.value ??
                        ""

                };

            }


            return {

                value:
                    String(valor),

                label:
                    String(valor)

            };

        }
    );

}


/**
 * ============================================================
 * MONTAR OPÇÕES RELACIONADAS
 * ============================================================
 */

function montarOpcoesRelacionadas(
    field,
    registros
) {

    if (!Array.isArray(registros)) {

        return [];

    }


    const valueField =
        field.valueField ||
        "ID";


    const labelFields =
        field.labelFields ||
        [valueField];


    const separator =
        field.separator ??
        " / ";


    return registros.map(
        registro => {

            const value =
                registro[valueField] ??
                "";


            const label =
                labelFields
                    .map(
                        nome =>
                            registro[nome] ?? ""
                    )
                    .filter(
                        valor =>
                            valor !== ""
                    )
                    .join(separator);


            return {

                value,

                label

            };

        }
    );

}


/**
 * ============================================================
 * PREENCHER SELECT
 * ============================================================
 */

function preencherSelect(
    select,
    opcoes,
    valorAtual = ""
) {

    select.innerHTML =
        "";


    const inicial =
        document.createElement(
            "option"
        );


    inicial.value =
        "";


    inicial.textContent =
        "Selecione...";


    select.appendChild(
        inicial
    );


    opcoes.forEach(
        opcao => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                opcao.value ?? "";


            option.textContent =
                opcao.label ?? "";


            option.dataset.label =
                opcao.label ?? "";


            if (
                String(opcao.value) ===
                String(valorAtual)
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );

}
