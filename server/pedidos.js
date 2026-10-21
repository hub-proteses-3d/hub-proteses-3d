import {getDb} from "./db.js";
import { CIDADES, MATERIAIS } from "./listas.js";

const URGENCIAS = ["baixa", "media", "alta"];

function textoValido(valor) {
    return typeof valor === "string" && valor.trim() !== "";
}
async function proximoNumero() {
    const contador = await
    getDb().collection("contadores").findOneAndUpdate(
        { _id: "pedidos" },
        { $inc: { valor: 1 } },
        { upsert: true, returnDocument: "after" }
    );
    return contador.valor;
}

export async function criarPedido(dados, usuarioId) {
    if (!textoValido(dados.codigoCaso)) {
        throw new Error("Código do caso é obrigatório");
        
    }
    if (!textoValido(dados.tipoProtese)) {
        throw new Error("Tipo de protese é obrigatório");
        
    }
    if (!URGENCIAS.includes(dados.urgencia)) {
        throw new Error("Urgência inválida");
        
    }
    if (!MATERIAIS.includes(dados.material)) {
        throw new Error("Material inválido");
    }
    if (!Number.isInteger(dados.infillMinimo) || dados.infillMinimo < 0 || dados.infillMinimo > 100) {
        throw new Error("Infill mínimo deve ser um número de 0 a 100");
    }
    if (!CIDADES.includes(dados.cidade)) {
        throw new Error("Cidade inválida");
    }
    if (!textoValido(dados.arquivoUrl) || !dados.arquivoUrl.startsWith("http")) {
        throw new Error("Link do arquivo inválido");
    }
    const agora = new Date();
    const pedido = {
        numero: await proximoNumero(),
        codigoCaso: dados.codigoCaso.trim(),
        tipoProtese: dados.tipoProtese.trim(),
        urgencia: dados.urgencia,
        material: dados.material,
        infillMinimo: dados.infillMinimo,
        cidade: dados.cidade,
        arquivoUrl: dados.arquivoUrl.trim(),
        status: "Aberto",
        criadoPor: usuarioId,
        criadoEm: agora,
        historico: [{ status: "Aberto", data: agora, usuarioId: usuarioId }],
    };

    if (textoValido(dados.responsavelClinico)) {
        pedido.responsavelClinico = dados.responsavelClinico.trim();
    }
    if (textoValido(dados.observacoes)) {
        pedido.observacoes = dados.observacoes.trim();
    }

    await getDb().collection("pedidos").insertOne(pedido);
    return pedido.numero;
}
export async function listarPedidos(usuario) {
    const filtro = {};
    if (usuario.tipo === "parceiro") {
        filtro.parceiroId = usuario.parceiroId;
    }

    const pedidos = await getDb().collection("pedidos").find(filtro).sort({ numero: -1 }).toArray();
    const parceiros = await getDb().collection("parceiros").find({}, { projection: { nome: 1 } }).toArray();

    for (const pedido of pedidos) {
        const parceiro = parceiros.find((p) => String(p._id) === String(pedido.parceiroId));
        pedido.parceiroNome = parceiro ? parceiro.nome : null;
    }
    return pedidos;
}

export async function buscarPedidoPorNumero(numero) {
    const numeroPedido = Number(numero);
    if (!Number.isInteger(numeroPedido)) {
        return null;
    }

    const pedido = await getDb().collection("pedidos").findOne({ numero: numeroPedido });
    if (pedido !== null && pedido.parceiroId) {
        const parceiro = await getDb().collection("parceiros").findOne({ _id: pedido.parceiroId });
        pedido.parceiroNome = parceiro ? parceiro.nome : null;
    }
    return pedido;
}
