import { createEngine } from "./engine.js";


/**
 * ============================================================
 * CREATE MODULE
 * ============================================================
 */

export function createModule(config = {}) {

    // ----------------------------------------------------------
    // Validação
    // ----------------------------------------------------------

    if (!config.entity) {

        throw new Error(
            "Module: entity não informado."
        );

    }


    if (!config.schema) {

        throw new Error(
            `Module ${config.entity}: schema não informado.`
        );

    }


    if (!config.container) {

        throw new Error(
            `Module ${config.entity}: container não informado.`
        );

    }


    // ----------------------------------------------------------
    // Cria Engine
    // ----------------------------------------------------------

    const engine =
        createEngine({

            entity:
                config.entity,

            schema:
                config.schema,

            container:
                config.container,

            stateName:
                config.stateName ||
                config.entity.toLowerCase(),

            options:
                config.options || {}

        });


    // ----------------------------------------------------------
    // Retorna módulo
    // ----------------------------------------------------------

    return engine;

}
