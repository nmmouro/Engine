import { createSchema } from "../engine/schema.js";

export const SCHEMA_VEICULOS = createSchema({
    entity: "VEICULOS",

    fields: [
        {
            name: "ID",
            type: "text",
            readonly: true
        },
        {
            name: "Data",
            type: "date"
        },
        {
            name: "Foto",
            type: "text"
        },
        {
            name: "Placa",
            type: "text",
            required: true
        },
        {
            name: "Modelo",
            type: "text",
            required: true
        },
        {
            name: "Marca",
            type: "text"
        },
        {
            name: "Ano",
            type: "text"
        },
        {
            name: "Cor",
            type: "text"
        },
        {
            name: "Combustivel",
            type: "select",
            options: [
                "GASOLINA",
                "ETANOL",
                "FLEX",
                "DIESEL",
                "DIESEL S10",
                "ELÉTRICO"
            ]
        },
        {
            name: "Status",
            type: "select",
            options: [
                "ATIVO",
                "EM ANDAMENTO",
                "MANUTENÇÃO",
                "INATIVO"
            ]
        }
    ]
});
