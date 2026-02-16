import { initContactForm } from "./contact-form";

function initMobileMenu(): void {
    const nav = document.querySelector<HTMLElement>(".top-nav");
    const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");

    if (!nav || !toggle) {
        return;
    }

    const links = nav.querySelectorAll<HTMLAnchorElement>(".nav-links a");

    const closeMenu = () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        nav.classList.toggle("is-open", !expanded);
        toggle.setAttribute("aria-expanded", String(!expanded));
    });

    links.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }

        if (nav.contains(target)) {
            return;
        }

        closeMenu();
    });
}

function initRevealAnimation(): void {
    const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (!revealElements.length) {
        return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            });
        },
        {
            threshold: 0.2,
            rootMargin: "0px 0px -30px 0px",
        }
    );

    revealElements.forEach((element) => {
        observer.observe(element);
    });
}

initMobileMenu();
initRevealAnimation();
initContactForm();
