function atualizarProgresso() {
    const now = new Date();

    const calcularProgresso = (inicio, fim) => ((now - inicio) / (fim - inicio)) * 100;

    // Hora
    const startOfHour = new Date(now).setMinutes(0, 0, 0);
    const endOfHour = new Date(startOfHour).setHours(new Date(startOfHour).getHours() + 1);
    const hourProgress = calcularProgresso(startOfHour, endOfHour);

    // Dia
    const startOfDay = new Date(now).setHours(0, 0, 0, 0);
    const endOfDay = new Date(now).setHours(23, 59, 59, 999);
    const dayProgress = calcularProgresso(startOfDay, endOfDay);

    // Semana (sábado a sexta)
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado

    if (dayOfWeek === 6) {
        // Se for sábado, começa hoje
        startOfWeek.setDate(now.getDate());
    } else {
        // Se for qualquer outro dia, ajusta para o último sábado
        startOfWeek.setDate(now.getDate() - ((dayOfWeek + 1) % 7));
    }
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sexta-feira
    endOfWeek.setHours(23, 59, 59, 999);

    const weekProgress = calcularProgresso(startOfWeek, endOfWeek);

    // Ano
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const yearProgress = calcularProgresso(startOfYear, endOfYear);

    // Verifica se a estrutura já foi adicionada no HTML
    if (!document.getElementById("hour-text")) {
        const lowContainer = document.getElementById("low");

        lowContainer.innerHTML = `
            <div class="progress-container" id="barra_hora"">
                <div class="progress-text" id="hour-text"></div>
                <div class="progress-bar"></div>
            </div>
            <div class="progress-container" id="barra_dia">
                <div class="progress-text" id="day-text"></div>
                <div class="progress-bar"></div>
            </div>
            <div class="progress-container">
                <div class="progress-text" id="week-text"></div>
                <div class="progress-bar"></div>
            </div>
            <div class="progress-container">
                <div class="progress-text" id="year-text"></div>
                <div class="progress-bar"></div>
            </div>
        `;
    }

    // Atualiza os textos
    const atualizarTexto = (id, label, valor) => {
        document.getElementById(id).innerText = `${label} ${Math.round(valor)}%`;
    };

    atualizarTexto("hour-text", "HORA", hourProgress);
    atualizarTexto("day-text", "DIA", dayProgress);
    atualizarTexto("week-text", "SEMANA", weekProgress);
    atualizarTexto("year-text", "ANO", yearProgress);
}

// Chama a função imediatamente e define o intervalo para 1 minuto
atualizarProgresso();
setInterval(atualizarProgresso, 30000);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        atualizarProgresso();
    }
});