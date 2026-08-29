export const SCHEMA_VEICULOS = {
    entity: "veiculos",

    fields: [
        {
            name: "id",
            label: "ID",
            type: "text",
            hidden: true
        },

        {
            name: "placa",
            label: "Placa",
            type: "text",
            required: true
        },

        {
            name: "modelo",
            label: "Modelo",
            type: "text",
            required: true
        },

        {
            name: "marca",
            label: "Marca",
            type: "text"
        },

        {
            name: "ano",
            label: "Ano",
            type: "number"
        },

        {
            name: "combustivel",
            label: "Combustível",
            type: "select",
            options: [
                "gasolina",
                "etanol",
                "flex",
                "diesel",
                "elétrico"
            ]
        },

        {
            name: "cor",
            label: "Cor",
            type: "text"
        },

        {
            name: "status",
            label: "Status",
            type: "select",
            options: [
                "ativo",
                "manutenção",
                "inativo"
            ]
        }
    ]
};
