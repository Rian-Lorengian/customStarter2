// Listener para chamar as funções no momento em que a página for inciada
addEventListener('DOMContentLoaded', () => {
    inicio()
})

//Definição das funções utiliátrias
function incrementaDadoHora(chave, valor) {
    dados_horario[chave] = String(valor)
}

function incrementaDadoWallpaper(url, palavra, hora) {
    dados_wallpaper[hora] = {
      url: url,
      palavra: palavra
    };
  }

function incrementaDadoData(chave, valor) {
    dados_data[chave] = valor
}

function capitalizarPrimeiraLetra(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
  }

function formatarHorario(hora, minuto) {
    const hora_formatada = String(hora).padStart(2, '0')
    const minuto_formatado = String(minuto).padStart(2, '0')

    return `${hora_formatada}:${minuto_formatado}`
}

function formatarData(dia_da_semana, dia_do_mes, mes, ano) {
    return `${dia_da_semana}, ${dia_do_mes} de ${mes} de ${ano}`
}

function formatarTemperatura(temperatura) {
    return Math.round(temperatura) + 'ºC' 
}

function formatarClima(temperatura_atual, descricao_atual, descricao_futura) {
    const descricao = capitalizarPrimeiraLetra(descricao_atual)
    const temperatura =  formatarTemperatura(temperatura_atual)

    let ocorrencia = 'será de'
    const ocorrenciasEspeciais = ['nublado']
    
    if (ocorrenciasEspeciais.includes(descricao_futura)) {
        ocorrencia = 'estará';
    }
    
    if (descricao_atual === descricao_futura) {
        ocorrencia = ocorrencia === 'estará' ? 'permanecerá' : 'permanecerá com';
    }

    return `${descricao}. Atualmente faz ${temperatura}<br> Para as próximas horas, o clima ${ocorrencia} ${descricao_futura}.`
}

function getIcone(id) {
    return `https://openweathermap.org/img/wn/${id}@2x.png`
}

async function getClimaAtual(apiKey) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt`
    const response = await fetch(url)
    if (!response.ok) throw new Error("Erro ao consultar clima atual")
    return await response.json()
}

async function getClimaFuturo(apiKey) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt&cnt=1`
    const response = await fetch(url)
    if (!response.ok) throw new Error("Erro ao consultar previsão do clima")
    return await response.json()
}

function getPalavraAleatória() {
    const keywords = [
        "night", "river", "city", "mountain", "sunset", "forest", "ocean", "desert",
        "stars", "skyline", "mist", "sunrise", "waterfall", "beach", "valley", 
        "lake", "nebula", "canyon", "aurora", "clouds", "moonlight", "island", 
        "rain", "snow", "autumn", "spring", "winter", "summer", "galaxy", 
        "tropical", "village", "landscape", "horizon", "panorama", "reflection", 
        "wildlife", "waves", "glacier", "volcano", "meadow", "field", "cliff", 
        "countryside", "path", "garden", "bamboo", "palm trees", "coral reef", 
        "castle", "bridge", "harbor", "sky", "dusk", "dawn", "highway", "street", 
        "alley", "tower", "lighthouse", "cave", "temple", "zen", "peaceful", 
        "majestic", "dreamy", "mystical", "colorful",
        "minimal", "clean", "abstract", "gradient", "aesthetic", "dark", "light",
        "blurred", "bokeh", "pastel", "vaporwave", "cyberpunk", "futuristic",
        "technology", "digital art", "sci-fi", "serene"
    ]
    return keywords[Math.floor(Math.random() * keywords.length)]
}

async function getImagemUrl(key) {
    const palavra = getPalavraAleatória()

    const url = `https://api.unsplash.com/photos/random?query=${palavra}&orientation=landscape&client_id=${key}`
    
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Erro na requisição: ${resposta.status}`)
    
    const dados = await resposta.json()
    const imagemUrl = dados.urls?.regular

    incrementaDadoWallpaper(imagemUrl, palavra, dados_horario['hora'] + dados_horario['minuto'])

    return imagemUrl
}


function tipoAtualizacaoWalpaper() {
    const hora_local_storage = localStorage.getItem("ultimaHora")
    const url_armazenada = localStorage.getItem("imagemUnsplash")

    if(hora_local_storage != dados_horario['hora'] || !url_armazenada) {
        return true //Precisa de uma imagem nova
    } else {
        return false //Não precisa de uma imagem nova
    }

}

function setWallpaperbyURL(url_imagem) {
    wallpaperFundo.style.background = `url('${url_imagem}') no-repeat center/cover`
    localStorage.setItem("ultimaHora", dados_horario['hora'])
    localStorage.setItem("imagemUnsplash", url_imagem)
}


function verificaDiaNovo() {
    const dia_atual = dados_data['dia_do_mes']
    const dia_armazenado = localStorage.getItem("ultimoDia")

    if(dia_atual != dia_armazenado) {
        localStorage.setItem("ultimoDia", dia_atual)
        return true
    }
    else {
        return false
    }
}

function setFeriadoPorNome(feriado = '') {
    localStorage.setItem("feriado", feriado)
    feriado_campo.innerText = feriado
}

async function getFeriado(apiKey) {
    const ano = dados_data['ano']
    let feriado_hoje = ''

    if(!ano) {return}

    const data_atual = dados_data['data_hoje']
    // const data_atual = '2025-05-01'
    
    const url = `https://api.invertexto.com/v1/holidays/${ano}?token=${apiKey}&state=RS`

    const resposta = await fetch(url)
    const feriados = await resposta.json()

    feriados.forEach(feriado => {
        if(feriado.date == data_atual) {
            feriado_hoje = feriado.name
        }
    });

    return feriado_hoje
}

