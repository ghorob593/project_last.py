document.addEventListener("DOMContentLoaded", () => {
    const PROFILE_KEY = "volt-profile";
    const modal = document.getElementById("profile-modal");
    const form = document.getElementById("profile-form");
    const status = document.getElementById("profile-status");
    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const accountButtons = document.querySelectorAll(".account-button");
    const closeButtons = document.querySelectorAll("[data-profile-close]");

    if (!modal || !form) return;

    function loadProfile() {
        try {
            const saved = localStorage.getItem(PROFILE_KEY);
            return saved ? JSON.parse(saved) : { name: "", email: "" };
        } catch (error) {
            console.error("Не вдалося завантажити профіль:", error);
            return { name: "", email: "" };
        }
    }

    function fillForm() {
        const profile = loadProfile();
        nameInput.value = profile.name || "";
        emailInput.value = profile.email || "";
        status.textContent = profile.name ? `Збережено для ${profile.name}` : "";
    }

    function openProfile() {
        fillForm();
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("profile-modal-open");
        nameInput.focus();
    }

    function closeProfile() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("profile-modal-open");
    }

    accountButtons.forEach((button) => {
        button.addEventListener("click", openProfile);
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeProfile);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeProfile();
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const profile = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim()
        };

        if (!profile.name || !profile.email) {
            status.textContent = "Заповніть ім'я та Email.";
            return;
        }

        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        status.textContent = "Профіль збережено.";
    });
});
