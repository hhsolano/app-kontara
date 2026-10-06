/**
 * KONTARA - Lógica del Dashboard Financiero
 * Historia de Usuario 1 (RF-01):
 * - Cálculo y renderizado de ingresos totales.
 * - Cálculo y renderizado de egresos totales.
 * - Cálculo y presentación del balance neto disponible.
 */

// Conjunto inicial de movimientos representativos para el período actual
const transaccionesIniciales = [
    { id: 1, tipo: 'ingreso', categoria: 'Salario', descripcion: 'Nómina quincenal principal', valor: 3500000, fecha: '2026-10-01' },
    { id: 2, tipo: 'ingreso', categoria: 'Honorarios', descripcion: 'Proyecto consultoría independiente', valor: 1200000, fecha: '2026-10-03' },
    { id: 3, tipo: 'egreso', categoria: 'Vivienda', descripcion: 'Pago canon de arrendamiento', valor: 1400000, fecha: '2026-10-02' },
    { id: 4, tipo: 'egreso', categoria: 'Servicios', descripcion: 'Servicios públicos y conectividad', valor: 320000, fecha: '2026-10-04' },
    { id: 5, tipo: 'egreso', categoria: 'Alimentación', descripcion: 'Mercado mensual supermercado', valor: 650000, fecha: '2026-10-05' },
    { id: 6, tipo: 'egreso', categoria: 'Transporte', descripcion: 'Gasolina y peajes', valor: 180000, fecha: '2026-10-06' }
];

/**
 * Formatea un valor numérico a moneda estándar (COP / pesos)
 * @param {number} valor 
 * @returns {string}
 */
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(valor);
}

/**
 * Calcula y actualiza los indicadores financieros del Dashboard
 * @param {Array} transacciones 
 */
function calcularIndicadoresFinancieros(transacciones) {
    // 1. Calcular Ingresos Totales
    const movimientosIngreso = transacciones.filter(t => t.tipo === 'ingreso');
    const totalIngresos = movimientosIngreso.reduce((acumulado, t) => acumulado + t.valor, 0);

    // 2. Calcular Egresos Totales
    const movimientosEgreso = transacciones.filter(t => t.tipo === 'egreso');
    const totalEgresos = movimientosEgreso.reduce((acumulado, t) => acumulado + t.valor, 0);

    // 3. Calcular Balance Neto Disponible (Ingresos - Egresos)
    const balanceNeto = totalIngresos - totalEgresos;

    // 4. Calcular ratio de retención / ahorro (%)
    const porcentajeAhorro = totalIngresos > 0 
        ? Math.max(0, Math.round((balanceNeto / totalIngresos) * 100)) 
        : 0;

    // Renderizar en el DOM
    actualizarVistaDashboard({
        totalIngresos,
        totalEgresos,
        balanceNeto,
        conteoIngresos: movimientosIngreso.length,
        conteoEgresos: movimientosEgreso.length,
        porcentajeAhorro
    });
}

/**
 * Actualiza los elementos del HTML sin utilizar estilos en línea
 * @param {Object} datos 
 */
function actualizarVistaDashboard(datos) {
    // Elementos de Balance
    const elementoBalance = document.getElementById('total-balance');
    const elementoBalanceStatus = document.getElementById('balance-status');

    // Elementos de Ingresos
    const elementoIngreso = document.getElementById('total-income');
    const elementoIngresoConteo = document.getElementById('income-count');

    // Elementos de Egresos
    const elementoEgreso = document.getElementById('total-expense');
    const elementoEgresoConteo = document.getElementById('expense-count');

    // Elementos de Salud y Progreso
    const elementoSavingsRate = document.getElementById('savings-rate');
    const elementoProgressFill = document.getElementById('progress-fill');
    const legendIncome = document.getElementById('legend-income');
    const legendExpense = document.getElementById('legend-expense');
    const legendBalance = document.getElementById('legend-balance');

    // Asignación de valores monetarios
    if (elementoBalance) elementoBalance.textContent = formatearMoneda(datos.balanceNeto);
    if (elementoIngreso) elementoIngreso.textContent = `+ ${formatearMoneda(datos.totalIngresos)}`;
    if (elementoEgreso) elementoEgreso.textContent = `- ${formatearMoneda(datos.totalEgresos)}`;

    // Textos de conteo
    if (elementoIngresoConteo) elementoIngresoConteo.textContent = `${datos.conteoIngresos} ingresos registrados`;
    if (elementoEgresoConteo) elementoEgresoConteo.textContent = `${datos.conteoEgresos} egresos registrados`;

    // Estado del balance neto
    if (elementoBalanceStatus) {
        if (datos.balanceNeto > 0) {
            elementoBalanceStatus.textContent = 'Estado: Superávit saludable disponible para ahorro o inversión.';
        } else if (datos.balanceNeto === 0) {
            elementoBalanceStatus.textContent = 'Estado: En punto de equilibrio exacto.';
        } else {
            elementoBalanceStatus.textContent = 'Alerta: Déficit en el período actual. Los egresos superan ingresos.';
        }
    }

    // Leyendas y barra de proporción de ahorro
    if (elementoSavingsRate) elementoSavingsRate.textContent = `${datos.porcentajeAhorro}% Margen neto`;
    if (legendIncome) legendIncome.textContent = formatearMoneda(datos.totalIngresos);
    if (legendExpense) legendExpense.textContent = formatearMoneda(datos.totalEgresos);
    if (legendBalance) legendBalance.textContent = formatearMoneda(datos.balanceNeto);

    // Ajuste del ancho de la barra mediante clase o propiedad CSS
    if (elementoProgressFill) {
        elementoProgressFill.style.width = `${datos.porcentajeAhorro}%`;
    }
}

// Inicialización al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    calcularIndicadoresFinancieros(transaccionesIniciales);

    // Escucha para cambio de período (simulación funcional)
    const selectPeriodo = document.getElementById('select-period');
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', (e) => {
            const valor = e.target.value;
            if (valor === 'prev-month') {
                // Simulación período anterior
                calcularIndicadoresFinancieros([
                    { id: 10, tipo: 'ingreso', valor: 4500000 },
                    { id: 11, tipo: 'egreso', valor: 2900000 }
                ]);
            } else if (valor === 'year') {
                // Simulación año
                calcularIndicadoresFinancieros([
                    { id: 20, tipo: 'ingreso', valor: 42000000 },
                    { id: 21, tipo: 'egreso', valor: 28500000 }
                ]);
            } else {
                // Mes actual
                calcularIndicadoresFinancieros(transaccionesIniciales);
            }
        });
    }
});
