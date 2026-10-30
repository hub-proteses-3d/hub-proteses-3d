const URGENCIAS = {
  baixa: { texto: "Baixa", classe: "pill-success" },
  media: { texto: "Média", classe: "pill-warning" },
  alta: { texto: "Alta", classe: "pill-danger" },
};

const CORES_STATUS = {
  "Aberto": "pill-warning",
  "Atribuído": "pill-neutral",
  "Em impressão": "pill-info",
  "Enviado": "pill-info",
  "Em validação": "pill-success",
  "Aprovado": "pill-success",
  "Reprovado": "pill-danger",
  "Entregue": "pill-success",
};

const ETAPAS = ["Aberto", "Atribuído", "Em impressão", "Enviado", "Em validação", "Aprovado", "Entregue"];

const PAGINAS_INICIAIS = {
  aacd: "aacd-dashboard.html",
  admin: "admin-usuarios.html",
};

async function buscarDados(endereco) {
  const resposta = await fetch(endereco);
  if (resposta.status === 401) {
    window.location.href = "login.html";
    throw new Error("Faça login para continuar");
  }
  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados.erro);
  }
  return dados;
}

async function enviarDados(endereco, metodo, corpo) {
  const resposta = await fetch(endereco, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  if (resposta.status === 401) {
    window.location.href = "login.html";
    throw new Error("Faça login para continuar");
  }
  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados.erro);
  }
  return dados;
}

async function carregarUnidade() {
  const usuario = await buscarDados("/api/eu");
  if (usuario.tipo !== "parceiro") {
    window.location.href = PAGINAS_INICIAIS[usuario.tipo] || "login.html";
    throw new Error("Esta página é só para parceiros");
  }
  const parceiro = await buscarDados("/api/parceiro?id=" + usuario.parceiroId);
  document.getElementById("nome-unidade").textContent = parceiro.nome;
  return { usuario: usuario, parceiro: parceiro };
}

async function mudarStatus(numero, status) {
  await enviarDados("/api/pedido/status?numero=" + numero, "POST", { status: status });
}

function mostrarFalhaPedido(texto) {
  document.getElementById("conteudo").hidden = true;

  const falha = document.getElementById("falha");
  falha.textContent = texto + " ";
  const link = document.createElement("a");
  link.href = "parceiro-dashboard.html";
  link.textContent = "Voltar ao painel";
  falha.appendChild(link);
  falha.hidden = false;
}

function criarEtiqueta(texto, classe) {
  const etiqueta = document.createElement("span");
  etiqueta.className = "pill " + classe;
  etiqueta.textContent = texto;
  return etiqueta;
}

function linhaDado(rotulo, valor) {
  const linha = document.createElement("div");
  linha.className = "kv-row";

  const nome = document.createElement("span");
  nome.className = "kv-label";
  nome.textContent = rotulo;

  const conteudo = document.createElement("span");
  conteudo.className = "kv-value";
  if (typeof valor === "string") {
    conteudo.textContent = valor;
  } else {
    conteudo.appendChild(valor);
  }

  linha.appendChild(nome);
  linha.appendChild(conteudo);
  return linha;
}

function linkArquivo(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.textContent = url.split("/").pop();
  return link;
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

function resumoImpressoras(impressoras) {
  if (impressoras.length === 0) {
    return "Nenhuma";
  }
  let total = 0;
  const tecnologias = [];
  const modelos = [];
  for (const impressora of impressoras) {
    total += impressora.quantidade;
    if (!tecnologias.includes(impressora.tecnologia)) {
      tecnologias.push(impressora.tecnologia);
    }
    modelos.push(impressora.modelo);
  }
  return total + "x " + tecnologias.join(", ") + " (" + modelos.join(", ") + ")";
}

function nomesFilamentos(filamentos) {
  if (filamentos.length === 0) {
    return "Nenhum";
  }
  const materiais = [];
  for (const filamento of filamentos) {
    materiais.push(filamento.material);
  }
  return materiais.join(", ");
}

document.getElementById("sair").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "login.html";
});
