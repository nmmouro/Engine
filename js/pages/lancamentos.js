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

// ============================================================
// ABRIR CHECKLIST
// ============================================================

function abrirChecklist(registro) {

    if (!registro) {

        window.alert(
            "Lançamento não informado."
        );

        return;
    }


    const idLancamento =
        registro.ID || "";


    const idVeiculo =
        registro["ID Veículo"] || "";


    const idEmpregado =
        registro["ID Empregado"] || "";


    if (!idLancamento) {

        window.alert(
            "O lançamento não possui ID."
        );

        return;
    }


    const url =
        "checklist.html" +
        "?lancamento=" +
        encodeURIComponent(
            idLancamento
        ) +
        "&veiculo=" +
        encodeURIComponent(
            idVeiculo
        ) +
        "&empregado=" +
        encodeURIComponent(
            idEmpregado
        );


    window.location.href = url;

}

// ============================================================
// CRIAR MÓDULO
// ============================================================

const engine =
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
    }

});
