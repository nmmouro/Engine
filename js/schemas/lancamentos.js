import { createSchema } from "../engine/schema.js";


export const SCHEMA_LANCAMENTOS = createSchema({

    entity: "LANCAMENTOS",

    fields: [

        {
            name: "ID",
            type: "text",
            visible: false
        },

        {
            name: "ID Empregado",
            type: "text",
            visible: false
        },

        {
            name: "ID Veículo",
            type: "text",
            visible: false
        },

        {
            name: "Data",
            type: "date",
            required: true
        },

        {
            name: "Hora",
            type: "time",
            required: true
        },

        {
            name: "Empregado / Matrícula",
            type: "select",
            required: true,

            source: "EMPREGADOS",

            valueField: "ID",

            labelFields: [
                "Empregado",
                "Matrícula"
            ],

            separator: " / ",

            idField: "ID Empregado"

        },
        {
            name: "Veículo",
            type: "select",
            required: true,

            source: "VEICULOS",

            valueField: "ID",

            labelFields: [
                "Modelo",
                "Placa"
            ],

            separator: " / ",

            idField: "ID Veículo"

        },

        {
            name: "Passageiro / Setor / Motivo",
            type: "text",
            required: true
        },

        {
            name: "Itinerário",
            type: "text"
        },

        {
            name: "Km Final",
            type: "number"
        },

        {
            name: "Status",
            type: "select",
            options: [
                "EM ANDAMENTO",
                "CONCLUÍDO",
                "CANCELADO"
            ]
        }

    ]

});
