const lista = document.getElementById("lista-usuarios");

const TIPOS = {
  aacd: "AACD",
  parceiro: "Parceiro",
  admin: "Admin",
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

function nomeDoParceiro(parceiros, id) {
  for (const parceiro of parceiros) {
    if (parceiro._id === id) {
      return parceiro.nome;
    }
  }
  return "—";
}

function mostrarUsuarios(usuarios, parceiros) {
  for (const usuario of usuarios) {
    const linha = document.createElement("tr");

    const celulaNome = document.createElement("td");
    const nome = document.createElement("strong");
    nome.textContent = usuario.nome;
    celulaNome.appendChild(nome);
    linha.appendChild(celulaNome);

    const celulaEmail = criarCelula(usuario.email);
    celulaEmail.className = "texto-cinza";
    linha.appendChild(celulaEmail);

    const celulaTipo = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.className = "pill pill-success";
    etiqueta.textContent = TIPOS[usuario.tipo];
    celulaTipo.appendChild(etiqueta);
    linha.appendChild(celulaTipo);

    linha.appendChild(criarCelula("Nível " + usuario.nivel));
    linha.appendChild(criarCelula(nomeDoParceiro(parceiros, usuario.parceiroId)));

    const celulaAcoes = document.createElement("td");
    const editar = document.createElement("a");
    editar.href = "admin-editar-usuario.html?id=" + usuario._id;
    editar.className = "btn-link";
    editar.textContent = "Editar";
    celulaAcoes.appendChild(editar);

    const novaSenha = document.createElement("button");
    novaSenha.type = "button";
    novaSenha.className = "btn-link link-acao";
    novaSenha.textContent = "Nova senha";
    novaSenha.addEventListener("click", () => {
      alert("Ainda não disponível: falta combinar com o back-end.");
    });
    celulaAcoes.appendChild(novaSenha);
    linha.appendChild(celulaAcoes);

    lista.appendChild(linha);
  }

  if (usuarios.length === 0) {
    mostrarMensagem("Nenhum usuário cadastrado ainda.");
  }
}

async function carregarUsuarios() {
  try {
    const usuarios = await buscarDados("/api/usuarios");
    const parceiros = await buscarDados("/api/parceiros");
    mostrarUsuarios(usuarios, parceiros);
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

carregarUsuarios();