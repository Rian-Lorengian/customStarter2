// Listener para chamar as funções no momento em que a página for inciada
addEventListener('DOMContentLoaded', () => {
    inicio()
})

//Definição das funções utiliátrias
function incrementaDadoHora(chave, valor) {
    dados_horario[chave] = valor
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

function formatarClima(temperatura_atual, descricao_atual, descricao_futura) {
    const descricao = capitalizarPrimeiraLetra(descricao_atual)
    const temperatura =  Math.round(temperatura_atual)
    console.log(temperatura)

    let ocorrencia = 'será de'
    const ocorrenciasEspeciais = ['nublado']
    
    if (ocorrenciasEspeciais.includes(descricao_futura)) {
        ocorrencia = 'estará';
    }
    
    if (descricao_atual === descricao_futura) {
        ocorrencia = ocorrencia === 'estará' ? 'permanecerá' : 'permanecerá com';
    }

    return `${descricao}. Atualmente faz ${temperatura}ºC <br> Para as próximas horas, o clima ${ocorrencia} ${descricao_futura}`
}

// Definição das váriavies utilitárias de dados para o script
let dados_horario = {}
let dados_data = {}

//elementos
const diasDaSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]
const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const relogio = document.getElementById('hora')
const dia = document.getElementById('dia')  
const saudacao_campo = document.getElementById("salute")
const clima_campo = document.getElementById("clima")

//Chaves de API
const openWeatherKey = "c48d97cd1032cbacf0f20cc5292a985c"

//Outras
const lat = '-27.9499376'
const lon = '-51.8074435'

// Funções startup
function inicio() {
    const timer = setInterval(() => {verificaAtualizacao()}, 1000)
    getDataAtual()
    verificaAtualizacao()
    processarMinuto()
    processarHora()
}

function getDataAtual() {
    const dados_hora_atual = new Date()
    incrementaDadoHora('minuto', dados_hora_atual.getMinutes())
    incrementaDadoHora('hora', dados_hora_atual.getHours())
    incrementaDadoData('dia_da_semana', diasDaSemana[dados_hora_atual.getDay()])
    incrementaDadoData('dia_do_mes', dados_hora_atual.getDate())
    incrementaDadoData('mes', meses[dados_hora_atual.getMonth()])
    incrementaDadoData('ano', dados_hora_atual.getFullYear())
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
    await atualizarClima()
}

function verificarHoraStorage() {
    const hora_local_storage = localStorage.getItem("ultimaHora")

    if(hora_local_storage != dados_horario['hora']) {
        localStorage.setItem("ultimaHora", dados_horario['hora'])
        return true //precisa executar
    } else {
        return false //não precisa executar
    }

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
    if (!(dados_horario.minuto && dados_horario.hora)) return;

    const horas = dados_horario['hora']
    let saudacao = ''
    const user_name = 'Rian'

    
    if (horas >= 6 && horas <= 12)  {
        saudacao = `Bom dia, ${user_name}`;
    }
    else if (horas >= 13 && horas <= 18)  {
        saudacao = `Boa tarde, ${user_name}`;
    }
    else if ((horas >= 19 && horas <= 23) || (horas >= 0 && horas <= 5)) {
        saudacao = `Boa noite, ${user_name}`;
    }

    saudacao_campo.innerText = saudacao
}

async function atualizarClima() {
    const clima_atual = await getClimaAtual(openWeatherKey)
    const clima_futuro = await getClimaFuturo(openWeatherKey)

    if(!clima_atual && !clima_futuro) {return}

    const temperatura_atual = clima_atual.main.temp
    const id_icone_atual = clima_atual.weather[0].icon
    const descricao_atual = clima_atual.weather[0].description
    const descricao_futura = clima_futuro.list[0].main.description // BUG AQUI!!

    const text = formatarClima(temperatura_atual, descricao_atual, descricao_futura)

    clima_campo.innerHTML = text
    
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