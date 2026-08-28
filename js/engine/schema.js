// ============================================================
// ENGINE - SCHEMA
// js/engine/schema.js
// ============================================================

/**
 * Cria e normaliza um Schema da aplicação.
 *
 * Uso:
 *
 * import { createSchema } from "../engine/schema.js";
 *
 * const SCHEMA_VEICULOS = createSchema({
 *     entity: "VEICULOS",
 *     fields: {
 *         ...
 *     }
 * });
 */

// ============================================================
// CREATE SCHEMA
// ============================================================

export function createSchema(definition = {}) {

    if (!definition || typeof definition !== "object") {
        throw new TypeError(
            "createSchema: a definição do schema deve ser um objeto."
        );
    }

    const entity = definition.entity;

    if (!entity || typeof entity !== "string") {
        throw new Error(
            "createSchema: o campo 'entity' é obrigatório."
        );
    }

    const fields = definition.fields;

    if (!fields || typeof fields !== "object") {
        throw new Error(
            `createSchema: o campo 'fields' é obrigatório para ${entity}.`
        );
    }

    // --------------------------------------------------------
    // Normalização dos campos
    // --------------------------------------------------------

    const normalizedFields = Object.entries(fields).map(
        ([name, config = {}]) => {

            if (!config || typeof config !== "object") {
                config = {};
            }

            return {
                name,

                label:
                    config.label ??
                    name,

                type:
                    config.type ??
                    "text",

                required:
                    config.required === true,

                hidden:
                    config.hidden === true,

                readonly:
                    config.readonly === true,

                placeholder:
                    config.placeholder ??
                    "",

                default:
                    config.default ?? null,

                options:
                    Array.isArray(config.options)
                        ? config.options
                        : [],

                ...config
            };
        }
    );

    // --------------------------------------------------------
    // Retorno do Schema
    // --------------------------------------------------------

    return Object.freeze({

        entity,

        fields: normalizedFields,

        // Campos visíveis
        visibleFields:
            normalizedFields.filter(
                campo => !campo.hidden
            ),

        // Campos ocultos
        hiddenFields:
            normalizedFields.filter(
                campo => campo.hidden
            ),

        // Campos obrigatórios
        requiredFields:
            normalizedFields.filter(
                campo => campo.required
            ),

        // Busca campo pelo nome
        getField(nome) {
            return normalizedFields.find(
                campo => campo.name === nome
            );
        },

        // Retorna somente nomes dos campos
        getFieldNames() {
            return normalizedFields.map(
                campo => campo.name
            );
        },

        // Retorna valores padrão
        getDefaults() {

            const defaults = {};

            normalizedFields.forEach(campo => {

                if (campo.default !== null) {
                    defaults[campo.name] = campo.default;
                }

            });

            return defaults;
        }

    });
}


// ============================================================
// VALIDAÇÃO DE SCHEMA
// ============================================================

export function validateSchema(schema) {

    if (!schema || typeof schema !== "object") {
        return false;
    }

    if (
        typeof schema.entity !== "string" ||
        !schema.entity.trim()
    ) {
        return false;
    }

    if (!Array.isArray(schema.fields)) {
        return false;
    }

    return true;
}


// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
    createSchema,
    validateSchema
};
