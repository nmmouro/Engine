import { createModule } from "../engine/module.js";
import { SCHEMA_VEICULOS } from "../schemas/veiculos.schema.js";

createModule({
    entity: "VEICULOS",

    schema: SCHEMA_VEICULOS,

    container: "#app",

    stateName: "veiculos",

    options: {
        titulo: "Cadastro de Veículos",
        tabela: "Veículos Cadastrados",
        permitirNovo: true,
        permitirEditar: true,
        permitirExcluir: true
    }
});
