/**
 * ============================================================
 * FORM - SELECT
 * ============================================================
 */

import {
    listar
} from "../../services/crudService.js";


/**
 * ============================================================
 * CARREGAR OPÇÕES RELACIONADAS
 * ============================================================
 */
export async function carregarOpcoesRelacionadas(field) {

    if (!field.source) {
        return [];
    }

    const registros =
        await listar(
            field.source
        );

    if (!Array.isArray(registros)) {

        console.warn(
            `Nenhum registro encontrado para ${field.source}`
        );

        return [];
    }

    const valueField =
        field.valueField || "ID";

    const labelFields =
        field.labelFields || [
            valueField
        ];

    const separator =
        field.separator ?? " / ";


    return registros.map(registro => {

        const value =
            registro[valueField] ?? "";

        const label =
            labelFields
                .map(nome =>
                    registro[nome] ?? ""
                )
                .join(separator);

        return {
            value,
            label
        };
    });
}


/**
 * ============================================================
 * PREENCHER SELECT
 * ============================================================
 */
export function preencherSelect(
    select,
    opcoes,
    valorAtual = ""
) {

    select.innerHTML = "";

    const opcaoInicial =
        document.createElement("option");

    opcaoInicial.value =
        "";

    opcaoInicial.textContent =
        "Selecione...";

    select.appendChild(
        opcaoInicial
    );


    opcoes.forEach(opcao => {

        const option =
            document.createElement("option");

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
    });
}


/**
 * ============================================================
 * CONFIGURAR SELECT
 * ============================================================
 */
export async function configurarCampoSelect(
    field,
    input,
    valorAtual = ""
) {

    // ============================================================
    // SELECT NORMAL
    // ============================================================

    if (!field.source) {

        const opcoes =
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
                });

        preencherSelect(
            input,
            opcoes,
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
        document.createElement("option");

    carregando.value =
        "";

    carregando.textContent =
        "Carregando...";

    input.appendChild(
        carregando
    );


    try {

        const opcoes =
            await carregarOpcoesRelacionadas(
                field
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

        const erroOption =
            document.createElement("option");

        erroOption.value =
            "";

        erroOption.textContent =
            "Erro ao carregar opções";

        input.appendChild(
            erroOption
        );

    } finally {

        input.disabled =
            false;
    }
}
