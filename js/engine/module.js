const form = createForm({
    schema,
    container: formContainer,

    onSubmit: async (dados, registroAtual) => {

        if (registroAtual) {
            await crud.atualizar(dados);
        } else {
            await crud.criar(dados);
        }

    },

    onCancel: () => {

        form.reset();

    }
});
