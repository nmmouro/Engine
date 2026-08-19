export function createSchema(config = {}) {

    if (!config.entity) {
        throw new Error("Schema: entity não informado.");
    }

    if (!Array.isArray(config.fields)) {
        throw new Error(
            `Schema ${config.entity}: fields deve ser um array.`
        );
    }

    return {
        entity: config.entity,
        fields: config.fields
    };
}
