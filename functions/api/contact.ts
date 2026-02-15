import { EmailMessage } from "cloudflare:email";

interface Env {
    CONTACT_EMAIL: {
        send: (message: EmailMessage) => Promise<void>;
    };
    CONTACT_FROM: string;
    CONTACT_TO: string;
}

function sanitize(value: FormDataEntryValue | null): string {
    return String(value ?? "").trim();
}

function esc(value: string): string {
    return value.replace(/[&<>"']/g, (ch) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return entities[ch] ?? ch;
    });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    const contactFrom = (env.CONTACT_FROM ?? "").trim();
    const contactTo = (env.CONTACT_TO ?? "").trim();

    if (!contactFrom || !contactTo) {
        return new Response("Email configuration missing", { status: 500 });
    }

    const formData = await request.formData();

    // Honeypot field to reduce bot submissions.
    const company = sanitize(formData.get("Company"));
    if (company) {
        return new Response("OK", { status: 200 });
    }

    const name = sanitize(formData.get("Name"));
    const email = sanitize(formData.get("Email"));
    const phone = sanitize(formData.get("Phone Number"));
    const subject = sanitize(formData.get("Subject"));
    const comment = sanitize(formData.get("Comment"));

    if (!name || !email || !phone || !subject || !comment) {
        return new Response("Missing required fields", { status: 400 });
    }

    const cleanSubject = subject.replace(/[\r\n]+/g, " ").slice(0, 150);
    const cleanEmail = email.replace(/[\r\n]+/g, " ");

    const textBody = `New website enquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\n\nComment:\n${comment}\n`;
    const htmlBody = `
      <h2>New website enquiry</h2>
      <p><strong>Name:</strong> ${esc(name)}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      <p><strong>Phone:</strong> ${esc(phone)}</p>
      <p><strong>Subject:</strong> ${esc(subject)}</p>
      <p><strong>Comment:</strong><br>${esc(comment).replace(/\n/g, "<br>")}</p>
    `;

    const boundary = "cf-boundary-" + crypto.randomUUID();
    const rawEmail =
        [
            "MIME-Version: 1.0",
            `From: Website Contact <${contactFrom}>`,
            `Reply-To: ${cleanEmail}`,
            `Subject: Website enquiry: ${cleanSubject}`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            "",
            `--${boundary}`,
            'Content-Type: text/plain; charset="UTF-8"',
            "",
            textBody,
            `--${boundary}`,
            'Content-Type: text/html; charset="UTF-8"',
            "",
            htmlBody,
            `--${boundary}--`,
            ""
        ].join("\r\n");

    const message = new EmailMessage(contactFrom, contactTo, rawEmail);
    await env.CONTACT_EMAIL.send(message);

    return Response.redirect(new URL("/?contact=sent", request.url), 303);
};
