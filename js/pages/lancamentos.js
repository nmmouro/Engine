/**
 * ============================================================
 * PÁGINA — LANÇAMENTOS
 * ============================================================
 */

import { createModule } from "../engine/module.js";
import { SCHEMA_LANCAMENTOS } from "../schemas/lancamentos.js";


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
