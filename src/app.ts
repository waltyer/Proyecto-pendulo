"use strict";

// DECLARACIÓN PARA CHART.JS 
declare var Chart: any;

// Configuraciones globales para Chart.js para que se vea bien con el tema oscuro
Chart.defaults.color = '#cbd5e1';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

//TIPOS 
type NullableChart = any | null;

//VARIABLES 
let chart1: NullableChart = null;
let chart2: NullableChart = null;
let chart3: NullableChart = null;

// SENO TAYLOR 
function senoTaylor(x: number, n: number): number {
    let s = 0;
    let termino = x;

    for (let i = 0; i < n; i++) {
        const signo = (i % 2 === 0) ? 1 : -1;
        s += signo * termino;
        termino *= (x * x) / ((2 * i + 2) * (2 * i + 3));
    }

    return s;
}

//  ANIMACIÓN 
function animarPendulo(theta_arr: number[], h: number): void {

    const canvas = document.getElementById("animacion") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    let i = 0;
    const L_px = 140; // Mayor longitud para el canvas más grande
    
    // Almacenamos el rastro (trail)
    const trail: {x: number, y: number}[] = [];

    function dibujar(): void {

        if (i >= theta_arr.length) return;

        const theta = theta_arr[i];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x0 = canvas.width / 2;
        const y0 = canvas.height / 2 - 100; // Más arriba

        const x = x0 + L_px * Math.sin(theta);
        const y = y0 + L_px * Math.cos(theta);

        // Guardar posición para el rastro
        trail.push({x, y});
        if (trail.length > 25) trail.shift(); // Mantener solo las últimas 25 posiciones

        // 1. Dibujar el techo (soporte)
        ctx.beginPath();
        ctx.moveTo(x0 - 40, y0);
        ctx.lineTo(x0 + 40, y0);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        // 2. Dibujar el rastro (estela)
        if (trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for(let j=1; j<trail.length; j++) {
                ctx.lineTo(trail[j].x, trail[j].y);
            }
            ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        // 3. Dibujar la cuerda con gradiente
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x, y);
        const grad = ctx.createLinearGradient(x0, y0, x, y);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.1)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.8)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 4. Dibujar el pivote central
        ctx.beginPath();
        ctx.arc(x0, y0, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // Resetear sombra

        // 5. Dibujar la bola (péndulo) con efecto 3D
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        
        const sphereGrad = ctx.createRadialGradient(x - 6, y - 6, 2, x, y, 18);
        sphereGrad.addColorStop(0, "#ffffff");
        sphereGrad.addColorStop(0.3, "#00f2fe");
        sphereGrad.addColorStop(1, "#4facfe");
        
        ctx.fillStyle = sphereGrad;
        ctx.shadowColor = "#00f2fe";
        ctx.shadowBlur = 25;
        ctx.fill();
        ctx.shadowBlur = 0; // Resetear sombra

        i++;

        setTimeout(dibujar, h * 1000);
    }

    dibujar();
}

