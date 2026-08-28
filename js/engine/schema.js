```javascript
// ============================================================================
// ENGINE - SCHEMA
// Arquivo: js/engine/schema.js
//
// Responsável por:
//
// - Criar schemas
// - Normalizar schemas
// - Normalizar campos
// - Localizar campos
// - Obter campos do formulário
// - Obter campos da tabela
// - Validar campos
//
// Compatível com:
//
// createSchema({
//     entity: "VEICULOS",
//     fields: []
// })
//
// e também com:
//
// {
//     nome: "VEÍCULOS",
//     campos: []
// }
//
// ============================================================================


// ============================================================================
// CREATE SCHEMA
// ============================================================================

export function createSchema(config = {}) {

    const entity =
        config.entity ||
        config.nome ||
        config.name ||
        "";

    const table =
        config.table ||
        config.tabela ||
        entity;

    const title =
        config.title ||
        config.titulo ||
        config.nome ||
        entity;

    const key =
        config.key ||
        config.chave ||
        "ID";

    const fields =
        config.fields ||
        config.campos ||
        [];


    // ------------------------------------------------------------------------
    // VALIDAR ENTIDADE
    // ------------------------------------------------------------------------

    if (!entity) {

        throw new Error(
            "Schema: entidade não informada."
        );

    }


    // ------------------------------------------------------------------------
    // VALIDAR CAMPOS
    // ------------------------------------------------------------------------

    if (!Array.isArray(fields)) {

        throw new Error(
            "Schema " +
            entity +
            ": 'fields' deve ser um array."
        );

    }


    // ------------------------------------------------------------------------
    // NORMALIZAR CAMPOS
    // ------------------------------------------------------------------------

    const normalizedFields =
        fields.map(
            (field, index) => {

                return normalizeField(
                    field,
                    index
                );

            }
        );


    // ------------------------------------------------------------------------
    // VALIDAR DUPLICIDADE
    // ------------------------------------------------------------------------

    validateDuplicateFields(
        normalizedFields,
        entity
    );


    // ------------------------------------------------------------------------
    // RETORNAR SCHEMA
    // ------------------------------------------------------------------------

    return {

        entity,

        table,

        title,

        key,

        fields:
            normalizedFields,


        // ------------------------------------------------------------
        // OBTER CAMPO
        // ------------------------------------------------------------

        getField(name) {

            return getField(
                normalizedFields,
                name
            );

        },


        // ------------------------------------------------------------
        // VERIFICAR CAMPO
        // ------------------------------------------------------------

        hasField(name) {

            return hasField(
                normalizedFields,
                name
            );

        },


        // ------------------------------------------------------------
        // CAMPOS VISÍVEIS
        // ------------------------------------------------------------

        getVisibleFields() {

            return getVisibleFields(
                normalizedFields
            );

        },


        // ------------------------------------------------------------
        // CAMPOS DO FORMULÁRIO
        // ------------------------------------------------------------

        getFormFields() {

            return getFormFields(
                normalizedFields
            );

        },


        // ------------------------------------------------------------
        // CAMPOS DA TABELA
        // ------------------------------------------------------------

        getTableFields() {

            return getTableFields(
                normalizedFields
            );

        }

    };

}


// ============================================================================
// NORMALIZAR CAMPO
// ============================================================================

export function normalizeField(
    field = {},
    index = 0
) {

    if (
        !field ||
        typeof field !== "object"
    ) {

        throw new Error(
            "Schema: campo inválido na posição " +
            index +
            "."
        );

    }


    // ------------------------------------------------------------------------
    // NOME
    // ------------------------------------------------------------------------

    const name =
        field.name ||
        field.field ||
        field.campo ||
        "";


    if (!name) {

        throw new Error(
            "Schema: campo sem nome na posição " +
            index +
            "."
        );

    }


    // ------------------------------------------------------------------------
    // LABEL
    // ------------------------------------------------------------------------

    const label =
        field.label ||
        field.title ||
        field.titulo ||
        name;


    // ------------------------------------------------------------------------
    // TIPO
    // ------------------------------------------------------------------------

    const type =
        field.type ||
        field.tipo ||
        "text";


    // ------------------------------------------------------------------------
    // OPÇÕES
    // ------------------------------------------------------------------------

    let options =
        field.options ||
        field.opcoes ||
        [];


    if (!Array.isArray(options)) {

        options = [];

    }


    // ------------------------------------------------------------------------
    // OBRIGATÓRIO
    // ------------------------------------------------------------------------

    const required =
        field.required === true ||
        field.obrigatorio === true;


    // ------------------------------------------------------------------------
    // VISIBILIDADE
    // ------------------------------------------------------------------------

    const visible =
        field.visible !== false;


    // ------------------------------------------------------------------------
    // FORMULÁRIO
    // ------------------------------------------------------------------------

    const form =
        field.form !== false;


    // ------------------------------------------------------------------------
    // TABELA
    // ------------------------------------------------------------------------

    const table =
        field.table !== false;


    // ------------------------------------------------------------------------
    // SOMENTE LEITURA
    // ------------------------------------------------------------------------

    const readonly =
        field.readonly === true;


    // ------------------------------------------------------------------------
    // DESABILITADO
    // ------------------------------------------------------------------------

    const disabled =
        field.disabled === true;


    // ------------------------------------------------------------------------
    // VALOR PADRÃO
    // ------------------------------------------------------------------------

    let defaultValue;

    if (
        field.defaultValue !== undefined
    ) {

        defaultValue =
            field.defaultValue;

    } else {

        defaultValue =
            field.valorPadrao;

    }


    // ------------------------------------------------------------------------
    // RETORNO
    // ------------------------------------------------------------------------

    return {

        ...field,

        name,

        field:
            name,

        campo:
            name,

        label,

        title:
            label,

        titulo:
            label,

        type,

        tipo:
            type,

        options,

        opcoes:
            options,

        required,

        obrigatorio:
            required,

        visible,

        form,

        table,

        readonly,

        disabled,

        defaultValue,

        valorPadrao:
            defaultValue

    };

}


// ============================================================================
// OBTER CAMPO
// ============================================================================

export function getField(
    fields = [],
    name
) {

    if (
        !Array.isArray(fields) ||
        !name
    ) {

        return null;

    }


    return (

        fields.find(
            field => {

                return (

                    field.name === name ||

                    field.field === name ||

                    field.campo === name

                );

            }
        )

        || null

    );

}


// ============================================================================
// VERIFICAR CAMPO
// ============================================================================

export function hasField(
    fields = [],
    name
) {

    return Boolean(
        getField(
            fields,
            name
        )
    );

}


// ============================================================================
// CAMPOS VISÍVEIS
// ============================================================================

export function getVisibleFields(
    fields = []
) {

    if (
        !Array.isArray(fields)
    ) {

        return [];

    }


    return fields.filter(
        field => {

            return field.visible !== false;

        }
    );

}


// ============================================================================
// CAMPOS DO FORMULÁRIO
// ============================================================================

export function getFormFields(
    fields = []
) {

    if (
        !Array.isArray(fields)
    ) {

        return [];

    }


    return fields.filter(
        field => {

            if (
                field.visible === false
            ) {

                return false;

            }


            if (
                field.form === false
            ) {

                return false;

            }


            // ------------------------------------------------------------
            // ID NÃO APARECE NO FORMULÁRIO
            // ------------------------------------------------------------

            if (
                field.type === "id" ||
                field.tipo === "id"
            ) {

                return false;

            }


            return true;

        }
    );

}


// ============================================================================
// CAMPOS DA TABELA
// ============================================================================

export function getTableFields(
    fields = []
) {

    if (
        !Array.isArray(fields)
    ) {

        return [];

    }


    return fields.filter(
        field => {

            if (
                field.visible === false
            ) {

                return false;

            }


            if (
                field.table === false
            ) {

                return false;

            }


            // ------------------------------------------------------------
            // ID NÃO APARECE NA TABELA
            // ------------------------------------------------------------

            if (
                field.type === "id" ||
                field.tipo === "id"
            ) {

                return false;

            }


            return true;

        }
    );

}


// ============================================================================
// VALIDAR CAMPOS DUPLICADOS
// ============================================================================

export function validateDuplicateFields(
    fields = [],
    entity = ""
) {

    const names =
        new Set();


    fields.forEach(
        field => {

            if (
                names.has(
                    field.name
                )
            ) {

                throw new Error(
                    "Schema " +
                    entity +
                    ": campo duplicado '" +
                    field.name +
                    "'."
                );

            }


            names.add(
                field.name
            );

        }
    );

}


// ============================================================================
// NORMALIZAR SCHEMA EXISTENTE
// ============================================================================

export function normalizeSchema(
    schema = {}
) {

    if (
        !schema ||
        typeof schema !== "object"
    ) {

        throw new Error(
            "Schema inválido."
        );

    }


    // ------------------------------------------------------------------------
    // SE JÁ ESTIVER NORMALIZADO
    // ------------------------------------------------------------------------

    if (
        Array.isArray(schema.fields) &&
        typeof schema.getField === "function"
    ) {

        return schema;

    }


    // ------------------------------------------------------------------------
    // CONVERTER SCHEMA ANTIGO
    // ------------------------------------------------------------------------

    return createSchema({

        entity:
            schema.entity ||
            schema.nome ||
            schema.name,

        table:
            schema.table ||
            schema.tabela,

        title:
            schema.title ||
            schema.titulo ||
            schema.nome,

        key:
            schema.key ||
            schema.chave ||
            "ID",

        fields:
            schema.fields ||
            schema.campos ||
            []

    });

}


// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {

    createSchema,

    normalizeSchema,

    normalizeField,

    getField,

    hasField,

    getVisibleFields,

    getFormFields,

    getTableFields,

    validateDuplicateFields

};
```
