document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initPhoto();
    initEditable();
    initContactForm();
    initReveal();

    document.getElementById("year").textContent = new Date().getFullYear();
});

function initMenu() {
    const btn = document.getElementById("menu-toggle");
    const nav = document.getElementById("nav");
    if (!btn || !nav) return;

    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", () => {
        const open = nav.classList.toggle("hidden");
        btn.setAttribute("aria-expanded", String(!open));
        btn.textContent = open ? "☰" : "×";
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.add("hidden");
            btn.setAttribute("aria-expanded", "false");
            btn.textContent = "☰";
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 760) {
            nav.classList.add("hidden");
            btn.setAttribute("aria-expanded", "false");
            btn.textContent = "☰";
        }
    });
}

function initPhoto() {
    const input = document.getElementById("photo-input");
    const img = document.getElementById("profile-photo");
    if (!input || !img) return;

    const saved = localStorage.getItem("portal-foto");
    if (saved) img.src = saved;

    input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            img.src = ev.target.result;
            localStorage.setItem("portal-foto", ev.target.result);
        };
        reader.readAsDataURL(file);
    });
}

function initEditable() {
    const fields = [
        "profile-name",
        "profile-tagline",
        "bio",
        "info-telefono",
        "info-correo",
        "info-ubicacion"
    ];

    fields.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        const saved = localStorage.getItem("portal-" + id);
        if (saved) el.textContent = saved;

        el.addEventListener("input", () => {
            localStorage.setItem("portal-" + id, el.textContent.trim());
        });

        el.addEventListener("blur", () => {
            if (el.textContent.trim() === "") {
                localStorage.removeItem("portal-" + id);
                el.textContent = el.dataset.fallback || "";
            }
        });
    });
}

function initContactForm() {
    const form = document.getElementById("form-contacto");
    if (!form) return;

    const nombre = document.getElementById("con-nombre");
    const contacto = document.getElementById("con-contacto");
    const mensaje = document.getElementById("con-mensaje");
    const honeypot = document.getElementById("empresa");
    const resultado = document.getElementById("con-resultado");

    const REGEX = {
        vacio: /^\s*$/,
        nombre: /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,60}$/,
        telefono: /^\d{4}-?\d{4}$/,
        email: /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/
    };

    function mostrarError(input, msg) {
        const campo = input.closest(".form-field");
        let err = campo.querySelector(".form-error");
        if (!err) {
            err = document.createElement("span");
            err.className = "form-error";
            campo.appendChild(err);
        }
        err.textContent = msg;
        input.classList.add("input-error");
    }

    function limpiarError(input) {
        const campo = input.closest(".form-field");
        const err = campo.querySelector(".form-error");
        if (err) err.remove();
        input.classList.remove("input-error");
    }

    [nombre, contacto, mensaje].forEach((input) => {
        input.addEventListener("input", () => limpiarError(input));
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (honeypot && honeypot.value.trim() !== "") return;

        let valido = true;
        let primerError = null;

        if (REGEX.vacio.test(nombre.value) || !REGEX.nombre.test(nombre.value.trim())) {
            mostrarError(nombre, "Escribe tu nombre completo (mínimo 3 letras).");
            valido = false;
            primerError = primerError || nombre;
        }

        const contactoVal = contacto.value.trim();
        if (contactoVal === "" || (!REGEX.telefono.test(contactoVal) && !REGEX.email.test(contactoVal))) {
            mostrarError(contacto, "Ingresa un teléfono (8 dígitos) o un correo válido.");
            valido = false;
            primerError = primerError || contacto;
        }

        if (REGEX.vacio.test(mensaje.value) || mensaje.value.trim().length < 10) {
            mostrarError(mensaje, "Cuéntame en qué te ayudamos (mínimo 10 caracteres).");
            valido = false;
            primerError = primerError || mensaje;
        }

        if (!valido) {
            if (primerError) primerError.focus();
            resultado.className = "form-submit-msg show fail";
            resultado.textContent = "Revisa los campos marcados en rojo antes de continuar.";
            return;
        }

        const telefono = document.getElementById("info-telefono").textContent.trim();
        const mensajeWsp =
            "Hola, vi tu portal personal:\n" +
            `Nombre: ${nombre.value.trim()}\n` +
            `Contacto: ${contactoVal}\n` +
            `Mensaje: ${mensaje.value.trim()}`;

        window.open(`https://wa.me/${telefono.replace(/\D/g, "")}?text=${encodeURIComponent(mensajeWsp)}`, "_blank", "noopener");
        resultado.className = "form-submit-msg show ok";
        resultado.textContent = "¡Listo! Se abrió WhatsApp con tu mensaje. Solo confirma el envío.";
        form.reset();
    });
}

function initReveal() {
    const els = document.querySelectorAll(".section, .hero-inner > *");
    els.forEach((el) => el.setAttribute("data-reveal", ""));

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    els.forEach((el) => obs.observe(el));
}
