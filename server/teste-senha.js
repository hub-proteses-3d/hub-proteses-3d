import { gerarHash, conferirSenha } from './senha.js';

const guardar = gerarHash('minhaSenha123');
console.log('Hash guardado:', guardar);
console.log('Senha correta:', conferirSenha('minhaSenha123', guardar));
console.log('Senha incorreta:', conferirSenha('senhaErrada', guardar));