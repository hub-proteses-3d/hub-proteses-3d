// Limita as tentativas de login erradas por IP para dificultar ataques de força bruta
const LIMITE = 10;
const JANELA = 15 * 60 * 1000;

const tentativas = new Map();

function ipDaRequisicao(req) {
    return req.socket.remoteAddress || "";
}

export function bloqueado(req) {
    const registro = tentativas.get(ipDaRequisicao(req));
    if (!registro) {
        return false;
    }
    if (Date.now() - registro.inicio > JANELA) {
        tentativas.delete(ipDaRequisicao(req));
        return false;
    }
    return registro.total >= LIMITE;
}

export function registrarFalha(req) {
    const ip = ipDaRequisicao(req);
    const registro = tentativas.get(ip);
    if (!registro || Date.now() - registro.inicio > JANELA) {
        tentativas.set(ip, { inicio: Date.now(), total: 1 });
    } else {
        registro.total++;
    }
}

export function limparFalhas(req) {
    tentativas.delete(ipDaRequisicao(req));
}
