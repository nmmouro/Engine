import {
    listar,
    obter,
    criar,
    atualizar,
    excluir
} from "../services/crudService.js";


export function createCrud(entity) {

    return {

        listar() {
            return listar(entity);
        },

        obter(id) {
            return obter(entity, id);
        },

        criar(dados) {
            return criar(entity, dados);
        },

        atualizar(dados) {
            return atualizar(entity, dados);
        },

        excluir(id) {
            return excluir(entity, id);
        }

    };
}
