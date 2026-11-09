import { CIDADES, MATERIAIS } from "./listas.js";

const URGENCIAS = ["baixa", "media", "alta"];

export function textoValido(valor) {
    return typeof valor === "string" && valor.trim() !== "";
}
function dataExiste(texto) {
    const data = new Date(texto + "T00:00:00");
    return data.getDate() === Number(texto.slice(8, 10));
}
export function erroDoPedido(dados) {
    if (!textoValido(dados.codigoCaso)) {
        return "Código do caso é obrigatório";
    }
    if (!textoValido(dados.tipoProtese)) {
        return "Tipo de protese é obrigatório";
    }
    if (!URGENCIAS.includes(dados.urgencia)) {
        return "Urgência inválida";
    }
    if (!MATERIAIS.includes(dados.material)) {
        return "Material inválido";
    }
    if (!Number.isInteger(dados.infillMinimo) || dados.infillMinimo < 0 || dados.infillMinimo > 100) {
        return "Infill mínimo deve ser um número de 0 a 100";
    }
    if (!CIDADES.includes(dados.cidade)) {
        return "Cidade inválida";
    }
    if (typeof dados.dataLimite !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dados.dataLimite) || !dataExiste(dados.dataLimite)) {
        return "Data limite inválida";
    }
    const dataLimite = new Date(dados.dataLimite + "T00:00:00");
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataLimite <= hoje) {
        return "A data limite deve ser depois de hoje";
    }
    return null;
}