import {getDb} from "./db.js";
import { CIDADES, MATERIAIS } from "./listas.js";
import { buscarParceiroPorId } from "./parceiros.js";


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
    const prazo = lerPrazo(dados.prazoEstimado);
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
    if (prazo) {
        pedido.prazoEstimado = prazo;
    }

    await getDb().collection("pedidos").insertOne(pedido);
    return pedido.numero;
}

// O prazo é opcional; quando vier, precisa ser uma data futura
function lerPrazo(valor) {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }
    const prazo = new Date(valor);
    if (isNaN(prazo.getTime()) || prazo.getTime() <= Date.now()) {
        throw new Error("Prazo estimado deve ser uma data futura");
    }
    return prazo;
}

const CAMPOS_EDITAVEIS = ["tipoProtese", "urgencia", "material", "infillMinimo", "cidade", "arquivoUrl",
    "responsavelClinico", "observacoes", "prazoEstimado"];

export async function editarPedido(numero, dados) {
    const pedido = await buscarPedidoPorNumero(numero);
    if (pedido === null) {
        throw new Error("Pedido não encontrado");
    }
    if (pedido.status !== "Aberto") {
        throw new Error("Só é possível editar pedidos com status Aberto");
    }

    // Junta o pedido atual com o que foi enviado e valida tudo de novo
    const atual = {};
    for (const campo of CAMPOS_EDITAVEIS) {
        atual[campo] = dados[campo] !== undefined ? dados[campo] : pedido[campo];
    }
    if (!textoValido(atual.tipoProtese)) {
        throw new Error("Tipo de protese é obrigatório");
    }
    if (!URGENCIAS.includes(atual.urgencia)) {
        throw new Error("Urgência inválida");
    }
    if (!MATERIAIS.includes(atual.material)) {
        throw new Error("Material inválido");
    }
    if (!Number.isInteger(atual.infillMinimo) || atual.infillMinimo < 0 || atual.infillMinimo > 100) {
        throw new Error("Infill mínimo deve ser um número de 0 a 100");
    }
    if (!CIDADES.includes(atual.cidade)) {
        throw new Error("Cidade inválida");
    }
    if (!textoValido(atual.arquivoUrl) || !atual.arquivoUrl.startsWith("http")) {
        throw new Error("Link do arquivo inválido");
    }

    const mudanca = {
        tipoProtese: atual.tipoProtese.trim(),
        urgencia: atual.urgencia,
        material: atual.material,
        infillMinimo: atual.infillMinimo,
        cidade: atual.cidade,
        arquivoUrl: atual.arquivoUrl.trim(),
    };
    const remover = {};
    for (const campo of ["responsavelClinico", "observacoes"]) {
        if (textoValido(atual[campo])) {
            mudanca[campo] = atual[campo].trim();
        } else {
            remover[campo] = "";
        }
    }
    if (dados.prazoEstimado !== undefined) {
        const prazo = lerPrazo(dados.prazoEstimado);
        if (prazo) {
            mudanca.prazoEstimado = prazo;
        } else {
            remover.prazoEstimado = "";
        }
    }

    const atualizacao = { $set: mudanca };
    if (Object.keys(remover).length > 0) {
        atualizacao.$unset = remover;
    }
    const resultado = await getDb().collection("pedidos").updateOne(
        { numero: pedido.numero, status: "Aberto" },
        atualizacao
    );
    if (resultado.matchedCount === 0) {
        throw new Error("O pedido foi alterado por outra pessoa. Atualize a página.");
    }
}

export async function removerPedido(numero) {
    const pedido = await buscarPedidoPorNumero(numero);
    if (pedido === null) {
        throw new Error("Pedido não encontrado");
    }
    const resultado = await getDb().collection("pedidos").deleteOne({ numero: pedido.numero, status: "Aberto" });
    if (resultado.deletedCount === 0) {
        throw new Error("Só é possível excluir pedidos com status Aberto");
    }
}

