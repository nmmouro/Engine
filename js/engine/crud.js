import {
    listar,
    obter,
    salvar,
    criar,
    atualizar,
    excluir
} from "../services/crudService.js";


export function createCrud(entity) {

    if (!entity) {

        throw new Error(
            "CRUD: entity não informada."
        );

    }


    return {

        listar() {

            return listar(
                entity
            );

        },


        obter(id) {

            return obter(
                entity,
                id
            );

        },


        salvar(dados) {

            return salvar(
                entity,
                dados
            );

        },


        criar(dados) {

            return criar(
                entity,
                dados
            );

        },


        atualizar(dados) {

            return atualizar(
                entity,
                dados
            );

        },


        excluir(id) {

            return excluir(
                entity,
                id
            );

        }

    };

}
