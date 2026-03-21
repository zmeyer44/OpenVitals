import type { Metadata } from "next";
import { Nav } from "@/features/marketing/landing/sections/nav";
import { Footer } from "@/features/marketing/landing/sections/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | OpenVitals",
  description: "How OpenVitals collects, uses, and protects your personal and health data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Nav />
      <main className="mx-auto max-w-[720px] px-6 py-16">
        <p className="text-[11px] font-mono text-neutral-400 mb-2">
          Effective Date: March 1, 2026
        </p>
        <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] text-neutral-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-[15px] text-neutral-500 mb-10">
          Your privacy matters. This policy explains how OpenVitals handles your data.
        </p>

        <div className="prose-legal space-y-8">
          <Section title="1. Introduction">
            <p>
              OpenVitals (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the OpenVitals platform,
              a personal health data management service. This Privacy Policy describes how we collect, use,
              disclose, and protect your information when you use our website, applications, and services
              (collectively, the &quot;Service&quot;).
            </p>
            <p>
              By using the Service, you agree to the practices described in this Privacy Policy. If you do
              not agree, please do not use the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h4>Account Information</h4>
            <p>
              When you create an account, we collect your name, email address, and password. If you sign in
              through a third-party provider (e.g., Google), we receive your name and email from that provider.
            </p>

            <h4>Health Data</h4>
            <p>
              The core of our Service involves health data you provide, including lab results, vital signs,
              medication information, medical records, and data from connected wearable devices and health
              platforms. We treat all health data with the highest level of care.
            </p>

            <h4>Device and Integration Data</h4>
            <p>
              When you connect third-party services (such as Whoop, Fitbit, or other wearable devices), we
              receive health and fitness data from those services on your behalf. We store encrypted
              authentication tokens to maintain your connection and sync data.
            </p>

            <h4>Usage Data</h4>
            <p>
              We collect information about how you interact with the Service, including pages visited, features
              used, and general usage patterns. This helps us improve the platform.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use your information to:</p>
            <ul>
              <li>Provide, maintain, and improve the Service</li>
              <li>Parse, normalize, and display your health data</li>
              <li>Sync data from connected devices and integrations</li>
              <li>Generate AI-powered health insights (when you request them)</li>
              <li>Send service-related notifications</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal or health data to third parties. We do <strong>not</strong> use
              your health data for advertising purposes.
            </p>
          </Section>

          <Section title="4. Data Storage and Security">
            <p>
              Your health data is stored in encrypted databases. Authentication tokens for third-party
              integrations are encrypted at rest using AES-256-GCM. We use industry-standard security
              practices including TLS encryption in transit, regular security audits, and access controls.
            </p>
            <p>
              Despite our efforts, no method of electronic storage is 100% secure. We cannot guarantee
              absolute security but we strive to use commercially acceptable means to protect your data.
            </p>
          </Section>

          <Section title="5. Data Sharing">
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li>
                <strong>At your direction:</strong> When you use our sharing features to grant access to
                healthcare providers, family members, or others you designate.
              </li>
              <li>
                <strong>Service providers:</strong> With trusted vendors who help us operate the Service
                (e.g., cloud hosting, email delivery), under strict confidentiality agreements.
              </li>
              <li>
                <strong>Legal requirements:</strong> When required by law, subpoena, or valid legal process.
              </li>
              <li>
                <strong>Safety:</strong> To protect the rights, property, or safety of OpenVitals, our
                users, or the public.
              </li>
            </ul>
          </Section>

          <Section title="6. Third-Party Integrations">
            <p>
              When you connect third-party services, their own privacy policies govern their collection and
              use of your data. We encourage you to review the privacy policies of any service you connect.
              We only access the data you authorize through the scopes you approve during the connection
              process.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your account and health data for as long as your account is active. You may request
              deletion of your account and associated data at any time by contacting us. Upon account
              deletion, we will remove your personal and health data from our active systems within 30 days,
              though some data may persist in encrypted backups for up to 90 days.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing</li>
              <li>Object to certain processing activities</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <strong>privacy@openvitals.com</strong>.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              The Service is not intended for individuals under the age of 18. We do not knowingly collect
              data from children. If we learn that we have collected data from a child under 18, we will
              delete it promptly.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by posting the updated policy on the Service and updating the effective date. Your continued
              use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have questions about this Privacy Policy or our data practices, contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@openvitals.com
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-display text-[18px] font-semibold text-neutral-900 mb-3">
        {title}
      </h3>
      <div className="text-[14px] leading-relaxed text-neutral-600 space-y-3 [&_h4]:font-semibold [&_h4]:text-neutral-800 [&_h4]:text-[14px] [&_h4]:mt-4 [&_h4]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-neutral-800">
        {children}
      </div>
    </section>
  );
}
