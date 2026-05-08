"use strict";

// ================= DECLARACIÓN PARA CHART.JS =================
declare var Chart: any;

// ================= TIPOS =================
type NullableChart = any | null;

// ================= VARIABLES =================
let chart1: NullableChart = null;
let chart2: NullableChart = null;
let chart3: NullableChart = null;

// ================= SENO TAYLOR =================
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

// ================= ANIMACIÓN =================
function animarPendulo(theta_arr: number[], h: number): void {

    const canvas = document.getElementById("animacion") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    let i = 0;
    const L_px = 100;

    function dibujar(): void {

        if (i >= theta_arr.length) return;

        const theta = theta_arr[i];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x0 = canvas.width / 2;
        const y0 = 50;

        const x = x0 + L_px * Math.sin(theta);
        const y = y0 + L_px * Math.cos(theta);

        // cuerda
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x, y);
        ctx.stroke();

        // bola
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        i++;

        // ⏱️ AQUÍ ESTÁ LA CLAVE
        setTimeout(dibujar, h * 1000);
    }

    dibujar();
}

// ================= FUNCIÓN PRINCIPAL =================
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

    if ([theta0, omega0, L, h, t_total, n].some(v => isNaN(v)) || L === 0) {
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

    for (let t = 0; t <= t_total; t += h) {

        const seno_real = Math.sin(theta);
        const seno_taylor = senoTaylor(theta, n);

        const error_abs = Math.abs(theta - theta_prev);
        const error_rel = (error_abs / (Math.abs(theta) + 1e-10)) * 100;
        const error_aprox = Math.abs((theta - theta_prev) / (theta + 1e-10)) * 100;
        const error_taylor = Math.abs(seno_real - seno_taylor);

        const theta_real = theta0 * Math.cos(Math.sqrt(g / L) * t);
        const error_real = Math.abs(theta - theta_real);

        filas.push(`Tiempo: ${t.toFixed(2)} s | θ: ${theta.toFixed(4)} | Error: ${error_real.toFixed(6)}`);

        t_arr.push(t);
        theta_arr.push(theta);
        error_taylor_arr.push(error_taylor);
        error_real_arr.push(error_real);

        theta_prev = theta;

        // Euler-Cromer
        omega = omega - h * (g / L) * seno_real;
        theta = theta + h * omega;
    }

    const tabla = document.getElementById("tabla");
    if (tabla) tabla.textContent = filas.join("\n");

    if (chart1) chart1.destroy();
    if (chart2) chart2.destroy();
    if (chart3) chart3.destroy();

    const graf1 = document.getElementById("graf1") as HTMLCanvasElement | null;
    const graf2 = document.getElementById("graf2") as HTMLCanvasElement | null;
    const graf3 = document.getElementById("graf3") as HTMLCanvasElement | null;

    if (graf1) {
        chart1 = new Chart(graf1, {
            type: "line",
            data: {
                labels: t_arr,
                datasets: [{ label: "θ", data: theta_arr }]
            }
        });
    }

    if (graf2) {
        chart2 = new Chart(graf2, {
            type: "line",
            data: {
                labels: t_arr,
                datasets: [
                    { label: "Error Taylor", data: error_taylor_arr },
                    { label: "Error real", data: error_real_arr }
                ]
            }
        });
    }

    if (graf3) {
       const h_values = [0.1, 0.05, 0.01];
const errores: number[] = [];

// 🔥 solución de referencia (muy precisa)
function simularRef(hh: number): number[] {
    let th = theta0;
    let om = omega0;
    const arr: number[] = [];

    for (let t = 0; t <= t_total; t += hh) {
        arr.push(th);

        const seno = Math.sin(th);
        om = om - hh * (g / L) * seno;
        th = th + hh * om;
    }

    return arr;
}

// referencia con paso muy pequeño
const ref = simularRef(0.0005);

h_values.forEach(hh => {

    const aprox = simularRef(hh);

    // comparar último valor (misma idea numérica)
    const ref_final = ref[ref.length - 1];
    const aprox_final = aprox[aprox.length - 1];

    const error = Math.abs(ref_final - aprox_final);

    errores.push(error);
});
        

        chart3 = new Chart(graf3, {
            type: "line",
            data: {
                labels: h_values,
                datasets: [{ label: "Error vs h", data: errores }]
            }
        });
    }

   animarPendulo(theta_arr, h);
}

// ================= EVENTO BOTÓN =================
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnSimular");
    btn?.addEventListener("click", simular);
});