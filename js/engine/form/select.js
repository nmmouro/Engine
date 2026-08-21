import {
    listar
} from "../../services/crudService.js";

export async function configurarSelect(
    campo,
    select,
    valorAtual = ""
) {

    if (!campo.source) {

        preencherSelect(
            select,
            campo.options || [],
            valorAtual
        );

        return;
    }

    select.disabled = true;

    try {

        const registros =
            await listar(
                campo.source
            );

        const opcoes =
            registros.map(
                registro => {

                    const value =
                        registro[
                            campo.valueField ||
                            "ID"
                        ] ?? "";

                    const label =
                        (
                            campo.labelFields ||
                            [campo.valueField || "ID"]
                        )
                            .map(
                                nome =>
                                    registro[nome] ?? ""
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

        preencherSelect(
            select,
            opcoes,
            valorAtual
        );

    } finally {

        select.disabled = false;
    }
}

export function preencherSelect(
    select,
    opcoes,
    valorAtual = ""
) {

    select.innerHTML = "";

    const inicial =
        document.createElement("option");

    inicial.value = "";
    inicial.textContent =
        "Selecione...";

    select.appendChild(inicial);

    opcoes.forEach(opcao => {

        const option =
            document.createElement("option");

        option.value =
            typeof opcao === "object"
                ? opcao.value
                : opcao;

        option.textContent =
            typeof opcao === "object"
                ? opcao.label
                : opcao;

        option.dataset.label =
            option.textContent;

        if (
            String(option.value) ===
            String(valorAtual)
        ) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

export function criarSelect(
    campo
) {

    const select =
        document.createElement(
            "select"
        );

    select.className =
        "form-control";

    if (campo.source) {

        configurarSelect(
            campo,
            select
        );

    } else {

        preencherSelect(
            select,
            campo.options || []
        );
    }

    return select;
}
