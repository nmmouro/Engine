/**
 * ============================================================
 * SCHEMA — CHECKLIST_ITENS
 * ============================================================
 *
 * Itens individuais pertencentes a um Checklist.
 *
 * Relacionamento:
 *
 * CHECKLIST
 *     │
 *     └── ID Checklist
 *             │
 *             ▼
 *     CHECKLIST_ITENS
 *
 * Cada registro representa um item verificado
 * durante o checklist de um veículo.
 * ============================================================
 */

import { createSchema } from "../engine/schema.js";


export const SCHEMA_CHECKLIST_ITENS = createSchema({

    entity: "CHECKLIST_ITENS",

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
            name: "ID Checklist",
            type: "text",
            visible: false,
            hidden: true,
            readonly: true
        },

        {
            name: "ID Veículo",
            type: "text",
            visible: false,
            hidden: true,
            readonly: true
        },


        // ========================================================
        // ITEM
        // ========================================================

        {
            name: "Item",
            label: "Item",
            type: "select",
            required: true,

            options: [
                "PNEUS",
                "FREIOS",
                "ÓLEO DO MOTOR",
                "ÁGUA / RADIADOR",
                "BATERIA",
                "FARÓIS",
                "LANTERNAS",
                "LUZES DE FREIO",
                "LUZES DE RÉ",
                "PISCAS",
                "LIMPADORES DE PARA-BRISA",
                "ESPELHOS",
                "CINTOS DE SEGURANÇA",
                "EXTINTOR",
                "TRIÂNGULO",
                "MACACO",
                "CHAVE DE RODA",
                "DOCUMENTAÇÃO",
                "LATARIA",
                "VIDROS",
                "COMBUSTÍVEL",
                "OUTROS"
            ]
        },


        // ========================================================
        // SITUAÇÃO
        // ========================================================

        {
            name: "Situação",
            label: "Situação",
            type: "select",
            required: true,

            options: [
                "OK",
                "ATENÇÃO",
                "IRREGULAR",
                "NÃO SE APLICA"
            ]
        },


        // ========================================================
        // OBSERVAÇÃO
        // ========================================================

        {
            name: "Observação",
            label: "Observação",
            type: "textarea",

            placeholder:
                "Informe alguma observação sobre o item..."
        },


        // ========================================================
        // FOTO
        // ========================================================

        {
            name: "Foto",
            label: "Foto",
            type: "file"
        },


        // ========================================================
        // DATA
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


        // ========================================================
        // HORA
        // ========================================================

        {
            name: "Hora",
            label: "Hora",
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
        // STATUS
        // ========================================================

        {
            name: "Status",
            label: "Status",
            type: "select",
            required: true,

            options: [
                "PENDENTE",
                "VERIFICADO",
                "CORRIGIDO"
            ]
        }

    ]

});