function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listarPedidos(usuario, filtros = {}) {
    const filtro = {};
    if (usuario.tipo === "parceiro") {
        filtro.parceiroId = usuario.parceiroId;
    }
    if (textoValido(filtros.status)) {
        filtro.status = filtros.status;
    }
    if (URGENCIAS.includes(filtros.urgencia)) {
        filtro.urgencia = filtros.urgencia;
    }
    if (textoValido(filtros.codigoCaso)) {
        filtro.codigoCaso = { $regex: escaparRegex(filtros.codigoCaso.trim()), $options: "i" };
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
        const recusou = (pedido.parceirosQueRecusaram || []).some((id) => String(id) === String(parceiro._id));
        if (recusou) {
            throw new Error("Este parceiro já recusou o pedido");
        }
        mudanca.parceiroId = parceiro._id;
    }
    if (novoStatus === "Reprovado") {
        if (!textoValido(dados.motivo)) {
            throw new Error("O motivo da reprovação é obrigatório");
        }
        mudanca.motivoReprovacao = dados.motivo.trim();
    }
    if (novoStatus === "Aprovado" || novoStatus === "Reprovado") {
        for (const campo of ["validacaoMecanica", "validacaoSanitaria"]) {
            const validacao = lerValidacao(dados[campo], campo, usuario);
            if (validacao) {
                if (novoStatus === "Aprovado" && !validacao.aprovada) {
                    throw new Error("Não é possível aprovar com uma validação reprovada");
                }
                mudanca[campo] = validacao;
            }
        }
    }

    const registro = { status: novoStatus, data: new Date(), usuarioId: usuario._id };
    if (textoValido(dados.observacao)) {
        registro.observacao = dados.observacao.trim();
    }
    const atualizacao = {
        $set: mudanca,
        $push: { historico: registro },
    };
    if (novoStatus === "Aberto") {
        atualizacao.$unset = { parceiroId: "" };
        atualizacao.$addToSet = { parceirosQueRecusaram: pedido.parceiroId };
    }

    const resultado = await getDb().collection("pedidos").updateOne(
        { numero: pedido.numero, status: pedido.status },
        atualizacao
    );
    if (resultado.modifiedCount === 0) {
        throw new Error("O pedido foi alterado por outra pessoa. Atualize a página.");
    }
}
// Validação mecânica ou sanitária feita pela AACD ao aprovar/reprovar (opcional)
function lerValidacao(entrada, campo, usuario) {
    if (entrada === undefined) {
        return null;
    }
    if (typeof entrada !== "object" || entrada === null || typeof entrada.aprovada !== "boolean") {
        throw new Error("Informe " + campo + ".aprovada como true ou false");
    }
    const validacao = { aprovada: entrada.aprovada, responsavel: usuario.nome, data: new Date() };
    if (textoValido(entrada.observacoes)) {
        validacao.observacoes = entrada.observacoes.trim();
    }
    return validacao;
}

const STATUS_EM_ANDAMENTO = ["Atribuído", "Em impressão", "Enviado", "Em validação"];

export async function sugerirParceiros(numero) {
    const pedido = await buscarPedidoPorNumero(numero);
    if (pedido === null) {
        throw new Error("Pedido não encontrado");
    }
    const parceiros = await getDb().collection("parceiros").find(
        {
            homologado: true,
            "filamentos.material": pedido.material,
            _id: { $nin: pedido.parceirosQueRecusaram || [] },
        },
        { projection: { nome: 1, cidade: 1, capacidadeMensal: 1 } }
    ).sort({ nome: 1 }).toArray();

    // Quantos pedidos cada parceiro já tem em andamento, para sugerir os menos ocupados primeiro
    const ocupacao = await getDb().collection("pedidos").aggregate([
        { $match: { parceiroId: { $in: parceiros.map((p) => p._id) }, status: { $in: STATUS_EM_ANDAMENTO } } },
        { $group: { _id: "$parceiroId", total: { $sum: 1 } } },
    ]).toArray();
    for (const parceiro of parceiros) {
        const item = ocupacao.find((o) => String(o._id) === String(parceiro._id));
        parceiro.pedidosEmAndamento = item ? item.total : 0;
    }
    parceiros.sort((a, b) => a.pedidosEmAndamento - b.pedidosEmAndamento);

    const mesmaCidade = parceiros.filter((p) => p.cidade === pedido.cidade);
    const outrasCidades = parceiros.filter((p) => p.cidade !== pedido.cidade);
    return mesmaCidade.concat(outrasCidades);
}