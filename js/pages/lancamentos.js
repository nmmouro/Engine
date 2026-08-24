/**
 * ============================================================
 * PÁGINA — LANÇAMENTOS / DIÁRIO DE BORDO
 * ============================================================
 *
 * Responsável por:
 *
 * - Criar o módulo LANCAMENTOS
 * - Controlar o preenchimento automático do Km Inicial
 * - Usar o maior Km Final já registrado para o veículo
 *
 * Regra:
 *
 * Ao selecionar um veículo:
 *
 *     LANCAMENTOS
 *          ↓
 *     filtra pelo veículo
 *          ↓
 *     encontra maior "Km Final"
 *          ↓
 *     preenche "Km Inicial"
 *
 * ============================================================
 */

import { createModule } from "../engine/module.js";

import {
    SCHEMA_LANCAMENTOS
} from "../schemas/lancamentos.js";

import {
    listar
} from "../services/crudService.js";


// ============================================================
// BUSCAR MAIOR KM FINAL DO VEÍCULO
// ============================================================

async function obterKmInicialPorVeiculo(
    idVeiculo
) {

    if (
        idVeiculo === undefined ||
        idVeiculo === null ||
        idVeiculo === ""
    ) {

        return "";

    }


    try {

        const registros =
            await listar(
                "LANCAMENTOS"
            );


        if (
            !Array.isArray(registros)
        ) {

            return "";

        }


        // ====================================================
        // FILTRAR PELO VEÍCULO
        // ====================================================

        const registrosVeiculo =
            registros.filter(
                registro => {

                    return String(
                        registro?.[
                            "ID Veículo"
                        ] ?? ""
                    ) === String(
                        idVeiculo
                    );

                }
            );


        if (
            registrosVeiculo.length === 0
        ) {

            return "";

        }


        // ====================================================
        // OBTER KM FINAL
        // ====================================================

        const quilometragens =
            registrosVeiculo
                .map(
                    registro => {

                        const valor =
                            registro?.[
                                "Km Final"
                            ];


                        if (
                            valor === undefined ||
                            valor === null ||
                            valor === ""
                        ) {

                            return null;

                        }


                        const numero =
                            Number(
                                String(
                                    valor
                                ).replace(
                                    ",",
                                    "."
                                )
                            );


                        return Number.isFinite(
                            numero
                        )
                            ? numero
                            : null;

                    }
                )
                .filter(
                    valor =>
                        valor !== null
                );


        if (
            quilometragens.length === 0
        ) {

            return "";

        }


        // ====================================================
        // MAIOR KM FINAL
        // ====================================================

        return Math.max(
            ...quilometragens
        );

    } catch (erro) {

        console.error(
            "Erro ao obter Km Inicial:",
            erro
        );

        return "";

    }

}

// ============================================================
// LOCALIZAR CAMPO
// ============================================================

function obterCampo(nome) {

    if (!nome) {

        return null;

    }


    return document.querySelector(
        `[name="${CSS.escape(nome)}"]`
    );

}

// ============================================================
// ATUALIZAR KM INICIAL
// ============================================================

async function atualizarKmInicial(
    idVeiculo
) {

    const campoKmInicial =
        obterCampo(
            "Km Inicial"
        );


    if (!campoKmInicial) {

        console.warn(
            "Campo 'Km Inicial' não encontrado."
        );

        return;

    }


    // ========================================================
    // SEM VEÍCULO
    // ========================================================

    if (
        idVeiculo === undefined ||
        idVeiculo === null ||
        idVeiculo === ""
    ) {

        campoKmInicial.value = "";

        return;

    }


    // ========================================================
    // INDICA PROCESSAMENTO
    // ========================================================

    campoKmInicial.value =
        "Carregando...";


    campoKmInicial.disabled =
        true;


    try {

        const kmInicial =
            await obterKmInicialPorVeiculo(
                idVeiculo
            );


        // ====================================================
        // PRIMEIRO LANÇAMENTO DO VEÍCULO
        // ====================================================

        if (
            kmInicial === "" ||
            kmInicial === null ||
            kmInicial === undefined
        ) {

            campoKmInicial.value = "";

        } else {

            campoKmInicial.value =
                kmInicial;

        }

    } catch (erro) {

        console.error(
            "Erro ao preencher Km Inicial:",
            erro
        );

        campoKmInicial.value = "";

    } finally {

        campoKmInicial.disabled =
            false;

        campoKmInicial.readOnly =
            true;

    }

}

// ============================================================
// EVENTO DO CAMPO VEÍCULO
// ============================================================

function configurarEventoVeiculo() {

    const app =
        document.querySelector(
            "#app"
        );


    if (!app) {

        console.error(
            "Container #app não encontrado."
        );

        return;

    }


    // ========================================================
    // DELEGAÇÃO DE EVENTO
    // ========================================================

    app.addEventListener(
        "change",
        async evento => {

            const campo =
                evento.target;


            if (
                !campo
            ) {

                return;

            }


            if (
                campo.name !==
                "Veículo"
            ) {

                return;

            }


            const idVeiculo =
                campo.value;


            console.log(
                "Veículo selecionado:",
                idVeiculo
            );


            await atualizarKmInicial(
                idVeiculo
            );

        }
    );

}


