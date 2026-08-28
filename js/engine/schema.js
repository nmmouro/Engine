```javascript
// ============================================================================
// ENGINE SCHEMA
// Arquivo: js/engine/schema.js
//
// Responsável por:
//
// - Validar schemas
// - Normalizar campos
// - Localizar campos
// - Separar campos visíveis e ocultos
// - Preparar configurações utilizadas pelo Engine
//
// ============================================================================


// ============================================================================
// CRIAR SCHEMA
// ============================================================================

export function createSchema(config = {}) {

    const {

        entity,

        table,

        title,

        key = "ID",

        fields = []

    } = config;


    // ------------------------------------------------------------------------
    // VALIDAÇÕES
    // ------------------------------------------------------------------------

    if (!entity) {

        throw new Error(
            "Schema: propriedade 'entity' não informada."
        );

    }


    if (!Array.isArray(fields)) {

        throw new Error(
            `Schema ${entity}: 'fields' deve ser um array.`
        );

    }


    // ------------------------------------------------------------------------
    // NORMALIZAR CAMPOS
    // ------------------------------------------------------------------------

    const normalizedFields =

        fields.map(

            (field, index) =>

                normalizeField(
                    field,
                    index
                )

        );


    // ------------------------------------------------------------------------
    // VALIDAR CAMPOS DUPLICADOS
    // ------------------------------------------------------------------------

    validateDuplicateFields(
        normalizedFields,
        entity
    );


    // ------------------------------------------------------------------------
    // RETORNO DO SCHEMA
    // ------------------------------------------------------------------------

    return {

        entity,

        table:
            table || entity.toLowerCase(),

        title:
            title || entity,

        key,

        fields:
            normalizedFields,

        getField(name) {

            return getField(
                normalizedFields,
                name
            );

        },

        getVisibleFields() {

            return getVisibleFields(
                normalizedFields
            );

        },

        getFormFields() {

            return getFormFields(
                normalizedFields
            );

        },

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

    if (!field || typeof field !== "object") {

        throw new Error(
            `Schema: campo inválido na posição ${index}.`
        );

    }


    const {

        name,

        field: fieldName,

        campo,

        label,

        title,

        titulo,

        type,

        tipo,

        options,

        opcoes,

        required,

        obrigatorio,

        visible,

        form,

        table,

        readonly,

        disabled,

        defaultValue,

        valorPadrao,

        placeholder,

        width

    } = field;


    // ------------------------------------------------------------------------
    // NOME DO CAMPO
    // ------------------------------------------------------------------------

    const finalName =
        name ||
        fieldName ||
        campo;


    if (!finalName) {

        throw new Error(
            `Schema: campo sem nome na posição ${index}.`
        );

    }


    // ------------------------------------------------------------------------
    // LABEL
    // ------------------------------------------------------------------------

    const finalLabel =
        label ||
        title ||
        titulo ||
        finalName;


    // ------------------------------------------------------------------------
    // TIPO
    // ------------------------------------------------------------------------

    const finalType =
        type ||
        tipo ||
        "text";


    // ------------------------------------------------------------------------
    // OPÇÕES
    // ------------------------------------------------------------------------

    const finalOptions =
        options ||
        opcoes ||
        [];


    // ------------------------------------------------------------------------
    // OBRIGATÓRIO
    // ------------------------------------------------------------------------

    const finalRequired =

        required === true ||
        obrigatorio === true;


    // ------------------------------------------------------------------------
    // VALOR PADRÃO
    // ------------------------------------------------------------------------

    const finalDefaultValue =

        defaultValue !== undefined
            ? defaultValue
            : valorPadrao;


    // ------------------------------------------------------------------------
    // CONFIGURAÇÃO NORMALIZADA
    // ------------------------------------------------------------------------

    return {

        ...field,

        name:
            finalName,

        field:
            finalName,

        campo:
            finalName,


        label:
            finalLabel,

        title:
            finalLabel,

        titulo:
            finalLabel,


        type:
            finalType,

        tipo:
            finalType,


        options:
            finalOptions,

        opcoes:
            finalOptions,


        required:
            finalRequired,

        obrigatorio:
            finalRequired,


        visible:
            visible !== false,


        form:
            form !== false,


        table:
            table !== false,


        readonly:
            readonly === true,


        disabled:
            disabled === true,


        defaultValue:
            finalDefaultValue,

        valorPadrao:
            finalDefaultValue,


        placeholder:
            placeholder || "",


        width:
            width || null

    };

}


// ============================================================================
// VALIDAR CAMPOS DUPLICADOS
// ============================================================================

export function validateDuplicateFields(
    fields,
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
                    `Schema ${entity}: campo duplicado '${field.name}'.`
                );

            }


            names.add(
                field.name
            );

        }
    );

}


// ============================================================================
// OBTER CAMPO
// ============================================================================

export function getField(
    fields = [],
    name
) {

    if (!name) {

        return null;

    }


    return (

        fields.find(
            field =>

                field.name === name ||

                field.field === name ||

                field.campo === name
        )

        ||

        null

    );

}


// ============================================================================
// VERIFICAR SE CAMPO EXISTE
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

    return fields.filter(
        field =>

            field.visible !== false
    );

}


// ============================================================================
// CAMPOS DO FORMULÁRIO
// ============================================================================

export function getFormFields(
    fields = []
) {

    return fields.filter(
        field => {

            return (

                field.visible !== false &&

                field.form !== false &&

                field.type !== "id" &&

                field.tipo !== "id"

            );

        }
    );

}


// ============================================================================
// CAMPOS DA TABELA
// ============================================================================

export function getTableFields(
    fields = []
) {

    return fields.filter(
        field => {

            return (

                field.visible !== false &&

                field.table !== false &&

                field.type !== "id" &&

                field.tipo !== "id"

            );

        }
    );

}


// ============================================================================
// NORMALIZAR SCHEMA JÁ EXISTENTE
// ============================================================================

export function normalizeSchema(
    schema = {}
) {

    if (!schema) {

        throw new Error(
            "Schema não informado."
        );

    }


    // ------------------------------------------------------------------------
    // SE JÁ FOI CRIADO PELO createSchema()
    // ------------------------------------------------------------------------

    if (

        typeof schema.getField === "function" &&

        Array.isArray(
            schema.fields
        )

    ) {

        return schema;

    }


    // ------------------------------------------------------------------------
    // COMPATIBILIDADE COM:
    //
    // {
    //     entity: "VEICULOS",
    //     fields: [...]
    // }
    //
    // E:
    //
    // {
    //     nome: "VEÍCULOS",
    //     campos: [...]
    // }
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
// EXPORT PADRÃO
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
