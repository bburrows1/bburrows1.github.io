import { EmailMessage } from "cloudflare:email";

interface Env {
    CONTACT_EMAIL: {
        send: (message: EmailMessage) => Promise<void>;
    };
    CONTACT_FROM: string;
    CONTACT_TO: string;
    CONTACT_SUCCESS_URL?: string;
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

function getMessageIdDomain(fromAddress: string): string {
    const domain = fromAddress.split("@")[1]?.trim().toLowerCase();
    return domain || "workers.dev";
}

function getSuccessUrl(request: Request, env: Env): URL {
    if (env.CONTACT_SUCCESS_URL) {
        try {
            return new URL(env.CONTACT_SUCCESS_URL);
        } catch {
            // Fall back to the request origin when CONTACT_SUCCESS_URL is invalid.
        }
    }

    return new URL("/?contact=sent", request.url);
}

async function handleContact(request: Request, env: Env): Promise<Response> {
    const contactFrom = sanitize(env.CONTACT_FROM);
    const contactTo = sanitize(env.CONTACT_TO);

    console.log("contact request", {
        method: request.method,
        url: request.url,
        contactFrom,
        contactTo
    });

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

    console.log("contact form payload", {
        Name: name,
        Email: email,
        "Phone Number": phone,
        Subject: subject,
        Comment: comment,
        Company: company
    });

    if (!name || !email || !phone || !subject || !comment) {
        return new Response("Missing required fields", { status: 400 });
    }

    const cleanSubject = subject.replace(/[\r\n]+/g, " ").slice(0, 150);
    const cleanEmail = email.replace(/[\r\n]+/g, " ");
    const messageId = `<${crypto.randomUUID()}@${getMessageIdDomain(contactFrom)}>`;
    const sentDate = new Date().toUTCString();

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
            `Date: ${sentDate}`,
            `Message-ID: ${messageId}`,
            `From: Website Contact <${contactFrom}>`,
            `To: ${contactTo}`,
            `Reply-To: ${cleanEmail}`,
            `Subject: Website enquiry: ${cleanSubject}`,
            `Content-Type: multipart/alternative; boundary=\"${boundary}\"`,
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
    try {
        await env.CONTACT_EMAIL.send(message);
    } catch (error) {
        console.error("send_email failed", error);
        return new Response(`send_email failed: ${String(error)}`, { status: 500 });
    }

    return Response.redirect(getSuccessUrl(request, env), 303);
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== "POST") {
            return new Response("Method not allowed", {
                status: 405,
                headers: {
                    Allow: "POST"
                }
            });
        }

        return handleContact(request, env);
    }
};
