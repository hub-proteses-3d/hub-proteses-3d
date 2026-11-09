import { getDb } from "./db.js";
import { erroDoPedido, textoValido } from "./validacoes.js";
import { buscarParceiroPorId } from "./parceiros.js";
import { buscarArquivo } from "./arquivos.js";


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
    const erro = erroDoPedido(dados);
    if (erro !== null) {
        throw new Error(erro);
    }
    const arquivo = await buscarArquivo(dados.arquivoId);
    if (arquivo === null) {
        throw new Error("Arquivo .stl não encontrado. Envie o arquivo novamente");
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
        arquivoId: arquivo._id,
        arquivoNome: arquivo.filename,
        status: "Aberto",
        criadoPor: usuarioId,
        criadoEm: agora,
        dataLimite: new Date(dados.dataLimite + "T00:00:00"),
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
const TRANSICOES = [
    { de: "Aberto", para: "Atribuído", quem: "aacd" },
    { de: "Atribuído", para: "Em impressão", quem: "parceiro" },
    { de: "Atribuído", para: "Aberto", quem: "parceiro" },
    { de: "Em impressão", para: "Enviado", quem: "parceiro" },
    { de: "Enviado", para: "Em validação", quem: "aacd" },
    { de: "Em validação", para: "Aprovado", quem: "aacd" },
    { de: "Em validação", para: "Reprovado", quem: "aacd" },
    { de: "Aprovado", para: "Entregue", quem: "aacd" },
];

export async function mudarStatus(numero, novoStatus, usuario, dados) {
    const pedido = await buscarPedidoPorNumero(numero);
    if (pedido === null) {
        throw new Error("Pedido não encontrado");
    }
    if (usuario.tipo === "parceiro" && String(pedido.parceiroId) !== String(usuario.parceiroId)) {
        throw new Error("Pedido não encontrado");
    }

    const transicao = TRANSICOES.find((t) => t.de === pedido.status && t.para === novoStatus);
    if (!transicao) {
        throw new Error("Não é possível mudar de " + pedido.status + " para " + novoStatus);
    }
    if (usuario.tipo !== transicao.quem || usuario.nivel < 2) {
        throw new Error("Você não tem permissão para esta mudança");
    }

    const mudanca = { status: novoStatus };
    if (novoStatus === "Atribuído") {
        const parceiro = await buscarParceiroPorId(dados.parceiroId);
        if (parceiro === null || !parceiro.homologado) {
            throw new Error("Parceiro inválido ou não homologado");
        }
        mudanca.parceiroId = parceiro._id;
    }
    if (novoStatus === "Reprovado") {
        if (!textoValido(dados.motivo)) {
            throw new Error("O motivo da reprovação é obrigatório");
        }
        mudanca.motivoReprovacao = dados.motivo.trim();
    }

    const atualizacao = {
        $set: mudanca,
        $push: { historico: { status: novoStatus, data: new Date(), usuarioId: usuario._id } },
    };
    if (novoStatus === "Aberto") {
        atualizacao.$unset = { parceiroId: "" };
    }

    const resultado = await getDb().collection("pedidos").updateOne(
        { numero: pedido.numero, status: pedido.status },
        atualizacao
    );
    if (resultado.modifiedCount === 0) {
        throw new Error("O pedido foi alterado por outra pessoa. Atualize a página.");
    }
}
export async function sugerirParceiros(numero) {
    const pedido = await buscarPedidoPorNumero(numero);
    if (pedido === null) {
        throw new Error("Pedido não encontrado");
    }
    const parceiros = await getDb().collection("parceiros").find(
        { homologado: true, "filamentos.material": pedido.material },
        { projection: { nome: 1, cidade: 1, capacidadeMensal: 1 } }
    ).sort({ nome: 1 }).toArray();

    const mesmaCidade = parceiros.filter((p) => p.cidade === pedido.cidade);
    const outrasCidades = parceiros.filter((p) => p.cidade !== pedido.cidade);
    return mesmaCidade.concat(outrasCidades);
}