/**
 * ============================================================
 * MODULE
 * Painel Frota
 *
 * Arquivo:
 * js/engine/module.js
 *
 * Responsabilidade:
 *
 * Criar e inicializar um módulo da aplicação.
 *
 * Exemplo:
 *
 * createModule({
 *
 *     entity: "VEICULOS",
 *
 *     schema: SCHEMA_VEICULOS,
 *
 *     container: "#app",
 *
 *     stateName: "veiculos",
 *
 *     options: {
 *
 *         titulo: "Cadastro de Veículos",
 *
 *         tabela: "Veículos Cadastrados",
 *
 *         permitirNovo: true,
 *
 *         permitirEditar: true,
 *
 *         permitirExcluir: true
 *
 *     }
 *
 * });
 *
 * ============================================================
 */

import { createEngine } from "./engine.js";


// ============================================================
// CRIAR MÓDULO
// ============================================================

export function createModule(config = {}) {

    // ----------------------------------------------------------
    // VALIDAÇÃO
    // ----------------------------------------------------------

    if (!config || typeof config !== "object") {

        throw new Error(
            "Module: configuração inválida."
        );

    }


    // ----------------------------------------------------------
    // ENTIDADE
    // ----------------------------------------------------------

    const entity =
        config.entity;

    if (!entity) {

        throw new Error(
            "Module: entidade não informada."
        );

    }


    // ----------------------------------------------------------
    // SCHEMA
    // ----------------------------------------------------------

    const schema =
        config.schema;

    if (!schema) {

        throw new Error(
            `Module ${entity}: schema não informado.`
        );

    }


    // ----------------------------------------------------------
    // CONTAINER
    // ----------------------------------------------------------

    const container =
        config.container || "#app";


    // ----------------------------------------------------------
    // NOME DO ESTADO
    // ----------------------------------------------------------

    const stateName =
        config.stateName ||
        entity.toLowerCase();


    // ----------------------------------------------------------
    // OPÇÕES
    // ----------------------------------------------------------

    const options = {

        titulo:
            config.options?.titulo ||
            entity,

        tabela:
            config.options?.tabela ||
            `${entity} cadastrados`,

        permitirNovo:
            config.options?.permitirNovo !== false,

        permitirEditar:
            config.options?.permitirEditar !== false,

        permitirExcluir:
            config.options?.permitirExcluir !== false,

        permitirPesquisar:
            config.options?.permitirPesquisar !== false,

        permitirPaginacao:
            config.options?.permitirPaginacao !== false,

        pageSize:
            config.options?.pageSize || 20,

        actions:
            config.options?.actions || {},

        autoRefresh:
            config.options?.autoRefresh === true

    };


    // ----------------------------------------------------------
    // CONFIGURAÇÃO FINAL
    // ----------------------------------------------------------

    const moduleConfig = {

        entity,

        schema,

        container,

        stateName,

        options

    };


    // ----------------------------------------------------------
    // CRIAR ENGINE
    // ----------------------------------------------------------

    const engine =
        createEngine(
            moduleConfig
        );


    // ----------------------------------------------------------
    // API DO MÓDULO
    // ----------------------------------------------------------

    const modulo = {

        entity,

        schema,

        container,

        stateName,

        options,

        engine,


        // ------------------------------------------------------
        // CARREGAR
        // ------------------------------------------------------

        carregar() {

            if (
                typeof engine.carregar ===
                "function"
            ) {

                return engine.carregar();

            }

            return Promise.resolve([]);

        },


        // ------------------------------------------------------
        // RECARREGAR
        // ------------------------------------------------------

        recarregar() {

            if (
                typeof engine.recarregar ===
                "function"
            ) {

                return engine.recarregar();

            }

            if (
                typeof engine.carregar ===
                "function"
            ) {

                return engine.carregar();

            }

            return Promise.resolve([]);

        },


        // ------------------------------------------------------
        // NOVO
        // ------------------------------------------------------

        novo() {

            if (
                typeof engine.novo ===
                "function"
            ) {

                return engine.novo();

            }

        },


        // ------------------------------------------------------
        // EDITAR
        // ------------------------------------------------------

        editar(id) {

            if (
                typeof engine.editar ===
                "function"
            ) {

                return engine.editar(id);

            }

        },


        // ------------------------------------------------------
        // EXCLUIR
        // ------------------------------------------------------

        excluir(id) {

            if (
                typeof engine.excluir ===
                "function"
            ) {

                return engine.excluir(id);

            }

        },


        // ------------------------------------------------------
        // SALVAR
        // ------------------------------------------------------

        salvar(dados) {

            if (
                typeof engine.salvar ===
                "function"
            ) {

                return engine.salvar(dados);

            }

        },


        // ------------------------------------------------------
        // ATUALIZAR
        // ------------------------------------------------------

        atualizar(dados) {

            if (
                typeof engine.atualizar ===
                "function"
            ) {

                return engine.atualizar(dados);

            }

        },


        // ------------------------------------------------------
        // ESTADO
        // ------------------------------------------------------

        getState() {

            if (
                typeof engine.getState ===
                "function"
            ) {

                return engine.getState();

            }

            return null;

        },


        // ------------------------------------------------------
        // DESTRUIR
        // ------------------------------------------------------

        destroy() {

            if (
                typeof engine.destroy ===
                "function"
            ) {

                return engine.destroy();

            }

        }

    };


    // ----------------------------------------------------------
    // DISPONIBILIZAR GLOBALMENTE
    //
    // Útil para ações personalizadas.
    // ----------------------------------------------------------

    if (!window.PainelFrota) {

        window.PainelFrota = {};

    }


    if (!window.PainelFrota.modules) {

        window.PainelFrota.modules = {};

    }


    window.PainelFrota.modules[
        entity
    ] = modulo;


    // ----------------------------------------------------------
    // RETORNAR MÓDULO
    // ----------------------------------------------------------

    return modulo;

}
