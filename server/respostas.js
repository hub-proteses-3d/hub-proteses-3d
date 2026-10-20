import fs from "node:fs/promises";
import path from "node:path";

const PASTA_PUBLIC = path.resolve("public");

const TIPOS_DE_ARQUIVO = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
};

export function responderJson(res, status, dados) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(dados));
}
export async function lerCorpo(req) {
    let texto = "";
    for await (const pedaco of req) {
        texto += pedaco;
    }
    if (texto === ""){
        return {};
    }
    const dados = JSON.parse(texto);
    if (typeof dados !== "object" || dados === null ) {
        throw new Error("Dados inválidos");
    }
    return dados;
}
export async function servirArquivo(res, caminho) {
    if (caminho === "/") {
        caminho = "/index.html";
    }
    const arquivo = path.join(PASTA_PUBLIC, caminho);
    if (!arquivo.startsWith(PASTA_PUBLIC + path.sep)) {
        responderJson(res, 404, { erro: "Página não encontrada" });
        return;
    }

    try {
        const conteudo = await fs.readFile(arquivo);
        const tipo = TIPOS_DE_ARQUIVO[path.extname(arquivo)] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": tipo });
        res.end(conteudo);
    } catch {
        responderJson(res, 404, { erro: "Página não encontrada" });
    }
}
