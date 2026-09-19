import type { Metadata } from "next";
import { NarrowContainer } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the Ster Schoonmaak website, accounts and service requests.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <Section>
      <NarrowContainer>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Ster Schoonmaak</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">Terms of Service</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">These terms explain the basic conditions for using the Ster Schoonmaak website and its account, contact, quotation and complaint features.</p>

        <div className="mt-12 space-y-10 text-base leading-8 text-muted">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Using the website</h2>
            <p className="mt-3">You may use the website for lawful purposes, to learn about Ster Schoonmaak, contact us, request services or quotations, manage an account, submit a complaint, or use available customer-support features.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Accounts</h2>
            <p className="mt-3">If you create or use an account, you are responsible for providing accurate information, keeping your sign-in details confidential and using the account only for yourself or an organisation you are authorised to represent. Do not attempt to access another person&apos;s account, bypass security or misrepresent your identity.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Service and quotation requests</h2>
            <p className="mt-3">Information on the website is general information about cleaning services. A request or quotation enquiry is not an accepted booking by itself. Any service scope, price, timing, access arrangements and other practical terms are confirmed separately with you.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Complaints and communications</h2>
            <p className="mt-3">Please provide clear and accurate information when submitting a complaint or contacting us. We use the details you provide to review the matter and communicate with you. We may send transactional confirmations or other service-related messages where applicable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Acceptable use</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Do not use the website for unlawful, fraudulent, abusive or harmful activity.</li>
              <li>Do not submit malicious code, spam, impersonation or content that infringes another person&apos;s rights.</li>
              <li>Do not interfere with the website, its authentication, APIs or connected services.</li>
              <li>Do not use automated access in a way that places unreasonable load on the website or backend services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Availability and third-party providers</h2>
            <p className="mt-3">We aim to keep the website useful and available, but access may occasionally be interrupted for maintenance, updates, security reasons or events outside our reasonable control. Authentication and some website functions depend on third-party providers, including Supabase, Google OAuth, Firebase Hosting, Cloudflare Worker services, email providers and WhatsApp. Those providers may have their own terms, policies and availability.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Limitation</h2>
            <p className="mt-3">To the extent permitted by applicable law, Ster Schoonmaak is not responsible for temporary unavailability, third-party service interruptions, information supplied by users, or indirect loss arising from use of the website. Nothing in these terms limits rights or responsibilities that cannot lawfully be excluded.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">Contact</h2>
            <p className="mt-3">For questions about these terms, contact <a className="font-semibold text-primary underline" href="mailto:info@sterschoonmaak.be">info@sterschoonmaak.be</a>.</p>
          </section>
        </div>
      </NarrowContainer>
    </Section>
  );
}
