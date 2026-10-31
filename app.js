/**
 * KONTARA - Sistema de Gestión Financiera Personal
 * HU 1 (RF-01): Dashboard principal con indicadores clave en tiempo real.
 * HU 2 (RF-02): Gráficos interactivos, porcentaje de gastos por categoría y distribución del dinero.
 */

// Conjunto inicial de transacciones realistas para demostración y análisis
const transaccionesIniciales = [
    { id: 1, tipo: 'ingreso', categoria: 'Salario', descripcion: 'Sueldo mensual principal', valor: 4200000, fecha: '2026-09-01' },
    { id: 2, tipo: 'ingreso', categoria: 'Honorarios', descripcion: 'Consultoría externa', valor: 1300000, fecha: '2026-09-15' },
    { id: 3, tipo: 'egreso', categoria: 'Vivienda', descripcion: 'Canon de arrendamiento', valor: 1400000, fecha: '2026-09-03' },
    { id: 4, tipo: 'egreso', categoria: 'Alimentación', descripcion: 'Mercado del mes', valor: 850000, fecha: '2026-09-06' },
    { id: 5, tipo: 'egreso', categoria: 'Servicios', descripcion: 'Agua, luz, gas e internet', valor: 360000, fecha: '2026-09-09' },
    { id: 6, tipo: 'egreso', categoria: 'Transporte', descripcion: 'Gasolina y transporte público', valor: 280000, fecha: '2026-09-12' },
    { id: 7, tipo: 'egreso', categoria: 'Salud', descripcion: 'Medicina prepagada', valor: 210000, fecha: '2026-09-17' },
    { id: 8, tipo: 'egreso', categoria: 'Educación', descripcion: 'Cursos y formación', valor: 180000, fecha: '2026-09-21' },
    { id: 9, tipo: 'egreso', categoria: 'Entretenimiento', descripcion: 'Plataformas y salidas', valor: 120000, fecha: '2026-09-24' }
];

let transacciones = transaccionesIniciales;

// Referencias a instancias de Chart.js para reciclaje/destrucción sin memory leaks
let graficoGastosInstance = null;
let graficoDistribucionInstance = null;

// Paleta neutra profesional (tonos pizarra, grafito, ámbar tierra, pino apagado y taupe)
const PALETA_NEUTRA = [
    '#334155', // Slate grafito
    '#475569', // Pizarra medio
    '#0f766e', // Verde petróleo / pino sobrio
    '#b45309', // Ámbar tierra suave
    '#78716c', // Gris piedra cálido / taupe
    '#9f1239', // Borgoña apagado
    '#1e293b', // Azul noche / carbón
    '#52525b', // Zinc neutro
    '#65a30d'  // Oliva suave
];

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(valor);
}

/**
 * HU 1: Indicadores Financieros
 */
function calcularIndicadoresFinancieros(listaTransacciones = []) {
    const movimientosIngreso = listaTransacciones.filter(t => t.tipo === 'ingreso');
    const totalIngresos = movimientosIngreso.reduce((acumulado, t) => acumulado + t.valor, 0);

    const movimientosEgreso = listaTransacciones.filter(t => t.tipo === 'egreso');
    const totalEgresos = movimientosEgreso.reduce((acumulado, t) => acumulado + t.valor, 0);

    const balanceNeto = totalIngresos - totalEgresos;

    const porcentajeAhorro = totalIngresos > 0 
        ? Math.max(0, Math.round((balanceNeto / totalIngresos) * 100)) 
        : 0;

    actualizarVistaDashboard({
        totalIngresos,
        totalEgresos,
        balanceNeto,
        conteoIngresos: movimientosIngreso.length,
        conteoEgresos: movimientosEgreso.length,
        porcentajeAhorro
    });
}

