import { createModule } from "../engine/module.js";
import { SCHEMA_VEICULOS } from "../schemas/veiculos.js";

createModule({
    entity: "VEICULOS",

    schema: SCHEMA_VEICULOS,

    container: "#app",

    stateName: "veiculos",

    options: {
        titulo: "Cadastro de Veículos",
        
        logo: "img/logo.png",

        tabela: "Veículos Cadastrados",
        permitirNovo: true,
        permitirEditar: true,
        permitirExcluir: true
    }
});
