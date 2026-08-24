/**
 * ============================================================
 * PÁGINA — LANÇAMENTOS / DIÁRIO DE BORDO
 * ============================================================
 *
 * Responsabilidades:
 *
 * - Criar o módulo LANCAMENTOS
 * - Controlar o preenchimento automático do Km Inicial
 * - Buscar o maior Km Final já registrado para o veículo
 * - Abrir o checklist associado ao lançamento
 *
 * Regra do Km Inicial:
 *
 * Ao selecionar um veículo:
 *
 *      LANCAMENTOS
 *           ↓
 *      filtra pelo veículo
 *           ↓
 *      encontra maior "Km Final"
 *           ↓
 *      preenche "Km Inicial"
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
// ESTADO
// ============================================================

let observerFormulario = null;
let eventoDelegadoConfigurado = false;


// ============================================================
// OBTER MAIOR KM FINAL DO VEÍCULO
// ============================================================

async function obterKmInicialPorVeiculo(idVeiculo) {

    if (
        idVeiculo === undefined ||
        idVeiculo === null ||
        idVeiculo === ""
    ) {
        return "";
    }


    try {

        const registros = await listar(
            "LANCAMENTOS"
        );


        if (!Array.isArray(registros)) {

            return "";

        }


        // ====================================================
        // FILTRAR LANÇAMENTOS DO VEÍCULO
        // ====================================================

        const registrosVeiculo =
            registros.filter(
                registro => {

                    const idRegistro =
                        registro?.[
                            "ID Veículo"
                        ];

                    return String(
                        idRegistro ?? ""
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
                                )
                                    .replace(
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
// LOCALIZAR CAMPO DO FORMULÁRIO
// ============================================================

function obterCampo(nome) {

    if (!nome) {

        return null;

    }


    const campos =
        document.querySelectorAll(
            "#app input, #app select, #app textarea"
        );


    for (
        const campo of campos
    ) {

        if (
            campo.name === nome
        ) {

            return campo;

        }

    }


    return null;

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

        /*
         * O formulário é criado dinamicamente
         * pelo Engine. Portanto, não é erro
         * se o campo ainda não existir.
         */

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

        campoKmInicial.placeholder = "";

        return;

    }


    // ========================================================
    // INDICA PROCESSAMENTO
    // ========================================================

    campoKmInicial.value = "";

    campoKmInicial.placeholder =
        "Consultando quilometragem...";

    campoKmInicial.readOnly = true;


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
            "Erro ao atualizar Km Inicial:",
            erro
        );

        campoKmInicial.value = "";


    } finally {

        campoKmInicial.placeholder = "";

        campoKmInicial.readOnly = true;

    }

}


// ============================================================
// EVENTO DO CAMPO VEÍCULO
// ============================================================
//
// O formulário é criado dinamicamente pelo Engine.
//
// Por isso NÃO procuramos o campo "Veículo" uma única vez.
//
// Utilizamos delegação de evento no #app.
//
// ============================================================

function configurarEventoVeiculo() {

    if (
        eventoDelegadoConfigurado
    ) {

        return;

    }


    const app =
        document.querySelector(
            "#app"
        );


    if (!app) {

        console.warn(
            "Container #app ainda não existe."
        );

        return;

    }


    app.addEventListener(
        "change",
        async evento => {

            const campo =
                evento.target;


            if (!campo) {

                return;

            }


            /*
             * Verifica pelo atributo name.
             *
             * Isso evita depender do ID gerado
             * pelo form.js.
             */

            if (
                campo.name !== "Veículo"
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


    eventoDelegadoConfigurado = true;

}


// ============================================================
// PROTEGER KM INICIAL
// ============================================================

function protegerKmInicial() {

    const campo =
        obterCampo(
            "Km Inicial"
        );


    if (!campo) {

        return;

    }


    campo.readOnly = true;

}


// ============================================================
// OBSERVAR CRIAÇÃO DO FORMULÁRIO
// ============================================================
//
// O Engine cria o formulário dinamicamente.
//
// O MutationObserver aguarda o campo aparecer.
//
// ============================================================

function observarFormulario() {

    const app =
        document.querySelector(
            "#app"
        );


    if (!app) {

        console.warn(
            "Container #app não encontrado."
        );

        return;

    }


    // ========================================================
    // CONFIGURA EVENTO DELEGADO
    // ========================================================

    configurarEventoVeiculo();


    // ========================================================
    // TENTA PROTEGER O CAMPO EXISTENTE
    // ========================================================

    protegerKmInicial();


    // ========================================================
    // EVITA DUPLICAR OBSERVER
    // ========================================================

    if (
        observerFormulario
    ) {

        observerFormulario.disconnect();

    }


    observerFormulario =
        new MutationObserver(
            () => {

                protegerKmInicial();

            }
        );


    observerFormulario.observe(
        app,
        {
            childList: true,
            subtree: true
        }
    );

}


// ============================================================
// ABRIR CHECKLIST
// ============================================================
//
// Recebe o registro inteiro da tabela.
//
// O botão da tabela deve chamar:
//
//     abrirChecklist(registro)
//
// ============================================================

function abrirChecklist(
    registro
) {

    if (!registro) {

        window.alert(
            "Lançamento não informado."
        );

        return;

    }


    const idLancamento =
        registro.ID || "";


    const idVeiculo =
        registro[
            "ID Veículo"
        ] || "";


    const idEmpregado =
        registro[
            "ID Empregado"
        ] || "";


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


    window.location.href =
        url;

}


// ============================================================
// CRIAR MÓDULO ENGINE
// ============================================================

const engine =
    createModule({

        entity:
            "LANCAMENTOS",

        schema:
            SCHEMA_LANCAMENTOS,

        container:
            "#app",

        stateName:
            "lancamentos",

        options: {

            titulo:
                "Diário de Bordo",

            tabela:
                "Lançamentos",

            permitirNovo:
                true,

            permitirEditar:
                true,

            permitirExcluir:
                true,

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

    configurarEventoVeiculo();

    observarFormulario();

    protegerKmInicial();

}


// ============================================================
// DOM READY
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        inicializar,
        {
            once: true
        }
    );

} else {

    inicializar();

}


// ============================================================
// EXPORTAÇÃO
// ============================================================

export {

    engine,

    obterKmInicialPorVeiculo,

    atualizarKmInicial,

    abrirChecklist

};
