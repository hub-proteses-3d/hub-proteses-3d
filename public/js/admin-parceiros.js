const lista = document.getElementById("lista-parceiros");

const TIPOS_UNIDADE = {
  fablab: "FabLab ou universidade",
  voluntario: "Voluntário",
  empresa: "Empresa",
};

function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

function mostrarMensagem(texto) {
  const linha = document.createElement("tr");
  const celula = criarCelula(texto);
  celula.colSpan = 6;
  linha.appendChild(celula);
  lista.appendChild(linha);
}

async function mudarHomologacao(parceiro, homologado) {
  if (!homologado && !confirm("Suspender o parceiro " + parceiro.nome + "?")) {
    return;
  }
  try {
    const resposta = await fetch("/api/parceiro/homologado?id=" + parceiro._id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homologado: homologado }),
    });
    if (resposta.status === 401) {
      window.location.href = "login.html";
      return;
    }
    const resultado = await resposta.json();
    if (!resposta.ok) {
      alert(resultado.erro);
      return;
    }
    carregarParceiros();
  } catch {
    alert("Não foi possível conectar ao servidor.");
  }
}

function mostrarParceiros(parceiros) {
  for (const parceiro of parceiros) {
    const linha = document.createElement("tr");

    const celulaNome = document.createElement("td");
    const nome = document.createElement("strong");
    nome.textContent = parceiro.nome;
    celulaNome.appendChild(nome);
    linha.appendChild(celulaNome);

    linha.appendChild(criarCelula(TIPOS_UNIDADE[parceiro.tipoUnidade]));
    linha.appendChild(criarCelula(parceiro.cidade));

    const celulaCnpj = criarCelula(parceiro.cnpj || "—");
    celulaCnpj.className = "texto-cinza";
    linha.appendChild(celulaCnpj);

    const celulaHomologacao = document.createElement("td");
    const etiqueta = document.createElement("span");
    if (parceiro.homologado) {
      etiqueta.className = "pill pill-success";
      etiqueta.textContent = "Homologado";
    } else {
      etiqueta.className = "pill pill-warning";
      etiqueta.textContent = "Em análise";
    }
    celulaHomologacao.appendChild(etiqueta);
    linha.appendChild(celulaHomologacao);

    const celulaAcoes = document.createElement("td");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn-link";
    if (parceiro.homologado) {
      botao.textContent = "Suspender";
    } else {
      botao.textContent = "Homologar";
    }
    botao.addEventListener("click", () => {
      mudarHomologacao(parceiro, !parceiro.homologado);
    });
    celulaAcoes.appendChild(botao);
    linha.appendChild(celulaAcoes);

    lista.appendChild(linha);
  }

  if (parceiros.length === 0) {
    mostrarMensagem("Nenhum parceiro cadastrado ainda.");
  }
}

async function carregarParceiros() {
  lista.textContent = "";
  try {
    const resposta = await fetch("/api/parceiros");
    if (resposta.status === 401) {
      window.location.href = "login.html";
      return;
    }
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagem(dados.erro);
      return;
    }
    mostrarParceiros(dados);
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor.");
  }
}

carregarParceiros();