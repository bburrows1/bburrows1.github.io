function sanitizeStatusClassName(state: string | undefined): string | null {
    if (!state) {
        return null;
    }

    return `contact-status--${state}`;
}

export function initContactForm(): void {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-status");
    const submit = document.getElementById("contact-submit");
    const submitText = document.getElementById("contact-submit-text");
    const resetButton = document.getElementById("contact-reset");

    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    if (!(status instanceof HTMLParagraphElement)) {
        return;
    }

    if (!(submit instanceof HTMLButtonElement)) {
        return;
    }

    if (!(submitText instanceof HTMLSpanElement)) {
        return;
    }

    if (!(resetButton instanceof HTMLButtonElement)) {
        return;
    }

    const editableFields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "input:not([name='Company']), textarea"
    );
    const firstInput = form.querySelector<HTMLInputElement>("input[name='Name']");

    let isSending = false;
    let awaitingManualReset = false;

    const setStatus = (message: string, state?: string) => {
        status.textContent = message;
        status.className = "contact-status";

        const stateClassName = sanitizeStatusClassName(state);
        if (stateClassName) {
            status.classList.add(stateClassName);
        }
    };

    const setEditable = (enabled: boolean) => {
        editableFields.forEach((field) => {
            field.disabled = !enabled;
        });
    };

    const syncSubmitState = () => {
        form.classList.toggle("is-sending", isSending);

        if (isSending) {
            submitText.textContent = "Sending enquiry...";
        } else if (awaitingManualReset) {
            submitText.textContent = "Enquiry sent";
        } else {
            submitText.textContent = "Send enquiry";
        }

        submit.disabled = isSending || awaitingManualReset;
        resetButton.hidden = !awaitingManualReset;
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isSending || awaitingManualReset) {
            return;
        }

        const formData = new FormData(form);

        isSending = true;
        setEditable(false);
        syncSubmitState();
        setStatus("Sending your enquiry now. Please wait...", "sending");

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            awaitingManualReset = true;
            setStatus('Enquiry sent. Click "Send another enquiry" when you are ready to submit again.', "success");
        } catch {
            setEditable(true);
            setStatus("Sorry, there was a problem sending your enquiry. Please try again.", "error");
        } finally {
            isSending = false;
            setEditable(!awaitingManualReset);
            syncSubmitState();
        }
    });

    resetButton.addEventListener("click", () => {
        if (!awaitingManualReset || isSending) {
            return;
        }

        form.reset();
        awaitingManualReset = false;
        setEditable(true);
        syncSubmitState();
        setStatus("Form reset. You can send another enquiry when ready.", "ready");

        if (firstInput) {
            firstInput.focus();
        }
    });
}
