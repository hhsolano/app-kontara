let transacciones = [];

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(valor);
}

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
    if (elementoIngreso) elementoIngreso.textContent = formatearMoneda(datos.totalIngresos);
    if (elementoEgreso) elementoEgreso.textContent = formatearMoneda(datos.totalEgresos);

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
            elementoBalanceStatus.textContent = 'Estado: Superávit disponible.';
        } else if (datos.balanceNeto === 0) {
            elementoBalanceStatus.textContent = 'Estado: En equilibrio ($0).';
        } else {
            elementoBalanceStatus.textContent = 'Alerta: Déficit en el período.';
        }
    }

    if (elementoSavingsRate) elementoSavingsRate.textContent = `${datos.porcentajeAhorro}% Ahorro`;
    if (legendIncome) legendIncome.textContent = formatearMoneda(datos.totalIngresos);
    if (legendExpense) legendExpense.textContent = formatearMoneda(datos.totalEgresos);
    if (legendBalance) legendBalance.textContent = formatearMoneda(datos.balanceNeto);

    if (elementoProgressFill) {
        elementoProgressFill.style.width = `${datos.porcentajeAhorro}%`;
    }
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
    calcularIndicadoresFinancieros(transacciones);

    const selectPeriodo = document.getElementById('select-period');
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', (e) => {
            const periodoSeleccionado = e.target.value;
            const movimientosFiltrados = filtrarTransaccionesPorPeriodo(periodoSeleccionado, transacciones);
            calcularIndicadoresFinancieros(movimientosFiltrados);
        });
    }
});
