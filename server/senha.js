import crypto from 'node:crypto';

export function gerarHash(senha) {
    const sal = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(senha, sal, 64).toString('hex');
    return sal + ':' + hash;
}

export function conferirSenha(senha, senhaGuardada) {
    const partes = senhaGuardada.split(':');
    const sal = partes[0];
    const hashGuardado = partes[1];
    const hash = crypto.scryptSync(senha, sal, 64).toString('hex');
    return hash === hashGuardado;
}
