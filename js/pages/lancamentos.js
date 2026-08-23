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
    
    console.log(
        
        "Abrindo checklist:",
        registro );
    
// --------------------------------------------------------
// ID DO LANÇAMENTO
// --------------------------------------------------------
    
    const idLancamento =
        registro?.ID || "";
    
// --------------------------------------------------------
// ID DO VEÍCULO
// --------------------------------------------------------
    
    const idVeiculo =
        registro?.["ID Veículo"] || "";
    
// --------------------------------------------------------
// ID DO EMPREGADO
// --------------------------------------------------------
    
    const idEmpregado =
        registro?.["ID Empregado"] || "";

    // --------------------------------------------------------
    // VALIDAÇÃO
    // --------------------------------------------------------
    
    if (!idLancamento) {
        
        window.alert(
            "Salve o lançamento antes de realizar o checklist." );
        
        return;
    }

    if (!idVeiculo) {
        
        window.alert(
            "Não foi possível identificar o veículo do lançamento." );
        
        return;
    }
    
// --------------------------------------------------------
// MONTA URL
// --------------------------------------------------------
    
    const url =
        new URL(
            "checklist.html",
            window.location.href
        );
    
    url.searchParams.set(
        "lancamento",
        idLancamento
    );
    
    url.searchParams.set(
        "veiculo",
        idVeiculo
    );
    
    if (idEmpregado) {
        
        url.searchParams.set(
            "empregado",
            idEmpregado
        );
    }
    
// --------------------------------------------------------
// ABRE CHECKLIST 
// --------------------------------------------------------
    
    console.log(
        "Redirecionando para:",
        url.href
    );
    
    window.location.href =
        url.href;
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
    }

});
