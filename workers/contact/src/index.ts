import { EmailMessage } from "cloudflare:email";

interface Env {
    CONTACT_EMAIL: {
        send: (message: EmailMessage) => Promise<void>;
    };
    CONTACT_FROM: string;
    CONTACT_TO: string;
    CONTACT_SUCCESS_URL?: string;
}

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 40;
const MAX_SUBJECT_LENGTH = 150;
const MAX_COMMENT_LENGTH = 4000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value: FormDataEntryValue | null): string {
    return String(value ?? "").trim();
}

function textResponse(message: string, status: number, headers: HeadersInit = {}): Response {
    return new Response(message, {
        status,
        headers: {
            "Cache-Control": "no-store",
            "Content-Type": "text/plain; charset=UTF-8",
            "X-Content-Type-Options": "nosniff",
            ...headers,
        },
    });
}

function noContentResponse(status = 204): Response {
    return new Response(null, {
        status,
        headers: {
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    });
}

function redirectSeeOther(url: URL): Response {
    return new Response(null, {
        status: 303,
        headers: {
            "Cache-Control": "no-store",
            Location: url.toString(),
            "X-Content-Type-Options": "nosniff",
        },
    });
}

function parseUrl(value: string | null): URL | null {
    if (!value) return null;
    try {
        return new URL(value);
    } catch {
        return null;
    }
}

function isTrustedOrigin(request: Request): boolean {
    const requestUrl = new URL(request.url);
    const origin = parseUrl(request.headers.get("Origin"));
    if (origin) {
        return origin.protocol === requestUrl.protocol && origin.host === requestUrl.host;
    }

    const referer = parseUrl(request.headers.get("Referer"));
    if (!referer) {
        // Allow clients that do not send Origin/Referer.
        return true;
    }

    return referer.protocol === requestUrl.protocol && referer.host === requestUrl.host;
}

function isSupportedFormContentType(contentType: string | null): boolean {
    if (!contentType) return false;
    const normalized = contentType.toLowerCase();
    return normalized.includes("application/x-www-form-urlencoded") || normalized.includes("multipart/form-data");
}

function esc(value: string): string {
    return value.replace(/[&<>"']/g, (ch) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[ch] ?? ch;
    });
}

function getMessageIdDomain(fromAddress: string): string {
    const domain = fromAddress.split("@")[1]?.trim().toLowerCase();
    return domain || "workers.dev";
}

function isValidEmailAddress(value: string): boolean {
    return value.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(value);
}

function sanitizeSingleLine(value: FormDataEntryValue | null, maxLength: number): string {
    return sanitize(value)
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, maxLength)
        .trim();
}

function sanitizeMultiline(value: FormDataEntryValue | null, maxLength: number): string {
    return sanitize(value)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[^\S\n]+/g, " ")
        .slice(0, maxLength)
        .trim();
}

function looksLikePhoneNumber(value: string): boolean {
    if (value.length > MAX_PHONE_LENGTH) return false;
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
}

function formatReplyToHeader(name: string, email: string): string {
    const safeName = name.replace(/["\\]/g, "\\$&");
    return `"${safeName}" <${email}>`;
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

    if (!contactFrom || !contactTo || !isValidEmailAddress(contactFrom) || !isValidEmailAddress(contactTo)) {
        return textResponse("Email configuration missing", 500);
    }

    if (!isTrustedOrigin(request)) {
        return textResponse("Forbidden", 403);
    }

    if (!isSupportedFormContentType(request.headers.get("Content-Type"))) {
        return textResponse("Unsupported content type", 415);
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return textResponse("Invalid form payload", 400);
    }

    // Honeypot field to reduce bot submissions.
    const company = sanitizeSingleLine(formData.get("Company"), 100);
    if (company) {
        return noContentResponse();
    }

    const name = sanitizeSingleLine(formData.get("Name"), MAX_NAME_LENGTH);
    const email = sanitizeSingleLine(formData.get("Email"), MAX_EMAIL_LENGTH);
    const phone = sanitizeSingleLine(formData.get("Phone Number"), MAX_PHONE_LENGTH);
    const subject = sanitizeSingleLine(formData.get("Subject"), MAX_SUBJECT_LENGTH);
    const comment = sanitizeMultiline(formData.get("Comment"), MAX_COMMENT_LENGTH);

    if (!name || !email || !phone || !subject || !comment) {
        return textResponse("Missing required fields", 400);
    }

    if (!isValidEmailAddress(email)) {
        return textResponse("Invalid email address", 400);
    }

    if (!looksLikePhoneNumber(phone)) {
        return textResponse("Invalid phone number", 400);
    }

    const cleanSubject = subject.replace(/[\r\n]+/g, " ").slice(0, MAX_SUBJECT_LENGTH);
    const subjectWithName = `Website enquiry: ${cleanSubject} - ${name}`.slice(0, MAX_SUBJECT_LENGTH);
    const cleanEmail = email.replace(/[\r\n]+/g, " ");
    const replyTo = formatReplyToHeader(name, cleanEmail);
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
    const rawEmail = [
        "MIME-Version: 1.0",
        `Date: ${sentDate}`,
        `Message-ID: ${messageId}`,
        `From: Diggers4U Enquiries <${contactFrom}>`,
        `To: ${contactTo}`,
        `Reply-To: ${replyTo}`,
        `Subject: ${subjectWithName}`,
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
        "",
    ].join("\r\n");

    const message = new EmailMessage(contactFrom, contactTo, rawEmail);
    try {
        await env.CONTACT_EMAIL.send(message);
    } catch (error) {
        console.error("send_email failed", error);
        return textResponse("Unable to send message right now", 502);
    }

    return redirectSeeOther(getSuccessUrl(request, env));
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== "POST") {
            return textResponse("Method not allowed", 405, {
                Allow: "POST",
            });
        }

        return handleContact(request, env);
    },
};
