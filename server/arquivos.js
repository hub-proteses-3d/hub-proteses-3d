import { GridFSBucket, ObjectId } from "mongodb";
import { pipeline } from "node:stream/promises";
import { getDb } from "./db.js";

const LIMITE = 50 * 1024 * 1024;

function bucket() {
    return new GridFSBucket(getDb(), { bucketName: "arquivos" });
}

export async function salvarArquivo(req, nome, usuarioId) {
    if (typeof nome !== "string" || nome.length > 100 || !nome.toLowerCase().endsWith(".stl")) {
        throw new Error("Envie um arquivo .stl");
    }
    const tamanho = Number(req.headers["content-length"]);
    if (!tamanho || tamanho > LIMITE) {
        throw new Error("O arquivo deve ter até 50 MB");
    }
    const envio = bucket().openUploadStream(nome, { metadata: { enviadoPor: usuarioId } });
    await pipeline(req, envio);
    return envio.id;
}

export async function buscarArquivo(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    return getDb().collection("arquivos.files").findOne({ _id: new ObjectId(id) });
}

export async function enviarArquivo(res, arquivoId, numero) {
    res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="pedido-' + numero + '.stl"',
    });
    await pipeline(bucket().openDownloadStream(arquivoId), res);
}