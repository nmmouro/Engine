import { createModule } from "../engine/module.js";

import {
    SCHEMA_LANCAMENTOS
} from "../schemas/lancamentos.js";

import {
    listar
} from "../services/crudService.js";


async function carregarEmpregados() {

    const empregados =
        await listar("EMPREGADOS");


    return empregados.map(
        empregado => ({

            value: empregado.ID,

            label:
                `${empregado.Empregado || ""} / ` +
                `${empregado.Matrícula || ""}`,

            dados: empregado

        })
    );

}


async function carregarVeiculos() {

    const veiculos =
        await listar("VEICULOS");


    return veiculos.map(
        veiculo => ({

            value: veiculo.ID,

            label:
                `${veiculo.Modelo || ""} / ` +
                `${veiculo.Placa || ""}`,

            dados: veiculo

        })
    );

}


async function iniciar() {

    const [
        empregados,
        veiculos
    ] = await Promise.all([

        carregarEmpregados(),

        carregarVeiculos()

    ]);


    createModule({

        entity: "LANCAMENTOS",

        schema: SCHEMA_LANCAMENTOS,

        container: "#app",

        stateName: "lancamentos",

        options: {

            titulo:
                "Lançamentos",

            tabela:
                "Lançamentos Cadastrados",

            permitirNovo:
                true,

            permitirEditar:
                true,

            permitirExcluir:
                true,

            selects: {

                "Empregado / Matrícula":
                    empregados,

                "Veículo":
                    veiculos

            }

        }

    });

}


iniciar();
