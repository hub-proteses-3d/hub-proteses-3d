import http from "node:http";
import { conectar } from "./db.js";
import { responderJson, lerCorpo, servirArquivo } from "./respostas.js";

async function rotas(req, res) {
    const url = new URL(req.url, "http://localhost");
    const caminho = url.pathname;
    const metodo = req.method;

    if (!caminho.startsWith("/api/")) {
        await servirArquivo(res, decodeURIComponent(caminho));
        return;
    }

    if (metodo === "GET" && caminho === "/api/status") {
        responderJson(res, 200, { mensagem: "Servidor funcionando" });
        return;
    }

    responderJson(res, 404, { erro: "Rota não encontrada" });
}

const servidor = http.createServer(async (req, res) => {
    try {
        await rotas(req, res);
    } catch (erro) {
        if (erro.name === "SyntaxError") {
            responderJson(res, 400, { erro: "JSON inválido" });
        } else if (erro.name === "Error") {
            responderJson(res, 400, { erro: erro.message });
        } else {
            console.error(erro);
            responderJson(res, 500, { erro: "Erro interno do servidor" });
        }
    }
});

await conectar();

const porta = process.env.PORT || 3000;
servidor.listen(porta, () => {
    console.log("Servidor rodando na porta " + porta);
});