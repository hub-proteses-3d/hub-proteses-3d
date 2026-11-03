import crypto from "node:crypto";
import { getDb } from "./db.js";
export async function criarSessao(usuarioId) {
    const token = crypto.randomBytes(32).toString("hex");
    await getDb().collection("sessoes").insertOne({
        token: token,
        usuarioId: usuarioId,
        criadoEm: new Date(), 
    });
    return token;
}

function lerToken(req) {
    const cookies = req.headers.cookie || "";
    for (const parte of cookies.split(";")) {
        const [nome, valor] = parte.trim().split("=");
        if (nome === "sessao") {
            return valor;
        }
    }
    return null;
}

export async function buscarUsuarioDaSessao(req) {
    const token = lerToken(req);
    if(!token) {
        return null;
    }
    const sessao = await
    getDb().collection("sessoes").findOne({ token: token });
    if (sessao === null) {
        return null;
    }
    return getDb().collection("usuarios").findOne(
        {_id: sessao.usuarioId, ativo: {$ne: false}},
        {projection: {senha: 0}}
    );
} 

export async function apagarSessao(req) {
    const token = lerToken(req);
    if (token) {
        await getDb().collection("sessoes").deleteOne({ token: token
        });
    }
}