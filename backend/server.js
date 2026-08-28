// ============================================================================
// SERVER
// Painel Frota
// ============================================================================

import express from "express";

import cors from "cors";

import "dotenv/config";

import veiculosRoutes
    from "./routes/veiculos.js";

import {
    testarBanco
} from "./db.js";


// ============================================================================
// APP
// ============================================================================

const app =
    express();


// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(
    cors()
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// ============================================================================
// ROTA PRINCIPAL
// ============================================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            sucesso: true,

            sistema:
                "Painel Frota API",

            status:
                "ONLINE"

        });

    }
);


// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await testarBanco();


            res.json({

                sucesso: true,

                api:
                    "ONLINE",

                banco:
                    "ONLINE"

            });

        } catch (erro) {

            res.status(500).json({

                sucesso: false,

                api:
                    "ONLINE",

                banco:
                    "OFFLINE",

                erro:
                    erro.message

            });

        }

    }
);


// ============================================================================
// ROTAS
// ============================================================================

app.use(
    "/api/veiculos",
    veiculosRoutes
);


// ============================================================================
// 404
// ============================================================================

app.use(
    (req, res) => {

        res.status(404).json({

            sucesso: false,

            status: 404,

            erro:
                "Rota não encontrada."

        });

    }
);


// ============================================================================
// TRATAMENTO GLOBAL DE ERROS
// ============================================================================

app.use(
    (
        erro,
        req,
        res,
        next
    ) => {

        console.error(
            "Erro global:",
            erro
        );


        res.status(500).json({

            sucesso: false,

            status: 500,

            erro:
                erro.message ||
                "Erro interno do servidor."

        });

    }
);


// ============================================================================
// PORTA
// ============================================================================

const PORT =
    process.env.PORT ||
    3000;


// ============================================================================
// INICIAR
// ============================================================================

async function iniciar() {

    try {

        console.log(
            "Testando conexão com Supabase..."
        );


        await testarBanco();


        console.log(
            "Banco conectado com sucesso."
        );


        app.listen(
            PORT,
            () => {

                console.log(
                    `Painel Frota API rodando na porta ${PORT}`
                );

                console.log(
                    `http://localhost:${PORT}`
                );

            }
        );

    } catch (erro) {

        console.error(
            "Não foi possível iniciar a API."
        );

        console.error(
            erro.message
        );

        process.exit(1);

    }

}


iniciar();
