document.addEventListener("DOMContentLoaded", inicializar);

// ==========================================
// CONSTANTES E CONFIGURAÇÕES
// ==========================================

const VALIDACAO = {
  nomeUtilizador: /^[a-zA-Z0-9_.-]{3,20}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefone: /^\d{9}$/,
  nif: /^\d{9}$/,
};

const MENSAGENS = {
  required: "Por favor, preencha todos os campos obrigatórios.",
  usernameRequired: "O nome de utilizador é obrigatório.",
  usernameInvalid:
    "O nome de utilizador deve ter entre 3 e 20 caracteres e apenas letras, números, . _ -",
  usernameExists: "Este nome de utilizador já está registado.",
  passwordRequired: "A palavra-passe é obrigatória.",
  passwordShort: "A palavra-passe deve ter pelo menos 6 caracteres.",
  nomeRequired: "O nome completo é obrigatório.",
  nomeInvalid: "Por favor, indique um nome válido.",
  emailRequired: "O email é obrigatório.",
  emailInvalid: "O email indicado não é válido.",
  telefoneRequired: "O telemóvel é obrigatório.",
  telefoneInvalid: "O telemóvel deve ter exatamente 9 dígitos.",
  nifRequired: "O NIF é obrigatório.",
  nifInvalid: "O NIF deve ter exatamente 9 dígitos.",
  moradaRequired: "A morada é obrigatória.",
  fotoInvalid: "A foto de perfil deve ser um ficheiro de imagem válido.",
  fotoLarge: "A foto de perfil não pode ter mais de 2 MB.",
  credentialsInvalid: "Nome de utilizador ou palavra-passe incorretos.",
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================

// Inicializa a aplicação quando o DOM carrega
function inicializar() {
  verificarSessao();
  atualizarNavegacao();
}

// ==========================================
// GESTÃO DE SESSÃO
// ==========================================

// Verifica se há uma sessão ativa e redireciona conforme necessário
function verificarSessao() {
  const sessao = JSON.parse(localStorage.getItem("sessao") || "null");
  if (!sessao || !sessao.autenticado) {
    if (window.location.pathname.includes("perfil.html")) {
      window.location.href = "login.html";
    }
    return;
  }

  if (window.location.pathname.includes("login.html")) {
    window.location.href = "perfil.html";
    return;
  }

  if (window.location.pathname.includes("perfil.html")) {
    carregarPerfil();
  }
}

// Atualiza o link de navegação baseado no estado de login
function atualizarNavegacao() {
  const sessao = JSON.parse(localStorage.getItem("sessao") || "null");
  const ligacao = document.querySelector('a[href*="login.html"]');

  if (!ligacao) {
    return;
  }

  if (sessao && sessao.autenticado) {
    ligacao.textContent = "Meu Perfil";
    ligacao.href = "perfil.html";
  } else {
    ligacao.textContent = "A minha conta";
    ligacao.href = "login.html";
  }
}

// ==========================================
// UTILITÁRIOS
// ==========================================

// Obtém a lista de utilizadores do localStorage
function obterUtilizadores() {
  return JSON.parse(localStorage.getItem("utilizadores") || "[]");
}

// Guarda a lista de utilizadores no localStorage
function guardarUtilizadores(utilizadores) {
  localStorage.setItem("utilizadores", JSON.stringify(utilizadores));
}

// Exibe uma mensagem de erro ao utilizador
function mostrarErro(mensagem) {
  alert(mensagem);
}

// ==========================================
// REGISTO
// ==========================================

// Valida os dados do formulário de registo
function validarRegisto(
  nomeUtilizador,
  palavrapasse,
  nome,
  correio,
  telefone,
  nif,
  morada,
) {
  if (
    !nomeUtilizador ||
    !palavrapasse ||
    !nome ||
    !correio ||
    !telefone ||
    !nif ||
    !morada
  ) {
    return MENSAGENS.required;
  }

  if (!VALIDACAO.nomeUtilizador.test(nomeUtilizador)) {
    return MENSAGENS.usernameInvalid;
  }

  if (!palavrapasse) {
    return MENSAGENS.passwordRequired;
  }

  if (palavrapasse.length < 6) {
    return MENSAGENS.passwordShort;
  }

  if (!nome || nome.length < 3) {
    return MENSAGENS.nomeInvalid;
  }

  if (!VALIDACAO.email.test(correio)) {
    return MENSAGENS.emailInvalid;
  }

  if (!VALIDACAO.telefone.test(telefone)) {
    return MENSAGENS.telefoneInvalid;
  }

  if (!VALIDACAO.nif.test(nif)) {
    return MENSAGENS.nifInvalid;
  }

  if (!morada) {
    return MENSAGENS.moradaRequired;
  }

  return "";
}

// Processa o registo de um novo utilizador
function registarUtilizador(evento) {
  if (evento && typeof evento.preventDefault === "function") {
    evento.preventDefault();
  }

  const nomeUtilizador =
    document.getElementById("nomeUtilizador")?.value.trim() || "";
  const palavrapasse = document.getElementById("palavrapasse")?.value.trim() || "";
  const nome = document.getElementById("nome")?.value.trim() || "";
  const correio = document.getElementById("correio")?.value.trim() || "";
  const telefone = document.getElementById("telefone")?.value.trim() || "";
  const nif = document.getElementById("nif")?.value.trim() || "";
  const morada = document.getElementById("morada")?.value.trim() || "";
  const elementoFoto = document.getElementById("foto");
  const foto =
    elementoFoto && elementoFoto.files ? elementoFoto.files[0] : null;

  const mensagemValidacao = validarRegisto(
    nomeUtilizador,
    palavrapasse,
    nome,
    correio,
    telefone,
    nif,
    morada,
  );
  if (mensagemValidacao) {
    mostrarErro(mensagemValidacao);
    return false;
  }

  const utilizadores = obterUtilizadores();
  if (
    utilizadores.some(
      (utilizador) =>
        utilizador.nomeUtilizador.toLowerCase() ===
        nomeUtilizador.toLowerCase(),
    )
  ) {
    mostrarErro(MENSAGENS.usernameExists);
    return false;
  }

  if (foto) {
    if (!foto.type.startsWith("image/")) {
      mostrarErro(MENSAGENS.fotoInvalid);
      return false;
    }

    if (foto.size > 2 * 1024 * 1024) {
      mostrarErro(MENSAGENS.fotoLarge);
      return false;
    }
  }

  // Função interna para salvar o utilizador após processar a foto
  function guardarUtilizador(fotoData) {
    const novoUtilizador = {
      nomeUtilizador: nomeUtilizador,
      palavrapasse: palavrapasse,
      nome: nome,
      correio: correio,
      telefone: telefone,
      nif: nif,
      morada: morada,
      foto: fotoData,
    };

    utilizadores.push(novoUtilizador);
    guardarUtilizadores(utilizadores);
    alert("Registo efetuado com sucesso!");
    window.location.href = "login.html";
  }

  // Processa a foto selecionada convertendo para Data URL
  if (foto) {
    const leitor = new FileReader();
    leitor.onload = function (evento) {
      guardarUtilizador(evento.target.result);
    };
    leitor.readAsDataURL(foto);
  } else {
    guardarUtilizador(null);
  }

  return false;
}

// Navega para a página de login
function irParaLogin() {
  window.location.href = "login.html";
}

// Regista o evento de seleção de foto (para debug)
function enviarFoto() {
  const fotoInput = document.getElementById("foto");
  if (fotoInput && fotoInput.files.length > 0) {
    console.log("Foto selecionada:", fotoInput.files[0].name);
  }
}

// ==========================================
// LOGIN
// ==========================================

// Valida as credenciais de login
function validarAutenticacao(nomeUtilizador, palavrapasse) {
  if (!nomeUtilizador || !palavrapasse) {
    return MENSAGENS.required;
  }

  return "";
}

// Processa o login do utilizador
function autenticarUtilizador(evento) {
  if (evento && typeof evento.preventDefault === "function") {
    evento.preventDefault();
  }

  const nomeUtilizador =
    document.getElementById("nomeUtilizador")?.value.trim() || "";
  const palavrapasse = document.getElementById("palavrapasse")?.value.trim() || "";

  const mensagemValidacao = validarAutenticacao(nomeUtilizador, palavrapasse);
  if (mensagemValidacao) {
    mostrarErro(mensagemValidacao);
    return false;
  }

  const utilizadores = obterUtilizadores();
  const utilizador = utilizadores.find(
    (u) =>
      u.nomeUtilizador.toLowerCase() === nomeUtilizador.toLowerCase() &&
      u.palavrapasse === palavrapasse,
  );

  if (!utilizador) {
    mostrarErro(MENSAGENS.credentialsInvalid);
    return false;
  }

  const sessao = {
    autenticado: true,
    nomeUtilizador: utilizador.nomeUtilizador,
  };
  localStorage.setItem("sessao", JSON.stringify(sessao));
  window.location.href = "perfil.html";
  return false;
}

// Navega para a página de registo
function irParaRegisto() {
  window.location.href = "registo.html";
}

// ==========================================
// PERFIL
// ==========================================

// Carrega e exibe os dados do perfil do utilizador autenticado
function carregarPerfil() {
  const sessao = JSON.parse(localStorage.getItem("sessao") || "null");
  if (!sessao || !sessao.autenticado) {
    window.location.href = "login.html";
    return;
  }

  const utilizadores = obterUtilizadores();
  const utilizador = utilizadores.find(
    (u) => u.nomeUtilizador === sessao.nomeUtilizador,
  );
  if (!utilizador) {
    terminarSessao();
    return;
  }

  const fotoPredefini = "img/foto_perfil.jpg";
  const primeiroNome = utilizador.nome
    ? utilizador.nome.split(" ")[0]
    : utilizador.nomeUtilizador;

  // Função auxiliar para atualizar texto em elementos HTML
  const atualizarTexto = (id, texto) => {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
  };

  atualizarTexto("nome-titulo-perfil", primeiroNome);
  atualizarTexto("nome-utilizador", utilizador.nome);
  atualizarTexto("correio-utilizador", utilizador.correio);
  atualizarTexto("telefone-utilizador", utilizador.telefone);
  atualizarTexto("nif-utilizador", utilizador.nif);
  atualizarTexto("morada-utilizador", utilizador.morada);
  atualizarTexto("nome-utilizador-username", utilizador.nomeUtilizador);

  // Define a foto do perfil (Data URL ou caminho padrão)
  const elementoFoto = document.getElementById("foto-perfil");
  if (elementoFoto) {
    if (utilizador.foto && utilizador.foto.startsWith("data:")) {
      elementoFoto.src = utilizador.foto;
    } else {
      elementoFoto.src = utilizador.foto
        ? `img/${utilizador.foto}`
        : fotoPredefini;
    }
  }
}

// Termina a sessão do utilizador e redireciona para login
function terminarSessao() {
  localStorage.removeItem("sessao");
  window.location.href = "login.html";
}
