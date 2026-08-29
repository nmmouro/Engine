export function createState(options = {}) {

    return {

        registros: [],

        registroEditando: null,

        carregando: false,

        salvando: false,

        filtro: "",

        paginaAtual: 1,

        paginaTamanho:
            options.pageSize || 10

    };

}
