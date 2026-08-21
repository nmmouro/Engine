import { createSchema } from "../engine/schema.js";


export const SCHEMA_LANCAMENTOS = createSchema({

    entity: "LANCAMENTOS",

    fields: [

        // ========================================================
        // CAMPOS TÉCNICOS
        // ========================================================

        {
            name: "ID",
            type: "text",
            visible: false,
            hidden: true,
            readonly: true
        },

        {
            name: "ID Empregado",
            type: "text",
            visible: false,
            hidden: true
        },

        {
            name: "ID Veículo",
            type: "text",
            visible: false,
            hidden: true
        },


        // ========================================================
        // DADOS DO LANÇAMENTO
        // ========================================================

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


        // ========================================================
        // EMPREGADO
        // ========================================================

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


        // ========================================================
        // VEÍCULO
        // ========================================================

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


        // ========================================================
        // MOTIVO
        // ========================================================

        {
            name: "Passageiro / Setor / Motivo",

            type: "text",

            required: true

        },


        // ========================================================
        // ITINERÁRIO
        // ========================================================

        {
            name: "Itinerário",

            type: "text"

        },


        // ========================================================
        // QUILOMETRAGEM
        // ========================================================

        {
            name: "Km Final",

            type: "number"

        },


        // ========================================================
        // STATUS
        // ========================================================

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
