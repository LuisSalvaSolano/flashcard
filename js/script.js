// =========================================
// VARIABLES GLOBALES
// =========================================
let cards = [];
let index = 0;
const APP_PASSWORD = ""; // <--- TU CONTRASEÑA

// Referencias del DOM
const loginContainer = document.getElementById("loginContainer");
const appContainer = document.getElementById("appContainer");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const passwordInput = document.getElementById("passwordInput");
const loginError = document.getElementById("loginError");
const themeToggleBtn = document.getElementById("themeToggle");

// =========================================
// 1. LÓGICA DE LOGIN
// =========================================

// Verificar login al cargar la página
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("userLoggedIn");
    if (isLoggedIn === "true") {
        showApp();
    } else {
        showLogin();
    }
}

function showApp() {
    loginContainer.classList.add("hidden");
    appContainer.classList.remove("hidden");
}

function showLogin() {
    loginContainer.classList.remove("hidden");
    appContainer.classList.add("hidden");
    passwordInput.value = "";
    loginError.style.display = "none";
}

loginBtn.addEventListener("click", () => {
    if (passwordInput.value === APP_PASSWORD) {
        localStorage.setItem("userLoggedIn", "true");
        showApp();
    } else {
        loginError.style.display = "block";
        passwordInput.style.borderColor = "var(--danger)";
        setTimeout(() => passwordInput.style.borderColor = "#ddd", 2000);
    }
});

passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") loginBtn.click();
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userLoggedIn");
    showLogin();
});

// =========================================
// 2. MODO OSCURO
// =========================================
themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggleBtn.textContent = document.body.classList.contains("dark") ? "Modo Claro" : "Modo Oscuro";
    localStorage.setItem("themeDark", document.body.classList.contains("dark"));
});

if (localStorage.getItem("themeDark") === "true") {
    document.body.classList.add("dark");
    themeToggleBtn.textContent = "Modo Claro";
}

// =========================================
// 3. LEER EXCEL
// =========================================
document.getElementById("excelFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        cards = [];

        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] !== undefined && rows[i][1] !== undefined) {
                cards.push({ pregunta: rows[i][0], respuesta: rows[i][1] });
            }
        }

        if (cards.length === 0) {
            alert("El archivo no tiene datos válidos.");
            return;
        }

        index = 0;
        updateCard();

    } catch (err) {
        alert("Error al leer el archivo.");
        console.error(err);
    }
});

// =========================================
// 4. FUNCIONES DE TARJETAS
// =========================================
function updateCard() {
    const counter = document.getElementById("counter");
    const frontText = document.getElementById("frontText");
    const backText = document.getElementById("backText");
    const cardInner = document.getElementById("cardInner");

    if (!cards || cards.length === 0) return;

    cardInner.classList.remove("flip");
    frontText.textContent = cards[index].pregunta;
    backText.textContent = cards[index].respuesta;
    counter.textContent = `${index + 1} / ${cards.length}`;
}

window.nextCard = function() {
    if (cards.length === 0) return;
    index = (index + 1) % cards.length;
    updateCard();
}

window.prevCard = function() {
    if (cards.length === 0) return;
    index = (index - 1 + cards.length) % cards.length;
    updateCard();
}

document.getElementById("flashcard").addEventListener("click", () => {
    if(cards.length > 0) {
        document.getElementById("cardInner").classList.toggle("flip");
    }
});

// =========================================
// 5. EVENTOS DE TECLADO (NUEVO)
// =========================================
document.addEventListener("keydown", (e) => {
    // Si no hay tarjetas o estamos en el login, no hacemos nada
    if (cards.length === 0 || !appContainer.classList.contains("hidden") === false) return;

    // Switch para detectar qué tecla se presionó
    switch(e.key) {
        case "ArrowRight": // Flecha Derecha
            nextCard();
            break;
            
        case "ArrowLeft":  // Flecha Izquierda
            prevCard();
            break;
            
        case " ":          // Barra Espaciadora
        case "Enter":      // Tecla Enter
        case "ArrowUp":    // Flecha Arriba (opcional)
        case "ArrowDown":  // Flecha Abajo (opcional)
            e.preventDefault(); // Evita que la página haga scroll al presionar espacio
            if(cards.length > 0) {
                document.getElementById("cardInner").classList.toggle("flip");
            }
            break;
    }
});

// Iniciar chequeo
checkLoginStatus();