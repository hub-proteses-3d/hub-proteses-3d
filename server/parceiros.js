import { ObjectId } from "mongodb";
import { getDb } from "./db.js";
import { CIDADES, MATERIAIS } from "./listas.js";

const TIPOS_UNIDADE = ["fablab", "voluntario", "empresa"];

export async function criarParceiro(dados) {
    if (typeof dados.nome !== "string" || dados.nome === "") {
        throw new Error("Nome é obrigatório");
    }
    if (!TIPOS_UNIDADE.includes(dados.tipoUnidade)) {
        throw new Error("Tipo de unidade inválido");
    }
    if (!CIDADES.includes(dados.cidade)) {
        throw new Error("Cidade inválida");
    }
    if (!Number.isInteger(dados.capacidadeMensal) || dados.capacidadeMensal < 0) {
        throw new Error("Capacidade mensal inválida");
    }
    const parceiro = {
        nome: dados.nome,
        tipoUnidade: dados.tipoUnidade,
        cidade: dados.cidade,
        capacidadeMensal: dados.capacidadeMensal,
        biocompatibilidadeValidada: dados.biocompatibilidadeValidada === true,
        homologado: dados.homologado === true,
        impressoras: [],
        filamentos: [],
        criadoEm: new Date(),
    };
    if (typeof dados.cnpj === "string" && dados.cnpj !== "") {
        parceiro.cnpj = dados.cnpj;
    }
    const resultado = await
        getDb().collection("parceiros").insertOne(parceiro);
    return resultado.insertedId;
}

export async function listarParceiros() {
    return getDb().collection("parceiros").find().sort({
        nome: 1
    }).toArray();
}

export async function buscarParceiroPorId(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    return getDb().collection("parceiros").findOne({
        _id: new
            ObjectId(id)
    });
}
export async function adicionarImpressora(parceiroId, dados) {
    if (!ObjectId.isValid(parceiroId)){
        throw new Error("Parceiro inválido");
    }
    if (typeof dados.modelo !== "string" || dados.modelo ==="") {
        throw new Error("Modelo é obrigatório");
    }
    if (typeof dados.tecnologia !== "string" || dados.tecnologia ==="") {
        throw new Error("Tecnologia é obrigatória");
        
    }
    if (!Number.isInteger(dados.quantidade) || dados.quantidade < 1) {
        throw new Error("Quantidade inválida");
        
    }
    const impressora = {
        _id: new ObjectId(),
        modelo: dados.modelo,
        tecnologia: dados.tecnologia,
        quantidade: dados.quantidade,
    };
    const resultado = await
    getDb().collection("parceiros").updateOne(
        {_id: new ObjectId(parceiroId)},
        {$push: {impressoras: impressora}}
    );
    if (resultado.matchedCount === 0) {
        throw new Error("Parceiro não encontrado");
        
    }
    return impressora._id;
}

export async function removerImpressora(parceiroId, impressoraId) {
    if (!ObjectId.isValid(parceiroId) || !ObjectId.isValid(impressoraId)){
        throw new Error("Id inválido");
        
    }
    const resultado = await
    getDb().collection("parceiros").updateOne(
        {_id: new ObjectId(parceiroId) },
        { $pull: {impressoras: {_id: new ObjectId(impressoraId)}}}
    );
    if (resultado.modifiedCount === 0){
        throw new Error("Impressora não encontrada");
        
    }
}
export async function adicionarFilamento(parceiroId, dados) {
    if (!ObjectId.isValid(parceiroId)) {
        throw new Error("Parceiro inválido");
    }
    if (!MATERIAIS.includes(dados.material)) {
        throw new Error("Material inválido");
    }

    const filamento = {
        _id: new ObjectId(),
        material: dados.material,
        biocompativel: dados.biocompativel === true,
    };

    const resultado = await getDb().collection("parceiros").updateOne(
        { _id: new ObjectId(parceiroId) },
        { $push: { filamentos: filamento } }
    );
    if (resultado.matchedCount === 0) {
        throw new Error("Parceiro não encontrado");
    }
    return filamento._id;
}

export async function removerFilamento(parceiroId, filamentoId) {
    if (!ObjectId.isValid(parceiroId) || !ObjectId.isValid(filamentoId)) {
        throw new Error("Id inválido");
    }

    const resultado = await getDb().collection("parceiros").updateOne(
        { _id: new ObjectId(parceiroId) },
        { $pull: { filamentos: { _id: new ObjectId(filamentoId) } } }
    );
    if (resultado.modifiedCount === 0) {
        throw new Error("Filamento não encontrado");
    }
}