function mostrarLoading(mostrar = false) {
    if(mostrar) {
        loading.style.display = "flex"
    }
    else {
        loading.style.display = "none"
    }
}

async function forceNewWallpaper() {
    mostrarLoading(true)
    content.style.display = 'none'
    localStorage.setItem("ultimaHora", '')
    await atualizarWallpaper()
    mostrarLoading(false)
}

function showWallpaperDate() {
    // Limpa o conteúdo anterior
    const modalBox = document.getElementById("modal-box");
    modalBox.innerHTML = '';

    // Cria os itens com links clicáveis
    Object.values(dados_wallpaper).forEach((wallpaper) => {
        const linkItem = document.createElement('div');
        linkItem.className = 'item-menu';
        linkItem.innerHTML = `<a href="${wallpaper.url}" target="_blank" style="color: inherit; text-decoration: none;">${wallpaper.palavra}</a>`;
        modalBox.appendChild(linkItem);
    });

    // Adiciona o botão de fechar
    const closeButton = document.createElement('div')
    closeButton.className = 'item-menu'
    closeButton.id = 'content-menu-op-close'
    closeButton.textContent = 'Fechar Menu'
    closeButton.onclick = () => {
        information.style.display = 'none'
        content.style.display = 'flex'
    };
    modalBox.appendChild(closeButton)

    // Exibe o modal
    information.style.display = 'flex'
    content.style.display = 'none'
}

//Listener botões
function listenerButton() {
    document.getElementById('barra_hora').addEventListener("click", () => {
        content.style.display = 'flex'
    })

    content_menu_op_close.addEventListener("click", () => {
        content.style.display = 'none'
        information.style.display = 'none'
    })

    content_menu_op_1.addEventListener("click", () => {
        forceNewWallpaper()
    })

    content_menu_op_2.addEventListener("click", () => {
        showWallpaperDate()
    })

    content_menu_op_3.addEventListener("click", () => {
        processarLoading()
    })

}
// Definição das váriavies utilitárias de dados para o script
let dados_horario = {}
let dados_data = {}
let dados_wallpaper = {}

//elementos
const diasDaSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]
const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const relogio = document.getElementById('hora')
const dia = document.getElementById('dia')  
const saudacao_campo = document.getElementById("salute")
const clima_campo = document.getElementById("clima")
const icone = document.getElementById('icone')
const temp = document.getElementById('temp')
const wallpaperFundo = document.getElementById('main')
const feriado_campo = document.getElementById('feriado')
const loading = document.getElementById('loading')
const content = document.getElementById('content-menu')
const content_menu_op_close = document.getElementById('content-menu-op-close')
const content_menu_op_1 = document.getElementById('content-menu-op-1')
const content_menu_op_2 = document.getElementById('content-menu-op-2')
const information = document.getElementById('information')
const modalBox = document.getElementById("modal-box")
const content_menu_op_3 = document.getElementById('content-menu-op-3')

//Chaves de API
const openWeatherKey = "c48d97cd1032cbacf0f20cc5292a985c"
const unsplashKey = 'd0jLuZNi4lsVcYgvT43daJAVz4zWoKGgEky870rKuSk'
const holidaysKey = 'cRw5Blk4OtiBXPBwLLCn0bIEh1JwcCOA'

//Outras
const lat = '-27.9499376'
const lon = '-51.8074435'

// Funções startup
function inicio() {
    const timer = setInterval(() => {verificaAtualizacao()}, 1000)
    getDataAtual()
    processarLoading()
}

async function processarLoading() {
        mostrarLoading(true)
        verificaAtualizacao()
        processarMinuto()
        await processarHora()
        listenerButton()
        mostrarLoading(false)
}

