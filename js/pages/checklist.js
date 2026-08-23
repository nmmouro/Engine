```javascript
/**
 * ============================================================
 * PÁGINA — CHECKLIST
 * ============================================================
 *
 * Fluxo:
 *
 * Lançamento
 *      ↓
 * Checklist
 *      ↓
 * Checklist Itens
 *
 * O checklist sempre pertence a um lançamento.
 * ============================================================
 */

import { createModule }
    from "../engine/module.js";

import {
    SCHEMA_CHECKLIST_ITENS
} from "../schemas/checklist_itens.js";


// ============================================================
// PARÂMETROS DA URL
// ============================================================

const params =
    new URLSearchParams(
        window.location.search
    );


// ============================================================
// CONTEXTO
// ============================================================

const idLancamento =
    params.get("lancamento") || "";

const idVeiculo =
    params.get("veiculo") || "";

const idEmpregado =
    params.get("empregado") || "";


// ============================================================
// VALIDAÇÃO
// ============================================================

if (!idLancamento) {

    window.alert(
        "Lançamento não informado."
    );

    window.location.href =
        "lancamentos.html";

}


// ============================================================
// CONTEXTO DO CHECKLIST
// ============================================================
//
// Esses dados serão utilizados para que cada item
// fique associado ao lançamento e ao veículo.
//

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

const checklist =
    createModule({

        entity:
            "CHECKLIST_ITENS",

        schema:
            SCHEMA_CHECKLIST_ITENS,

        container:
            "#app",

        stateName:
            "checklistItens",

        options: {

            titulo:
                "Checklist do Veículo",

            tabela:
                "Itens do Checklist",

            permitirNovo:
                true,

            permitirEditar:
                true,

            permitirExcluir:
                true

        }

    });


// ============================================================
// DISPONIBILIZAR CONTEXTO
// ============================================================
//
// O contexto fica disponível para que o formulário possa
// utilizar os IDs recebidos pela URL.
//

if (checklist?.state) {

    checklist.state.contexto =
        contextoChecklist;

}


// ============================================================
// EXPOR CONTEXTO PARA OUTROS MÓDULOS
// ============================================================

window.contextoChecklist =
    contextoChecklist;
```