function actualizarVistaDashboard(datos) {
    const elementoBalance = document.getElementById('total-balance');
    const elementoBalanceStatus = document.getElementById('balance-status');
    const elementoIngreso = document.getElementById('total-income');
    const elementoIngresoConteo = document.getElementById('income-count');
    const elementoEgreso = document.getElementById('total-expense');
    const elementoEgresoConteo = document.getElementById('expense-count');
    const elementoSavingsRate = document.getElementById('savings-rate');
    const elementoProgressFill = document.getElementById('progress-fill');
    const legendIncome = document.getElementById('legend-income');
    const legendExpense = document.getElementById('legend-expense');
    const legendBalance = document.getElementById('legend-balance');

    if (elementoBalance) elementoBalance.textContent = formatearMoneda(datos.balanceNeto);
    if (elementoIngreso) elementoIngreso.textContent = `+ ${formatearMoneda(datos.totalIngresos)}`;
    if (elementoEgreso) elementoEgreso.textContent = `- ${formatearMoneda(datos.totalEgresos)}`;

    if (elementoIngresoConteo) {
        elementoIngresoConteo.textContent = `${datos.conteoIngresos} ingresos registrados`;
    }
    if (elementoEgresoConteo) {
        elementoEgresoConteo.textContent = `${datos.conteoEgresos} egresos registrados`;
    }

    if (elementoBalanceStatus) {
        if (datos.conteoIngresos === 0 && datos.conteoEgresos === 0) {
            elementoBalanceStatus.textContent = 'Sin movimientos registrados en este período.';
        } else if (datos.balanceNeto > 0) {
            elementoBalanceStatus.textContent = 'Estado: Superávit disponible para ahorro o inversión.';
        } else if (datos.balanceNeto === 0) {
            elementoBalanceStatus.textContent = 'Estado: En punto de equilibrio ($0).';
        } else {
            elementoBalanceStatus.textContent = 'Alerta: Déficit en el período actual.';
        }
    }

    if (elementoSavingsRate) elementoSavingsRate.textContent = `${datos.porcentajeAhorro}% Ahorro`;
    if (legendIncome) legendIncome.textContent = formatearMoneda(datos.totalIngresos);
    if (legendExpense) legendExpense.textContent = formatearMoneda(datos.totalEgresos);
    if (legendBalance) legendBalance.textContent = formatearMoneda(datos.balanceNeto);

    if (elementoProgressFill) {
        elementoProgressFill.value = datos.porcentajeAhorro;
        elementoProgressFill.style.width = `${datos.porcentajeAhorro}%`;
    }
}

/**
 * HU 2 (RF-02): Gráficos interactivos y análisis de distribución
 */
function renderizarGraficos(listaTransacciones = []) {
    renderizarGraficoGastosPorCategoria(listaTransacciones);
    renderizarGraficoDistribucionDinero(listaTransacciones);
}

/**
 * Gráfico 1: Porcentaje de gastos por categoría (Doughnut interactivo)
 */
function renderizarGraficoGastosPorCategoria(listaTransacciones = []) {
    const canvas = document.getElementById('expenses-chart');
    const breakdownList = document.getElementById('category-breakdown-list');
    if (!canvas || !breakdownList) return;

    if (graficoGastosInstance) {
        graficoGastosInstance.destroy();
        graficoGastosInstance = null;
    }

    // Filtrar únicamente los egresos
    const egresos = listaTransacciones.filter(t => t.tipo === 'egreso');
    const totalEgresos = egresos.reduce((acc, t) => acc + t.valor, 0);

    // Limpiar lista de desglose (usando semántica: sólo li y span, CERO DIVS)
    breakdownList.innerHTML = '';

    if (egresos.length === 0 || totalEgresos === 0) {
        const itemVacio = document.createElement('li');
        itemVacio.className = 'empty-chart-notice';
        itemVacio.textContent = 'Sin gastos registrados en el período seleccionado.';
        breakdownList.appendChild(itemVacio);
        return;
    }

    // Agrupar por categoría
    const categoriasMap = egresos.reduce((acc, t) => {
        const cat = t.categoria || 'Varios';
        acc[cat] = (acc[cat] || 0) + t.valor;
        return acc;
    }, {});

    // Ordenar de mayor a menor gasto
    const categoriasOrdenadas = Object.keys(categoriasMap).sort((a, b) => categoriasMap[b] - categoriasMap[a]);
    const etiquetas = categoriasOrdenadas;
    const montos = categoriasOrdenadas.map(cat => categoriasMap[cat]);
    const porcentajes = montos.map(m => ((m / totalEgresos) * 100).toFixed(1));
    const colores = etiquetas.map((_, i) => PALETA_NEUTRA[i % PALETA_NEUTRA.length]);

    // Generar la lista semántica accesible sin ningún div
    etiquetas.forEach((cat, index) => {
        const li = document.createElement('li');
        li.className = 'category-breakdown-item';

        const nameGroup = document.createElement('span');
        nameGroup.className = 'category-name-group';

        const dot = document.createElement('span');
        dot.className = 'category-color-dot';
        dot.style.backgroundColor = colores[index];

        const name = document.createElement('span');
        name.textContent = cat;

        nameGroup.appendChild(dot);
        nameGroup.appendChild(name);

        const valuesGroup = document.createElement('span');
        valuesGroup.className = 'category-values-group';

        const amount = document.createElement('span');
        amount.className = 'category-amount';
        amount.textContent = formatearMoneda(montos[index]);

        const percentTag = document.createElement('strong');
        percentTag.className = 'category-percent-tag';
        percentTag.textContent = `${porcentajes[index]}%`;

        valuesGroup.appendChild(amount);
        valuesGroup.appendChild(percentTag);

        li.appendChild(nameGroup);
        li.appendChild(valuesGroup);
        breakdownList.appendChild(li);
    });

    if (typeof Chart === 'undefined') return;

    graficoGastosInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: etiquetas,
            datasets: [{
                data: montos,
                backgroundColor: colores,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Usamos la lista semántica accesible en el footer
                },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const valor = context.raw || 0;
                            const porcentaje = ((valor / totalEgresos) * 100).toFixed(1);
                            return ` ${formatearMoneda(valor)} (${porcentaje}%)`;
                        }
                    }
                }
            },
            cutout: '68%'
        }
    });
}

