import type { Metadata } from "next";
import { NarrowContainer } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ster Schoonmaak handles website, account, complaint and support information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <Section>
      <NarrowContainer>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Ster Schoonmaak</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">Privacy Policy</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          This policy explains how Ster Schoonmaak handles information when you use our website, contact us, request a quotation, submit a complaint, use an account or interact with customer support.
        </p>

        <div className="mt-12 space-y-10 text-base leading-8 text-muted">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Information we receive</h2>
            <p className="mt-3">Depending on how you use the website, you may choose to provide your name, email address, phone number, request details, complaint subject and message, account information, and other information you include in a conversation with us.</p>
            <p className="mt-3">The website supports email/password authentication through Supabase Auth and Google Sign-In through Google OAuth and Supabase. An account may include basic identity information such as your name and email address.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">How we use information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>To respond to contact, service and quotation requests.</li>
              <li>To receive, track and follow up on customer complaints.</li>
              <li>To authenticate accounts, identify account users and provide account-related features.</li>
              <li>To send transactional messages, including complaint confirmations or authentication-related emails, where applicable.</li>
              <li>To provide customer-support and chatbot interactions when you choose to use them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Google Sign-In</h2>
            <p className="mt-3">For Google Sign-In, we use only the identity information required for authentication and account identification, such as your name, email address and profile information supplied by Google. Google Sign-In is not used to access Gmail, Google Drive, contacts, calendar data or other Google services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Services we use</h2>
            <p className="mt-3">The website is hosted on Firebase Hosting. Supabase is used for authentication and, where applicable, database and storage services. Cloudflare Worker services are used for secure backend and API processing. Resend is used for complaint-related and authentication-related outgoing transactional email where configured and applicable.</p>
            <p className="mt-3">If you choose a WhatsApp handoff from customer support, the information you send is transferred to WhatsApp so that you can continue that conversation there. WhatsApp then handles that interaction under its own terms and privacy policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Chatbot and customer support</h2>
            <p className="mt-3">Chatbot messages, support choices and any contact details you voluntarily submit are used to answer your request and, where relevant, help our team follow up. Please avoid sending sensitive information that is not needed for your request.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Security, retention and your choices</h2>
            <p className="mt-3">We use reasonable technical and organisational measures appropriate to the website and the services involved. Information is kept only for as long as needed for the relevant account, request, complaint, communication or legal and operational purpose. You can contact us to ask about information connected with your interaction with Ster Schoonmaak or to request correction where appropriate under applicable law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Contact</h2>
            <p className="mt-3">For privacy questions, contact <a className="font-semibold text-primary underline" href="mailto:info@sterschoonmaak.be">info@sterschoonmaak.be</a>.</p>
            <p className="mt-3">Website: <a className="font-semibold text-primary underline" href="https://sterschoonmaak.be">https://sterschoonmaak.be</a></p>
          </section>
        </div>
      </NarrowContainer>
    </Section>
  );
}
