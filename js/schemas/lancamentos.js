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
                                                                    readonly: true,
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
            label: "Hora",
            type: "time",
            required: true,
                                                            readonly: true,
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

            type: "text",

            required:
                    true

        },

        // ========================================================
        // Horário Inicial
        // ========================================================

        {
            name: "Horário Inicial",
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
        // CHECKLIST
        // ========================================================
        
        {
            name: "Checklist",
            label: "Checklist",
            type: "action",
            text: "Realizar Checklist",
            action: "abrirChecklist"
        },


        // ========================================================
        // QUILOMETRAGEM
        // ========================================================

        {
                name:
                    "Km Inicial",

                label:
                    "Km Inicial",

                type:
                    "number",

                readonly:
                    true,

                required:
                    false

            },
        
        
        {
                name:
                    "Km Final",

                label:
                    "Km Final",

                type:
                    "number",

                required:
                   false

            },

        // ========================================================
        // Distância Percorrida
        // ========================================================

        {
            name: "Distância Percorrida",

            type: "number"

        },

         // ========================================================
        // Horário Final
        // ========================================================

        {
            name: "Horário Final",
            label: "Horário Final",
            type: "time",
            required: false
            
    },

        // ========================================================
        // COMBUSTÍVEL
        // ========================================================

        {
                name:
                    "Combustível",

                label:
                    "Combustível",

                type:
                    "select",

                options: [

                    "VAZIO",

                    "1/4",

                    "1/2",

                    "3/4",

                    "CHEIO"

                ],

                required:
                    false

            },

        // ========================================================
        // MÉDIA DE CONSUMO
        // ========================================================

        {
            name: "Média de consumo de combustível",
             label:
                    "Média de consumo de combustível",

            type: "number"

        },

        // ========================================================
        // Duração Atendimento
        // ========================================================

        {
            name: "Duração Atendimento / HH:MM",

            type: "number"

        },


        // ========================================================
        // STATUS
        // ========================================================

        {
                name:
                    "Status",

                label:
                    "Status",

                type:
                    "select",

                required:
                    true,

                options: [

                    "EM ANDAMENTO",

                    "CONCLUÍDO",

                    "CANCELADO"

                ],

                defaultValue:
                    "EM ANDAMENTO"

            }

        ]

    });
