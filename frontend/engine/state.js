export function createState(name) {

    if (!name) {
        throw new Error(
            "State: nome não informado."
        );
    }

    return {
        name,

        registros: [],

        registroEditando: null,

        carregando: false,

        filtro: "",

        paginaAtual: 1
    };
}
