// ================= SENO TAYLOR =================
function senoTaylor(x: number, n: number): number {
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

    btn?.addEventListener("click", () => {

        const angulo = parseFloat((document.getElementById("angulo") as HTMLInputElement).value);
        const n = parseInt((document.getElementById("n") as HTMLInputElement).value);

        const taylor = senoTaylor(angulo, n);
        const real = Math.sin(angulo);
        const error = Math.abs(real - taylor);

        (document.getElementById("resultado") as HTMLElement).textContent =
            "Taylor: " + taylor.toFixed(6);

        (document.getElementById("real") as HTMLElement).textContent =
            "Real: " + real.toFixed(6);

        (document.getElementById("error") as HTMLElement).textContent =
            "Error: " + error.toFixed(6);
    });
});