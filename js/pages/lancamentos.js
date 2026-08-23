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

function abrirChecklist(dados = {}, registro = null) {

const lancamento =
    registro || dados || {};

const idLancamento =
    lancamento.ID || "";

const idVeiculo =
    lancamento["ID Veículo"] || "";

const idEmpregado =
    lancamento["ID Empregado"] || "";

    if (!idLancamento) { window.alert( "Salve o lançamento antes de realizar o checklist." ); return; }

    const params =
        new URLSearchParams();
    
    params.set(
        "lancamento",
        String(idLancamento)
    );
    
    params.set(
        "veiculo",
        String(idVeiculo)
    );
    
    params.set(
        "empregado",
        String(idEmpregado)
    );

// --------------------------------------------------------
// Navegação
// --------------------------------------------------------

    window.location.href =
        "checklist.html?" +
        params.toString();

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
