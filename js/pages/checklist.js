/**

* ============================================================
* PÁGINA — CHECKLIST
* ============================================================
  */

import { createModule } from "../engine/module.js";
import { SCHEMA_CHECKLIST } from "../schemas/checklist.js";

// ============================================================
// PARÂMETROS DA URL
// ============================================================

const params =
new URLSearchParams(
window.location.search
);

// ============================================================
// CONTEXTO DO LANÇAMENTO
// ============================================================

const idLancamento =
params.get("lancamento") || "";

const idVeiculo =
params.get("veiculo") || "";

const idEmpregado =
params.get("empregado") || "";

// ============================================================
// VALIDAR CONTEXTO
// ============================================================

if (!idLancamento) {


window.alert(
    "Lançamento não informado."
);

window.location.href =
    "lancamentos.html";


}

// ============================================================
// CONTEXTO GLOBAL DO CHECKLIST
// ============================================================

const contextoChecklist = {


"ID Lançamento":
    idLancamento,

"ID Veículo":
    idVeiculo,

"ID Empregado":
    idEmpregado


};

// ============================================================
// CRIAR MÓDULO
// ============================================================

createModule({

  
entity:
    "CHECKLIST",

schema:
    SCHEMA_CHECKLIST,

container:
    "#app",

stateName:
    "checklist",

options: {

    titulo:
        "Checklist do Veículo",

    tabela:
        "Checklists",

    permitirNovo:
        true,

    permitirEditar:
        true,

    permitirExcluir:
        true

}


});