function getDataAtual() {
    const dados_hora_atual = new Date()
    incrementaDadoHora('minuto', dados_hora_atual.getMinutes())
    incrementaDadoHora('hora', dados_hora_atual.getHours())
    incrementaDadoData('dia_da_semana', diasDaSemana[dados_hora_atual.getDay()])
    incrementaDadoData('dia_do_mes', dados_hora_atual.getDate())
    incrementaDadoData('mes', meses[dados_hora_atual.getMonth()])
    incrementaDadoData('mes_num', dados_hora_atual.getMonth() + 1)
    incrementaDadoData('ano', dados_hora_atual.getFullYear())
    incrementaDadoData('data_hoje', dados_hora_atual.toISOString().split('T')[0])
}

function verificaAtualizacao() {
    const dados_hora_atual = new Date()
    const minuto_armazenado = dados_horario['minuto']
    const hora_armazenada = dados_horario['hora']

    if(!dados_horario['minuto'] || !dados_horario['hora'] || dados_horario['minuto'] != dados_hora_atual.getMinutes() || dados_horario['hora'] != dados_hora_atual.getHours()) {
        getDataAtual()
    }

    if(minuto_armazenado != dados_hora_atual.getMinutes()) {
        processarMinuto()
    }

    if(hora_armazenada != dados_hora_atual.getHours()) {
        processarHora()
    }
}

//Chamamento das funções de hora e minuto
function processarMinuto() {
    atualizaRelogio()
}

async function processarHora() {
    atualizaData()
    atualizarSaudacao()
    // await atualizarClima()
    await atualizarWallpaper()
    await atualizarFeriado()
}


//Funções para atualizar o relógio da tela
function atualizaRelogio() {
    if(dados_horario['minuto'] && dados_horario['hora']) {
        const horario_formatado = formatarHorario(dados_horario['hora'], dados_horario['minuto'])
        relogio.innerText = horario_formatado
    }
}

//Funções para atualizar a data
function atualizaData() {
    if(dados_data['dia_da_semana'] && dados_data['dia_do_mes'] && dados_data['mes'] && dados_data['ano']) {
        const data_formatada = formatarData(dados_data['dia_da_semana'], dados_data['dia_do_mes'], dados_data['mes'], dados_data['ano'])
        dia.innerText = data_formatada
    }
}

//Funções para atualizar a saudação
function atualizarSaudacao() {
    if (!(dados_horario['minuto'] && dados_horario['hora'])) return;

    const horas = dados_horario['hora']
    let saudacao = ''
    const user_name = 'Rian'

    
    if (horas >= 6 && horas <= 12)  {
        saudacao = `Bom dia, ${user_name}`
    }
    else if (horas >= 13 && horas <= 18)  {
        saudacao = `Boa tarde, ${user_name}`
    }
    else if ((horas >= 19 && horas <= 23) || (horas >= 0 && horas <= 5)) {
        saudacao = `Boa noite, ${user_name}`
    }

    saudacao_campo.innerText = saudacao
}

//Função para atualizar o clima
async function atualizarClima() {
    const clima_atual = await getClimaAtual(openWeatherKey)
    const clima_futuro = await getClimaFuturo(openWeatherKey)

    if(!clima_atual && !clima_futuro) {return}

    const temperatura_atual = clima_atual.main.temp
    const id_icone_atual = clima_atual.weather[0].icon
    const descricao_atual = clima_atual.weather[0].description
    const descricao_futura = clima_futuro.list[0].weather[0].description 

    const text = formatarClima(temperatura_atual, descricao_atual, descricao_futura)
    const temperatura = formatarTemperatura(temperatura_atual)
    const link_icone = getIcone(id_icone_atual)

    clima_campo.innerHTML = text
    temp.innerText = temperatura
    icone.src = link_icone 
}

//Função para atualizar o wallpaper
async function atualizarWallpaper() {
    const imagem_nova = tipoAtualizacaoWalpaper()
    let url_imagem = ''

    if(imagem_nova) {
        url_imagem = await getImagemUrl(unsplashKey)
    } 
    else {
        url_imagem = localStorage.getItem("imagemUnsplash")
    }

    setWallpaperbyURL(url_imagem)
}


//Função para atualizar o feriado
async function atualizarFeriado() {
    const dia_novo = verificaDiaNovo()
    let feriado = ''

    if(dia_novo) {
        feriado = await getFeriado(holidaysKey)
        setFeriadoPorNome(feriado)
    }
    else {
        const feriado_armazenado = localStorage.getItem("feriado")
        setFeriadoPorNome(feriado_armazenado)
    }
}
