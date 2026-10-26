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

const CARACTERES_SENHA = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

export function gerarSenhaProvisoria() {
    const bytes = crypto.randomBytes(12);
    let senha = '';
    for (const byte of bytes) {
        senha += CARACTERES_SENHA[byte % CARACTERES_SENHA.length];
    }
    return senha;
}
