// ============================================================================
// ROTAS — VEÍCULOS
// Painel Frota
// ============================================================================

import express from "express";

import {
    supabase
} from "../db.js";


const router =
    express.Router();


// ============================================================================
// LISTAR VEÍCULOS
// GET /api/veiculos
// ============================================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase

                .from("veiculos")

                .select("*")

                .order(
                    "placa",
                    {
                        ascending: true
                    }
                );


            if (error) {

                throw error;

            }


            return res.json({

                sucesso: true,

                status: 200,

                dados: data || []

            });

        } catch (erro) {

            console.error(
                "Erro ao listar veículos:",
                erro
            );


            return res.status(500).json({

                sucesso: false,

                status: 500,

                erro:
                    erro.message ||
                    "Erro ao listar veículos."

            });

        }

    }
);


// ============================================================================
// OBTER VEÍCULO
// GET /api/veiculos/:id
// ============================================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const {
                data,
                error
            } = await supabase

                .from("veiculos")

                .select("*")

                .eq(
                    "id",
                    id
                )

                .maybeSingle();


            if (error) {

                throw error;

            }


            if (!data) {

                return res.status(404).json({

                    sucesso: false,

                    status: 404,

                    erro:
                        "Veículo não encontrado."

                });

            }


            return res.json({

                sucesso: true,

                status: 200,

                dados: data

            });

        } catch (erro) {

            console.error(
                "Erro ao obter veículo:",
                erro
            );


            return res.status(500).json({

                sucesso: false,

                status: 500,

                erro:
                    erro.message ||
                    "Erro ao obter veículo."

            });

        }

    }
);


// ============================================================================
// CRIAR VEÍCULO
// POST /api/veiculos
// ============================================================================

router.post(
    "/",
    async (req, res) => {

        try {

            const dados =
                req.body;


            if (!dados) {

                return res.status(400).json({

                    sucesso: false,

                    status: 400,

                    erro:
                        "Dados do veículo não informados."

                });

            }


            if (!dados.placa) {

                return res.status(400).json({

                    sucesso: false,

                    status: 400,

                    erro:
                        "A placa do veículo é obrigatória."

                });

            }


            const veiculo = {

                id:
                    dados.id || gerarId(),

                data_cadastro:
                    dados.data_cadastro ||
                    new Date()
                        .toISOString()
                        .slice(0, 10),

                foto:
                    dados.foto || null,

                placa:
                    String(
                        dados.placa
                    )
                    .trim()
                    .toUpperCase(),

                modelo:
                    dados.modelo || null,

                marca:
                    dados.marca || null,

                ano:
                    dados.ano
                        ? Number(dados.ano)
                        : null,

                cor:
                    dados.cor || null,

                combustivel:
                    dados.combustivel || null,

                status:
                    dados.status ||
                    "ATIVO"

            };


            const {
                data,
                error
            } = await supabase

                .from("veiculos")

                .insert(
                    veiculo
                )

                .select()

                .single();


            if (error) {

                throw error;

            }


            return res.status(201).json({

                sucesso: true,

                status: 201,

                message:
                    "Veículo criado com sucesso.",

                dados: data

            });

        } catch (erro) {

            console.error(
                "Erro ao criar veículo:",
                erro
            );


            return res.status(500).json({

                sucesso: false,

                status: 500,

                erro:
                    erro.message ||
                    "Erro ao criar veículo."

            });

        }

    }
);


// ============================================================================
// ATUALIZAR VEÍCULO
// PUT /api/veiculos/:id
// ============================================================================

router.put(
    "/:id",
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const dados =
                req.body;


            if (!dados) {

                return res.status(400).json({

                    sucesso: false,

                    status: 400,

                    erro:
                        "Dados do veículo não informados."

                });

            }


            const atualizacao = {

                placa:
                    dados.placa
                        ? String(
                            dados.placa
                        )
                        .trim()
                        .toUpperCase()
                        : undefined,

                foto:
                    dados.foto,

                modelo:
                    dados.modelo,

                marca:
                    dados.marca,

                ano:
                    dados.ano !== undefined &&
                    dados.ano !== ""
                        ? Number(dados.ano)
                        : null,

                cor:
                    dados.cor,

                combustivel:
                    dados.combustivel,

                status:
                    dados.status

            };


            // Remove propriedades undefined
            Object.keys(
                atualizacao
            ).forEach(
                chave => {

                    if (
                        atualizacao[chave] ===
                        undefined
                    ) {

                        delete atualizacao[chave];

                    }

                }
            );


            const {
                data,
                error
            } = await supabase

                .from("veiculos")

                .update(
                    atualizacao
                )

                .eq(
                    "id",
                    id
                )

                .select()

                .single();


            if (error) {

                throw error;

            }


            return res.json({

                sucesso: true,

                status: 200,

                message:
                    "Veículo atualizado com sucesso.",

                dados: data

            });

        } catch (erro) {

            console.error(
                "Erro ao atualizar veículo:",
                erro
            );


            return res.status(500).json({

                sucesso: false,

                status: 500,

                erro:
                    erro.message ||
                    "Erro ao atualizar veículo."

            });

        }

    }
);


// ============================================================================
// EXCLUIR VEÍCULO
// DELETE /api/veiculos/:id
// ============================================================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const {
                data,
                error
            } = await supabase

                .from("veiculos")

                .delete()

                .eq(
                    "id",
                    id
                )

                .select();


            if (error) {

                throw error;

            }


            if (
                !data ||
                data.length === 0
            ) {

                return res.status(404).json({

                    sucesso: false,

                    status: 404,

                    erro:
                        "Veículo não encontrado."

                });

            }


            return res.json({

                sucesso: true,

                status: 200,

                message:
                    "Veículo excluído com sucesso.",

                dados:
                    data[0]

            });

        } catch (erro) {

            console.error(
                "Erro ao excluir veículo:",
                erro
            );


            return res.status(500).json({

                sucesso: false,

                status: 500,

                erro:
                    erro.message ||
                    "Erro ao excluir veículo."

            });

        }

    }
);


// ============================================================================
// GERAR ID
// ============================================================================

function gerarId() {

    const numero =
        Date.now()
            .toString()
            .slice(-6);


    return `VEI${numero}`;

}


export default router;