/**
 * Gráfico 2: Distribución del dinero (Barras comparativas de flujo)
 */
function renderizarGraficoDistribucionDinero(listaTransacciones = []) {
    const canvas = document.getElementById('distribution-chart');
    const summaryText = document.getElementById('distribution-summary-text');
    if (!canvas) return;

    if (graficoDistribucionInstance) {
        graficoDistribucionInstance.destroy();
        graficoDistribucionInstance = null;
    }

    const ingresos = listaTransacciones.filter(t => t.tipo === 'ingreso');
    const egresos = listaTransacciones.filter(t => t.tipo === 'egreso');

    const totalIngresos = ingresos.reduce((acc, t) => acc + t.valor, 0);
    const totalEgresos = egresos.reduce((acc, t) => acc + t.valor, 0);
    const balanceNeto = totalIngresos - totalEgresos;

    if (summaryText) {
        if (totalIngresos === 0 && totalEgresos === 0) {
            summaryText.textContent = 'Sin transacciones registradas para analizar la distribución en este período.';
        } else if (totalIngresos > 0) {
            const pctGastos = ((totalEgresos / totalIngresos) * 100).toFixed(1);
            const pctMargen = Math.max(0, ((balanceNeto / totalIngresos) * 100)).toFixed(1);
            summaryText.innerHTML = `De los <strong>${formatearMoneda(totalIngresos)}</strong> percibidos, el <strong>${pctGastos}%</strong> (${formatearMoneda(totalEgresos)}) se destinó a egresos, reteniendo un margen disponible del <strong>${pctMargen}%</strong> (${formatearMoneda(Math.max(0, balanceNeto))}).`;
        } else {
            summaryText.innerHTML = `Se han ejecutado egresos por <strong>${formatearMoneda(totalEgresos)}</strong> sin ingresos registrados en este período.`;
        }
    }

    if (typeof Chart === 'undefined') return;

    graficoDistribucionInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Ingresos Totales', 'Egresos Totales', 'Margen Disponible'],
            datasets: [{
                data: [totalIngresos, totalEgresos, Math.max(0, balanceNeto)],
                backgroundColor: [
                    '#1e293b', // Slate primario
                    '#475569', // Pizarra egresos
                    '#0f766e'  // Verde petróleo / margen disponible
                ],
                borderRadius: 8,
                barThickness: 34
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return ` ${formatearMoneda(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        },
                        callback: function(val) {
                            if (val >= 1000000) return `$ ${(val / 1000000).toFixed(1)}M`;
                            if (val >= 1000) return `$ ${(val / 1000).toFixed(0)}k`;
                            return `$ ${val}`;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function filtrarTransaccionesPorPeriodo(periodo, lista) {
    if (periodo === 'september') {
        return lista.filter(t => t.fecha && t.fecha.startsWith('2026-09'));
    } else if (periodo === 'year') {
        return lista.filter(t => t.fecha && t.fecha.startsWith('2026'));
    }
    return lista;
}

document.addEventListener('DOMContentLoaded', () => {
    // Renderizado inicial con período seleccionado por defecto (Septiembre 2026)
    const selectPeriodo = document.getElementById('select-period');
    const periodoActual = selectPeriodo ? selectPeriodo.value : 'september';
    const transaccionesFiltradas = filtrarTransaccionesPorPeriodo(periodoActual, transacciones);

    calcularIndicadoresFinancieros(transaccionesFiltradas);
    renderizarGraficos(transaccionesFiltradas);

    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', (e) => {
            const periodoSeleccionado = e.target.value;
            const movimientosFiltrados = filtrarTransaccionesPorPeriodo(periodoSeleccionado, transacciones);
            calcularIndicadoresFinancieros(movimientosFiltrados);
            renderizarGraficos(movimientosFiltrados);
        });
    }
});
