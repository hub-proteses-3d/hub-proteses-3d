import { ObjectId } from "mongodb";
import { getDb } from "./db.js";
import { CIDADES, MATERIAIS } from "./listas.js";

const TIPOS_UNIDADE = ["fablab", "voluntario", "empresa"];

function somenteDigitos(valor) {
    return String(valor).replace(/\D/g, "");
}

function cnpjValido(valor) {
    const cnpj = somenteDigitos(valor);
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }
    function digito(base) {
        const pesos = base.length === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        let soma = 0;
        for (let i = 0; i < base.length; i++) {
            soma += Number(base[i]) * pesos[i];
        }
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
    const d1 = digito(cnpj.slice(0, 12));
    const d2 = digito(cnpj.slice(0, 12) + d1);
    return cnpj.endsWith("" + d1 + d2);
}

// Campos de contato opcionais: só entram no objeto se vierem preenchidos
function lerContato(dados, destino) {
    if (typeof dados.telefone === "string" && dados.telefone !== "") {
        const telefone = somenteDigitos(dados.telefone);
        if (telefone.length < 10 || telefone.length > 11) {
            throw new Error("Telefone deve ter 10 ou 11 dígitos com DDD");
        }
        destino.telefone = telefone;
    }
    if (typeof dados.emailContato === "string" && dados.emailContato !== "") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.emailContato)) {
            throw new Error("Email de contato inválido");
        }
        destino.emailContato = dados.emailContato.toLowerCase();
    }
}

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
        if (!cnpjValido(dados.cnpj)) {
            throw new Error("CNPJ inválido");
        }
        parceiro.cnpj = somenteDigitos(dados.cnpj);
    }
    if (typeof dados.uf === "string" && dados.uf !== "") {
        if (!/^[A-Za-z]{2}$/.test(dados.uf)) {
            throw new Error("UF deve ter 2 letras");
        }
        parceiro.uf = dados.uf.toUpperCase();
    }
    lerContato(dados, parceiro);
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
    if (typeof dados.marca === "string" && dados.marca !== "") {
        impressora.marca = dados.marca;
    }
    if (dados.volumeUtil !== undefined) {
        const volume = dados.volumeUtil || {};
        for (const eixo of ["x", "y", "z"]) {
            if (typeof volume[eixo] !== "number" || volume[eixo] <= 0) {
                throw new Error("Volume útil deve ter x, y e z em milímetros");
            }
        }
        impressora.volumeUtil = { x: volume.x, y: volume.y, z: volume.z };
    }
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
export async function atualizarContato(parceiroId, dados) {
    if (!ObjectId.isValid(parceiroId)) {
        throw new Error("Parceiro inválido");
    }
    const mudanca = {};
    lerContato(dados, mudanca);
    if (dados.capacidadeMensal !== undefined) {
        if (!Number.isInteger(dados.capacidadeMensal) || dados.capacidadeMensal < 0) {
            throw new Error("Capacidade mensal inválida");
        }
        mudanca.capacidadeMensal = dados.capacidadeMensal;
    }
    if (Object.keys(mudanca).length === 0) {
        throw new Error("Nenhum campo para alterar");
    }
    const resultado = await getDb().collection("parceiros").updateOne(
        { _id: new ObjectId(parceiroId) },
        { $set: mudanca }
    );
    if (resultado.matchedCount === 0) {
        throw new Error("Parceiro não encontrado");
    }
}

export async function alterarHomologacao(parceiroId, homologado) {
    if (!ObjectId.isValid(parceiroId)) {
        throw new Error("Parceiro inválido");
    }
    if (typeof homologado !== "boolean") {
        throw new Error("Informe homologado como true ou false");
    }
    const resultado = await getDb().collection("parceiros").updateOne(
        { _id: new ObjectId(parceiroId) },
        { $set: { homologado: homologado } }
    );
    if (resultado.matchedCount === 0) {
        throw new Error("Parceiro não encontrado");
    }
}