// ============================================================
// CONFIGURAR EVENTO DO VEÍCULO
// ============================================================

function configurarKmInicial() {

    const campoVeiculo =
        obterCampo(
            "Veículo"
        );


    if (!campoVeiculo) {

        console.warn(
            "Campo 'Veículo' não encontrado."
        );

        return;

    }


    // Evita registrar o evento mais de uma vez

    if (
        campoVeiculo.dataset.kmInicialConfigurado ===
        "true"
    ) {

        return;

    }


    campoVeiculo.dataset.kmInicialConfigurado =
        "true";


    campoVeiculo.addEventListener(
        "change",
        async evento => {

            const idVeiculo =
                evento.target.value;


            await atualizarKmInicial(
                idVeiculo
            );

        }
    );

}


// ============================================================
// OBSERVAR CRIAÇÃO DO FORMULÁRIO
// ============================================================
//
// O Engine cria o formulário dinamicamente.
// Por isso verificamos quando o campo Veículo aparecer.
//

function observarFormulario() {

    configurarKmInicial();


    const observer =
        new MutationObserver(
            () => {

                configurarKmInicial();

            }
        );


    const app =
        document.querySelector(
            "#app"
        );


    if (!app) {

        return;

    }


    observer.observe(
        app,
        {
            childList: true,
            subtree: true
        }
    );

}


// ============================================================
// GARANTIR QUE KM INICIAL SEJA SOMENTE LEITURA
// ============================================================

function protegerKmInicial() {

    const campo =
        obterCampo(
            "Km Inicial"
        );


    if (!campo) {

        return;

    }


    campo.readOnly =
        true;

}

// ============================================================
// ABRIR CHECKLIST
// ============================================================

function abrirChecklist(registro) {

    if (!registro) {

        window.alert(
            "Lançamento não informado."
        );

        return;
    }


    const idLancamento =
        registro.ID || "";


    const idVeiculo =
        registro["ID Veículo"] || "";


    const idEmpregado =
        registro["ID Empregado"] || "";


    if (!idLancamento) {

        window.alert(
            "O lançamento não possui ID."
        );

        return;
    }


    const url =
        "checklist.html" +
        "?lancamento=" +
        encodeURIComponent(
            idLancamento
        ) +
        "&veiculo=" +
        encodeURIComponent(
            idVeiculo
        ) +
        "&empregado=" +
        encodeURIComponent(
            idEmpregado
        );


    window.location.href = url;

}

// ============================================================
// PREENCHER KM INICIAL
// ============================================================

async function atualizarKmInicial(
    idVeiculo
) {

    const campoKmInicial =
        obterCampo(
            "Km Inicial"
        );


    if (!campoKmInicial) {

        console.warn(
            "Campo 'Km Inicial' ainda não existe."
        );

        return;

    }


    // ========================================================
    // NENHUM VEÍCULO
    // ========================================================

    if (
        !idVeiculo
    ) {

        campoKmInicial.value =
            "";

        return;

    }


    // ========================================================
    // CARREGANDO
    // ========================================================

    campoKmInicial.value =
        "";


    campoKmInicial.placeholder =
        "Consultando quilometragem...";


    try {

        const kmInicial =
            await obterKmInicialPorVeiculo(
                idVeiculo
            );


        if (
            kmInicial === "" ||
            kmInicial === null ||
            kmInicial === undefined
        ) {

            campoKmInicial.value =
                "";

        } else {

            campoKmInicial.value =
                kmInicial;

        }

    } catch (erro) {

        console.error(
            "Erro ao atualizar Km Inicial:",
            erro
        );

        campoKmInicial.value =
            "";

    } finally {

        campoKmInicial.placeholder =
            "";

        campoKmInicial.readOnly =
            true;

    }

}

// ============================================================
// CRIAR MÓDULO
// ============================================================

const engine =
createModule({

    entity: "LANCAMENTOS",

    schema: SCHEMA_LANCAMENTOS,

    container: "#app",

    stateName: "lancamentos",

    options: {

        titulo: "Diário de Bordo",

        tabela: "Lançamentos",

        permitirNovo: true,

        permitirEditar: true,

        permitirExcluir: true,

        actions: {

            abrirChecklist:
                abrirChecklist

    }
    }

});

// ============================================================
// INICIALIZAÇÃO
// ============================================================

function inicializar() {

    observarFormulario();

    protegerKmInicial();

}

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        configurarEventoVeiculo,
        {
            once: true
        }
    );

} else {

    configurarEventoVeiculo();

}


// ============================================================
// EXPORTAÇÃO
// ============================================================

export {

    engine,

    obterKmInicialPorVeiculo,

    atualizarKmInicial

};
