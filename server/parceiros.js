import { ObjectId } from "mongodb";
import { getDb } from "./db.js";

const TIPOS_UNIDADE = ["fablab", "voluntario", "empresa"];

export async function criarParceiro(dados) {
    if (typeof dados.nome !== "string" || dados.nome === "") {
        throw new Error("Nome é obrigatório");
    }
    if (!TIPOS_UNIDADE.includes(dados.tipoUnidade)) {
        throw new Error("Tipo de unidade inválido");
    }
    if (typeof dados.cidade !== "string" || dados.cidade === "") {
        throw new Error("Cidade é obrigatória");
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