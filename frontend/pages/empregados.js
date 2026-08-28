import { createModule } from "../engine/module.js";

import {
    SCHEMA_EMPREGADOS
} from "../schemas/empregados.js";


createModule({

    entity: "EMPREGADOS",

    schema: SCHEMA_EMPREGADOS,

    container: "#app",

    stateName: "empregados",

    options: {

        titulo: "Cadastro de Empregados",

        tabela: "Empregados Cadastrados",

        permitirNovo: true,

        permitirEditar: true,

        permitirExcluir: true

    }

});
