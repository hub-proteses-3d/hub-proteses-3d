const menu = document.getElementById("menu");
const marca = document.getElementById("marca");
const listaUnidades = document.getElementById("lista-unidades");
const mensagem = document.getElementById("mensagem");

const MENUS = {
  aacd: [
    { texto: "Dashboard", endereco: "aacd-dashboard.html" },
    { texto: "Nova Demanda", endereco: "aacd-nova-demanda.html" },
  ],
  parceiro: [
    { texto: "Dashboard", endereco: "parceiro-dashboard.html" },
    { texto: "Minha unidade", endereco: "parceiro-minha-unidade.html" },
  ],
};

const TIPOS_UNIDADE = {
  fablab: "Universidade / FabLab",
  voluntario: "Voluntário Técnico",
  empresa: "Empresa Parceira",
};

function mostrarMensagem(texto, erro) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem";
  if (erro) {
    mensagem.className = "mensagem mensagem-erro";
  }
  mensagem.hidden = false;
}

function criarLinkMenu(texto, endereco) {
  const link = document.createElement("a");
  link.href = endereco;
  link.textContent = texto;
  menu.appendChild(link);
  return link;
}

function montarMenu(tipo) {
  const itens = MENUS[tipo];
  if (!itens) {
    return;
  }
  marca.href = itens[0].endereco;
  for (const item of itens) {
    criarLinkMenu(item.texto, item.endereco);
  }
  const atual = criarLinkMenu("Rede de Produção", "rede-producao.html");
  atual.className = "active";
}

function criarTexto(tag, classe, texto) {
  const elemento = document.createElement(tag);
  elemento.className = classe;
  elemento.textContent = texto;
  return elemento;
}

function criarCartao(parceiro) {
  const cartao = criarTexto("div", "unit-card", "");
  cartao.appendChild(criarTexto("span", "unit-type", TIPOS_UNIDADE[parceiro.tipoUnidade]));
  cartao.appendChild(criarTexto("div", "unit-name", parceiro.nome));
  cartao.appendChild(criarTexto("div", "unit-city", parceiro.cidade));

  const linha = criarTexto("div", "unit-stat-row", "");
  const rotulo = document.createElement("span");
  rotulo.textContent = "Capacidade";
  const valor = document.createElement("b");
  valor.textContent = parceiro.capacidadeMensal + " peças por mês";
  linha.appendChild(rotulo);
  linha.appendChild(valor);
  cartao.appendChild(linha);

  return cartao;
}

function mostrarUnidades(parceiros) {
  let total = 0;
  for (const parceiro of parceiros) {
    if (parceiro.homologado) {
      listaUnidades.appendChild(criarCartao(parceiro));
      total++;
    }
  }
  if (total === 0) {
    mostrarMensagem("Nenhuma unidade homologada ainda.", false);
  }
}

async function buscar(endereco) {
  const resposta = await fetch(endereco);
  if (resposta.status === 401) {
    window.location.href = "login.html";
    return null;
  }
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrarMensagem(dados.erro, true);
    return null;
  }
  return dados;
}

async function carregarRede() {
  try {
    const usuario = await buscar("/api/eu");
    if (usuario === null) {
      return;
    }
    montarMenu(usuario.tipo);
    const parceiros = await buscar("/api/parceiros");
    if (parceiros === null) {
      return;
    }
    mostrarUnidades(parceiros);
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor.", true);
  }
}

carregarRede();