import { createSchema } from "../engine/schema.js";

export const SCHEMA_EMPREGADOS = createSchema({
    entity: "EMPREGADOS",

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
            name: "Empregado",
            type: "text",
            required: true
        },
        {
            name: "Matricula",
            type: "text",
            required: true
        },
        {
            name: "Diretoria",
            type: "text"
        },
        {
            name: "Setor",
            type: "text"
        },
        {
            name: "Usuario",
            type: "text"
        },
        {
            name: "Tipo",
            type: "select",
            options: [
                "ADMIN",
                "MOTORISTA",
                "SUPERVISOR",
                "USUÁRIO"
            ]
        },
        {
            name: "Status",
            type: "select",
            options: [
                "ATIVO",
                "FÉRIAS",
                "VIAGEM",
                "INATIVO"
            ]
        }
    ]
});
