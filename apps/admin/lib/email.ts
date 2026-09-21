import "server-only"
import { Resend } from "resend"

// Same sender identity as Supabase Auth's SMTP relay (supabase/config.toml
// [auth.email.smtp]) — one recognizable "from" across OTP emails and these
// transactional ones.
const FROM = "Berare <no-reply@mail.berarecosmetics.in>"

let client: Resend | null = null
function getClient() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

// Throws on failure — callers that need the DB state and the notification
// to succeed or fail together (e.g. affiliate approval/rejection) await
// this and roll back their own change on a thrown error.
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const { error } = await getClient().emails.send({ from: FROM, to, subject, html })
  if (error) {
    throw new Error(error.message)
  }
}
