/**
 * ============================================================
 * PÁGINA — CHECKLIST
 * ============================================================
 *
 * Fluxo:
 *
 * Lançamento
 *     ↓
 * Checklist
 *     ↓
 * CHECKLIST_ITENS
 *
 * Esta página recebe pela URL:
 *
 * ?lancamento=ID
 * &veiculo=ID
 * &empregado=ID
 *
 * ============================================================
 */

import { createModule } from "../engine/module.js";

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
// FUNÇÃO PARA APLICAR O CONTEXTO
// ============================================================
//
// Essa função será usada posteriormente pelo formulário
// para garantir que cada item salvo pertença ao lançamento
// correto.
// ============================================================

function aplicarContextoChecklist(dados = {}) {

    return {

        ...dados,

        "ID Lançamento":
            contextoChecklist["ID Lançamento"],

        "ID Veículo":
            contextoChecklist["ID Veículo"],

        "ID Empregado":
            contextoChecklist["ID Empregado"]

    };

}


// ============================================================
// CRIAR MÓDULO ENGINE
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
// APLICAR CONTEXTO AO ESTADO
// ============================================================
//
// Mantemos o contexto disponível no módulo Engine.
// ============================================================

if (checklist?.state) {

    checklist.state.contexto =
        contextoChecklist;

}


// ============================================================
// EXPOR CONTEXTO
// ============================================================
//
// Útil para outras funções da página,
// sem colocar os IDs na URL novamente.
// ============================================================

window.contextoChecklist =
    contextoChecklist;


// ============================================================
// API DA PÁGINA
// ============================================================

window.checklist =
    {

        modulo:
            checklist,

        contexto:
            contextoChecklist,

        aplicarContexto:
            aplicarContextoChecklist

    };
