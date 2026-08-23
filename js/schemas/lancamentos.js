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
            label: "Data",
            type: "date",
            required: true,
            defaultValue: () => {

                const agora = new Date();

                return (
                agora.getFullYear() +
                "-" +
                String(
                agora.getMonth() + 1
                ).padStart(2, "0") +
                "-" +
                String(
                agora.getDate()
                ).padStart(2, "0")
        );

        }    
        },

        {
            name: "Hora",
            label: "Horário Inicial",
            type: "time",
            required: true,
            defaultValue: () => {

                const agora = new Date();

                return (
                String(
                agora.getHours()
                ).padStart(2, "0") +
                ":" +
                String(
                agora.getMinutes()
                ).padStart(2, "0")
        );

        }
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
        // ITINERÁRIO
        // ========================================================
        
        {
            name: "Checklist",
            label: "Checklist",
            type: "action",
            text: "Realizar Checklist",
            action: "abrirChecklist"
        }


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
