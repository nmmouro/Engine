/**
 * ============================================================
 * FORM SELECT
 * ============================================================
 */

export async function configurarCampoSelect(
    field,
    input,
    valorAtual = "",
    listar = null
) {

    // ============================================================
    // SELECT NORMAL
    // ============================================================

    if (!field.source) {

        preencherSelect(

            input,

            (field.options || [])
                .map(valor => {

                    if (
                        typeof valor === "object" &&
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

                }),

            valorAtual

        );

        return;

    }


    // ============================================================
    // LISTAR NÃO FORNECIDO
    // ============================================================

    if (
        typeof listar !== "function"
    ) {

        throw new Error(
            "select.js: função listar não fornecida."
        );

    }


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

        const registros =
            await listar(
                field.source
            );


        const opcoes =
            criarOpcoesRelacionadas(
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


// ============================================================
// CRIAR SELECT
// ============================================================

export function criarSelect(campo) {

    const select =
        document.createElement(
            "select"
        );


    select.className =
        "form-control";


    const vazio =
        document.createElement(
            "option"
        );


    vazio.value =
        "";


    vazio.textContent =
        campo.placeholder ||
        "Selecione...";


    vazio.selected =
        true;


    select.appendChild(
        vazio
    );


    const options =
        Array.isArray(
            campo.options
        )
            ? campo.options
            : [];


    options.forEach(
        opcao => {

            const option =
                document.createElement(
                    "option"
                );


            if (
                typeof opcao === "object" &&
                opcao !== null
            ) {

                option.value =
                    opcao.value ?? "";


                option.textContent =
                    opcao.label ??
                    opcao.value ??
                    "";

            } else {

                option.value =
                    String(opcao);


                option.textContent =
                    String(opcao);

            }


            option.dataset.label =
                option.textContent;


            select.appendChild(
                option
            );

        }
    );


    return select;

}


// ============================================================
// OPÇÕES RELACIONADAS
// ============================================================

function criarOpcoesRelacionadas(
    field,
    registros
) {

    if (!Array.isArray(registros)) {

        return [];

    }


    const valueField =
        field.valueField || "ID";


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


// ============================================================
// PREENCHER SELECT
// ============================================================

export function preencherSelect(
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
