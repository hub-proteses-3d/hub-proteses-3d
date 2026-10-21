import http from "node:http";
import { conectar } from "./db.js";
import { responderJson, lerCorpo, servirArquivo } from "./respostas.js";
import { criarSessao, buscarUsuarioDaSessao, apagarSessao } from "./sessoes.js";
import { conferirSenha } from "./senha.js";
import { criarUsuario, buscarUsuarioPorEmail, alterarSenha } from "./usuarios.js";
import {
    criarParceiro, listarParceiros, buscarParceiroPorId,
    adicionarImpressora, removerImpressora, adicionarFilamento, removerFilamento,
} from "./parceiros.js";
import { criarPedido, listarPedidos, buscarPedidoPorNumero } from "./pedidos.js";

const OITO_HORAS = 8 * 60 * 60;

function semPermissao(res) {
    responderJson(res, 403, { erro: "Você não tem permissão para isso" });
}

function podeEditarParceiro(usuario, parceiroId) {
    if (usuario.tipo === "admin") {
        return true;
    }
    return usuario.tipo === "parceiro" && usuario.nivel >= 2 && String(usuario.parceiroId) === parceiroId;
}

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
    if (metodo === "POST" && caminho === "/api/login") {
        const dados = await lerCorpo(req);
        const conta = await buscarUsuarioPorEmail(dados.email);
        if (conta === null || typeof dados.senha !== "string" || !conferirSenha(dados.senha, conta.senha)) {
            responderJson(res, 401, { erro: "Email ou senha incorretos" });
            return;
        }
        const token = await criarSessao(conta._id);
        res.setHeader("Set-Cookie", "sessao=" + token + "; HttpOnly; Path=/; SameSite=Lax; Max-Age=" + OITO_HORAS);
        responderJson(res, 200, { nome: conta.nome, tipo: conta.tipo, nivel: conta.nivel });
        return;
    }

    if (metodo === "POST" && caminho === "/api/logout") {
        await apagarSessao(req);
        res.setHeader("Set-Cookie", "sessao=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0");
        responderJson(res, 200, { mensagem: "Sessão encerrada" });
        return;
    }

    const usuario = await buscarUsuarioDaSessao(req);
    if (usuario === null) {
        responderJson(res, 401, { erro: "Faça login para continuar" });
        return;
    }

    if (metodo === "GET" && caminho === "/api/eu") {
        responderJson(res, 200, usuario);
        return;
    }

    if (metodo === "POST" && caminho === "/api/alterar-senha") {
        const dados = await lerCorpo(req);
        const conta = await buscarUsuarioPorEmail(usuario.email);
        if (typeof dados.senhaAtual !== "string" || !conferirSenha(dados.senhaAtual, conta.senha)) {
            responderJson(res, 400, { erro: "Senha atual incorreta" });
            return;
        }
        await alterarSenha(usuario._id, dados.novaSenha);
        responderJson(res, 200, { mensagem: "Senha alterada" });
        return;
    }
    if (metodo === "POST" && caminho === "/api/usuarios") {
        if (usuario.tipo !== "admin") {
            semPermissao(res);
            return;
        }
        const dados = await lerCorpo(req);
        const id = await criarUsuario(dados);
        responderJson(res, 201, { id: id });
        return;
    }

    if (metodo === "GET" && caminho === "/api/parceiros") {
        responderJson(res, 200, await listarParceiros());
        return;
    }

    if (metodo === "POST" && caminho === "/api/parceiros") {
        if (usuario.tipo !== "admin") {
            semPermissao(res);
            return;
        }
        const dados = await lerCorpo(req);
        const id = await criarParceiro(dados);
        responderJson(res, 201, { id: id });
        return;
    }

    if (metodo === "GET" && caminho === "/api/parceiro") {
        const parceiro = await buscarParceiroPorId(url.searchParams.get("id"));
        if (parceiro === null) {
            responderJson(res, 404, { erro: "Parceiro não encontrado" });
            return;
        }
        responderJson(res, 200, parceiro);
        return;
    }

    if (caminho === "/api/impressoras" || caminho === "/api/filamentos") {
        const parceiroId = url.searchParams.get("parceiroId");
        if (!podeEditarParceiro(usuario, parceiroId)) {
            semPermissao(res);
            return;
        }

        if (metodo === "POST" && caminho === "/api/impressoras") {
            const dados = await lerCorpo(req);
            const id = await adicionarImpressora(parceiroId, dados);
            responderJson(res, 201, { id: id });
            return;
        }
        if (metodo === "DELETE" && caminho === "/api/impressoras") {
            await removerImpressora(parceiroId, url.searchParams.get("impressoraId"));
            responderJson(res, 200, { mensagem: "Impressora removida" });
            return;
        }
        if (metodo === "POST" && caminho === "/api/filamentos") {
            const dados = await lerCorpo(req);
            const id = await adicionarFilamento(parceiroId, dados);
            responderJson(res, 201, { id: id });
            return;
        }
        if (metodo === "DELETE" && caminho === "/api/filamentos") {
            await removerFilamento(parceiroId, url.searchParams.get("filamentoId"));
            responderJson(res, 200, { mensagem: "Filamento removido" });
            return;
        }
    }
    if (metodo === "POST" && caminho === "/api/pedidos") {
        if (usuario.tipo !== "aacd" || usuario.nivel < 2) {
            semPermissao(res);
            return;
        }
        const dados = await lerCorpo(req);
        const numero = await criarPedido(dados, usuario._id);
        responderJson(res, 201, { numero: numero });
        return;
    }

    if (metodo === "GET" && caminho === "/api/pedidos") {
        responderJson(res, 200, await listarPedidos(usuario));
        return;
    }

    if (metodo === "GET" && caminho === "/api/pedido") {
        const pedido = await buscarPedidoPorNumero(url.searchParams.get("numero"));
        if (pedido === null || (usuario.tipo === "parceiro" && String(pedido.parceiroId) !== String(usuario.parceiroId))) {
            responderJson(res, 404, { erro: "Pedido não encontrado" });
            return;
        }
        responderJson(res, 200, pedido);
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