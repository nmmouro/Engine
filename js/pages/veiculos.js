```javascript
// ============================================================================
// PÁGINA — VEÍCULOS
// Painel Frota
// Arquivo: js/pages/veiculos.js
//
// Responsável por inicializar o módulo de veículos.
//
// Arquitetura:
//   Página → Module → Engine → CRUD Service → API → Supabase
//
// Não utiliza Google Sheets.
// ============================================================================

import { createModule } from "../engine/module.js";
import { SCHEMA_VEICULOS } from "../schemas/veiculos.js";


// ============================================================================
// CONFIGURAÇÃO DO MÓDULO
// ============================================================================

createModule({

    // ------------------------------------------------------------------------
    // ENTIDADE
    // ------------------------------------------------------------------------

    entity:
        "VEICULOS",


    // ------------------------------------------------------------------------
    // SCHEMA
    // ------------------------------------------------------------------------

    schema:
        SCHEMA_VEICULOS,


    // ------------------------------------------------------------------------
    // CONTAINER DA PÁGINA
    // ------------------------------------------------------------------------

    container:
        "#app",


    // ------------------------------------------------------------------------
    // ESTADO
    // ------------------------------------------------------------------------

    stateName:
        "veiculos",


    // ------------------------------------------------------------------------
    // OPÇÕES
    // ------------------------------------------------------------------------

    options: {

        // Título principal
        titulo:
            "Cadastro de Veículos",


        // Título da tabela
        tabela:
            "Veículos Cadastrados",


        // Permissões da tela
        permitirNovo:
            true,

        permitirEditar:
            true,

        permitirExcluir:
            true

    }

});
```

