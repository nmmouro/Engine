/**
 * ============================================================
 * PÁGINA — LANÇAMENTOS
 * ============================================================
 */

import { createModule } from "../engine/module.js";
import { SCHEMA_LANCAMENTOS } from "../schemas/lancamentos.js";


/**
 * ============================================================
 * CHECKLIST
 * ============================================================
 */

function abrirChecklist(
    dados,
    registro
) {

    const lancamento =
        registro || dados;

    const idLancamento =
        lancamento?.ID;

    const idVeiculo =
        lancamento?.["ID Veículo"];

    const idEmpregado =
        lancamento?.["ID Empregado"];

    if (!idLancamento) {

        alert(
            "Salve o lançamento antes de realizar o checklist."
        );

        return;

    }

    const url =
        `checklist.html` +
        `?lancamento=${encodeURIComponent(idLancamento)}` +
        `&veiculo=${encodeURIComponent(idVeiculo || "")}` +
        `&empregado=${encodeURIComponent(idEmpregado || "")}`;

    window.location.href =
        url;

}

createModule({

    entity: "LANCAMENTOS",

    schema: SCHEMA_LANCAMENTOS,

    container: "#app",

    stateName: "lancamentos",

    options: {

        titulo: "Diário de Bordo",

        tabela: "Lançamentos",

        permitirNovo: true,

        permitirEditar: true,

        permitirExcluir: true,

        actions: {

            abrirChecklist:
                abrirChecklist

    }

});
