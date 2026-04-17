"use strict";
// ================= SENO TAYLOR =================
function senoTaylor(x, n) {
    let suma = 0;
    let termino = x;
    for (let i = 0; i < n; i++) {
        const signo = (i % 2 === 0) ? 1 : -1;
        suma += signo * termino;
        termino *= (x * x) / ((2 * i + 2) * (2 * i + 3));
    }
    return suma;
}
// ================= EVENTO =================
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnCalcular");
    btn === null || btn === void 0 ? void 0 : btn.addEventListener("click", () => {
        const angulo = parseFloat(document.getElementById("angulo").value);
        const n = parseInt(document.getElementById("n").value);
        const taylor = senoTaylor(angulo, n);
        const real = Math.sin(angulo);
        const error = Math.abs(real - taylor);
        document.getElementById("resultado").textContent =
            "Taylor: " + taylor.toFixed(6);
        document.getElementById("real").textContent =
            "Real: " + real.toFixed(6);
        document.getElementById("error").textContent =
            "Error: " + error.toFixed(6);
    });
});
