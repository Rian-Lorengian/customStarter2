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

function formatarHorario(hora, minuto) {
    const hora_formatada = String(hora).padStart(2, '0')
    const minuto_formatado = String(minuto).padStart(2, '0')

    return `${hora_formatada}:${minuto_formatado}`
}

function formatarData(dia_da_semana, dia_do_mes, mes, ano) {
    return `${dia_da_semana}, ${dia_do_mes} de ${mes} de ${ano}`
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