// FUNCIÓN PRINCIPAL 
function simular(): void {

    const theta0Input = document.getElementById("theta0") as HTMLInputElement | null;
    const omega0Input = document.getElementById("omega0") as HTMLInputElement | null;
    const LInput = document.getElementById("L") as HTMLInputElement | null;
    const hInput = document.getElementById("h") as HTMLInputElement | null;
    const tInput = document.getElementById("t") as HTMLInputElement | null;
    const nInput = document.getElementById("n") as HTMLInputElement | null;

    if (!theta0Input || !omega0Input || !LInput || !hInput || !tInput || !nInput) {
        alert("Error en los inputs");
        return;
    }

    const theta0 = parseFloat(theta0Input.value);
    const omega0 = parseFloat(omega0Input.value);
    const L = parseFloat(LInput.value);
    const h = parseFloat(hInput.value);
    const t_total = parseFloat(tInput.value);
    const n = parseInt(nInput.value);

    if ([theta0, omega0, L, h, t_total, n].some(v => isNaN(v)) || L <= 0) {
        alert("Datos inválidos");
        return;
    }

    const g = 9.81;

    let filas: string[] = [];
    let t_arr: number[] = [];
    let theta_arr: number[] = [];
    let error_taylor_arr: number[] = [];
    let error_real_arr: number[] = [];

    let theta = theta0;
    let omega = omega0;
    let theta_prev = theta0;

    let htmlTabla = `
        <table class="glass-table">
            <thead>
                <tr>
                    <th>Tiempo (s)</th>
                    <th>θ (rad)</th>
                    <th>ω (rad/s)</th>
                    <th>Error Abs</th>
                    <th>Error Rel (%)</th>
                    <th>Error Aprox (%)</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let t = 0; t <= t_total; t += h) {

        const seno_real = Math.sin(theta);
        const seno_taylor = senoTaylor(theta, n);

        // Solución analítica para ángulos pequeños (usada como referencia)
        const theta_real = theta0 * Math.cos(Math.sqrt(g / L) * t);
        
        // Cálculos de errores
        const error_abs = Math.abs(theta_real - theta);
        const error_rel = t === 0 ? 0 : (error_abs / (Math.abs(theta_real) + 1e-10)) * 100;
        const error_aprox = t === 0 ? 0 : Math.abs((theta - theta_prev) / (Math.abs(theta) + 1e-10)) * 100;
        const error_taylor = Math.abs(seno_real - seno_taylor);

        htmlTabla += `
                <tr>
                    <td>${t.toFixed(2)}</td>
                    <td>${theta.toFixed(4)}</td>
                    <td>${omega.toFixed(4)}</td>
                    <td>${error_abs.toFixed(6)}</td>
                    <td>${error_rel.toFixed(4)}</td>
                    <td>${error_aprox.toFixed(4)}</td>
                </tr>
        `;

        t_arr.push(t);
        theta_arr.push(theta);
        error_taylor_arr.push(error_taylor);
        error_real_arr.push(error_abs);

        theta_prev = theta;

        // Método de Euler Explícito (Obligatorio)
        const theta_new = theta + h * omega;
        const omega_new = omega - h * (g / L) * seno_taylor; // Usamos la serie de Taylor como pide el proyecto para el análisis del truncamiento
        
        theta = theta_new;
        omega = omega_new;
    }

    htmlTabla += `</tbody></table>`;

    const tablaContainer = document.getElementById("tabla-container");
    if (tablaContainer) tablaContainer.innerHTML = htmlTabla;

    if (chart1) chart1.destroy();
    if (chart2) chart2.destroy();
    if (chart3) chart3.destroy();

    const graf1 = document.getElementById("graf1") as HTMLCanvasElement | null;
    const graf2 = document.getElementById("graf2") as HTMLCanvasElement | null;
    const graf3 = document.getElementById("graf3") as HTMLCanvasElement | null;

    // Configuración global detallada para las gráficas
    const getChartOptions = (xTitle: string, yTitle: string) => ({
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { font: { family: 'Outfit', size: 14 } }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { family: 'Outfit', size: 14 },
                bodyFont: { family: 'Outfit', size: 13 },
                padding: 12,
                cornerRadius: 8,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                title: { display: true, text: xTitle, font: { family: 'Outfit', size: 14, weight: 'bold' } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
                title: { display: true, text: yTitle, font: { family: 'Outfit', size: 14, weight: 'bold' } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        },
        elements: {
            point: { radius: 2, hoverRadius: 6 },
            line: { borderWidth: 3 }
        }
    });

    if (graf1) {
        chart1 = new Chart(graf1, {
            type: "line",
            data: {
                labels: t_arr.map(t => t.toFixed(2)),
                datasets: [{ 
                    label: "Ángulo θ(t)", 
                    data: theta_arr,
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: getChartOptions("Tiempo (s)", "Ángulo (rad)")
        });
    }

    if (graf2) {
        chart2 = new Chart(graf2, {
            type: "line",
            data: {
                labels: t_arr.map(t => t.toFixed(2)),
                datasets: [
                    { 
                        label: "Error Taylor (Trunc. función)", 
                        data: error_taylor_arr,
                        borderColor: '#ce2dbb',
                        tension: 0.4
                    },
                    { 
                        label: "Error Absoluto (Trunc. Euler)", 
                        data: error_real_arr,
                        borderColor: '#00f2fe',
                        tension: 0.4
                    }
                ]
            },
            options: getChartOptions("Tiempo (s)", "Magnitud del Error")
        });
    }

    if (graf3) {
        const h_values = [0.2, 0.1, 0.05, 0.01];
        const errores: number[] = [];

        // Solución de referencia con paso muy fino para calcular el error de truncamiento global vs h
        function simularRef(hh: number): number {
            let th = theta0;
            let om = omega0;
            
            for (let t = 0; t <= t_total; t += hh) {
                const seno = Math.sin(th);
                const th_new = th + hh * om;
                const om_new = om - hh * (g / L) * seno;
                th = th_new;
                om = om_new;
            }
            return th;
        }

        const ref_final = simularRef(0.0001);

        h_values.forEach(hh => {
            const aprox_final = simularRef(hh);
            const error = Math.abs(ref_final - aprox_final);
            errores.push(error);
        });

        chart3 = new Chart(graf3, {
            type: "line",
            data: {
                labels: h_values,
                datasets: [{ 
                    label: "Error Global vs Tamaño de paso (h)", 
                    data: errores,
                    borderColor: '#f2c94c',
                    backgroundColor: 'rgba(242, 201, 76, 0.2)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: getChartOptions("Tamaño de paso (h)", "Error Absoluto Global")
        });
    }

    animarPendulo(theta_arr, h);
}

//  EVENTO BOTÓN 
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnSimular");
    btn?.addEventListener("click", simular);
});