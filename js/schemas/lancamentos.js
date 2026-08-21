import { createSchema } from "../engine/schema.js";


export const SCHEMA_LANCAMENTOS = createSchema({

    entity: "LANCAMENTOS",

    fields: [

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
            required: true
        },

        {
            name: "Veículo",
            type: "select",
            required: true
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
