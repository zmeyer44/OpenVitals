import type { Metadata } from "next";
import { Nav } from "@/features/marketing/landing/sections/nav";
import { Footer } from "@/features/marketing/landing/sections/footer";

export const metadata: Metadata = {
  title: "Terms of Service | OpenVitals",
  description: "Terms and conditions for using the OpenVitals platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Nav />
      <main className="mx-auto max-w-[720px] px-6 py-16">
        <p className="text-[11px] font-mono text-neutral-400 mb-2">
          Effective Date: March 1, 2026
        </p>
        <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] text-neutral-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-[15px] text-neutral-500 mb-10">
          Please read these terms carefully before using OpenVitals.
        </p>

        <div className="prose-legal space-y-8">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using the OpenVitals platform (&quot;Service&quot;), you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Service.
              These Terms constitute a legally binding agreement between you and OpenVitals
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              OpenVitals is a personal health data management platform that allows you to upload, store,
              organize, and visualize your health records, lab results, vital signs, and medication
              information. The Service also supports integrations with third-party wearable devices
              and health platforms, and offers AI-powered analysis features.
            </p>
          </Section>

          <Section title="3. Eligibility">
            <p>
              You must be at least 18 years of age to use the Service. By using the Service, you represent
              and warrant that you meet this age requirement and have the legal capacity to enter into
              these Terms.
            </p>
          </Section>

          <Section title="4. Account Registration">
            <p>
              To use the Service, you must create an account with accurate and complete information. You are
              responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You agree to notify us immediately of any
              unauthorized access to your account.
            </p>
          </Section>

          <Section title="5. Your Data">
            <h4>Ownership</h4>
            <p>
              You retain full ownership of all health data, records, and content you upload or generate
              through the Service (&quot;Your Data&quot;). We do not claim any ownership rights over Your Data.
            </p>

            <h4>License to Us</h4>
            <p>
              You grant us a limited, non-exclusive license to store, process, and display Your Data solely
              to provide the Service to you. This includes parsing documents, normalizing lab values,
              generating visualizations, and providing AI-powered insights at your request.
            </p>

            <h4>Data Portability</h4>
            <p>
              You may export Your Data at any time. We support standard data formats to ensure you are
              never locked in to our platform.
            </p>
          </Section>

          <Section title="6. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Upload malicious files, viruses, or harmful code</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts or data</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Use the Service to store data that is not your own without proper authorization</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of the Service
                (except as permitted by applicable open-source licenses)</li>
              <li>Use automated systems to scrape or extract data from the Service beyond what our
                API permits</li>
            </ul>
          </Section>

          <Section title="7. Third-Party Integrations">
            <p>
              The Service allows you to connect third-party devices and platforms (e.g., Whoop, Fitbit,
              Apple Health). Your use of third-party services is governed by their respective terms and
              privacy policies. We are not responsible for the availability, accuracy, or practices of
              third-party services.
            </p>
            <p>
              You may disconnect any third-party integration at any time through the Service. Upon
              disconnection, we will cease syncing data from that service but previously imported data
              will remain in your account unless you delete it.
            </p>
          </Section>

          <Section title="8. AI Features">
            <p>
              The Service includes AI-powered features that analyze your health data and provide insights.
              These features are for informational purposes only and should <strong>not</strong> be
              considered medical advice. AI-generated content may contain errors or inaccuracies.
            </p>
            <p>
              <strong>OpenVitals is not a medical device and is not intended to diagnose, treat, cure,
              or prevent any disease or health condition.</strong> Always consult qualified healthcare
              professionals for medical decisions.
            </p>
          </Section>

          <Section title="9. Not Medical Advice">
            <p>
              The Service is a data management tool. Nothing in the Service constitutes medical advice,
              diagnosis, or treatment recommendations. The display of reference ranges, trends, and
              AI-generated insights is for your personal informational use only.
            </p>
            <p>
              You should not rely on the Service as a substitute for professional medical judgment.
              Always seek the advice of your physician or other qualified health provider with any
              questions you may have regarding a medical condition.
            </p>
          </Section>

          <Section title="10. Sharing Features">
            <p>
              The Service allows you to share your health data with others through access grants and
              share links. You are solely responsible for determining what data to share and with whom.
              Once you share data, the recipient may view or copy it. We are not liable for any
              consequences of your sharing decisions.
            </p>
          </Section>

          <Section title="11. Intellectual Property">
            <p>
              The Service, including its design, code, features, and documentation, is the intellectual
              property of OpenVitals (subject to any applicable open-source licenses). You may not copy,
              modify, or distribute the Service except as expressly permitted.
            </p>
          </Section>

          <Section title="12. Service Availability">
            <p>
              We strive to maintain the Service&apos;s availability but do not guarantee uninterrupted
              access. The Service may be temporarily unavailable due to maintenance, updates, or
              circumstances beyond our control. We are not liable for any downtime or data access delays.
            </p>
          </Section>

          <Section title="13. Termination">
            <p>
              You may close your account at any time. We may suspend or terminate your access if you
              violate these Terms or engage in activity that harms the Service or other users. Upon
              termination, your right to use the Service ceases. We will retain or delete Your Data in
              accordance with our Privacy Policy.
            </p>
          </Section>

          <Section title="14. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, OpenVitals and its officers, employees, and agents
              shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of data, loss of profits, or personal injury, arising from
              your use of or inability to use the Service.
            </p>
            <p>
              Our total liability to you for all claims arising from or related to the Service shall not
              exceed the amount you paid us in the twelve (12) months preceding the claim, or $100,
              whichever is greater.
            </p>
          </Section>

          <Section title="15. Disclaimer of Warranties">
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              whether express, implied, or statutory. We disclaim all warranties, including but not limited
              to warranties of merchantability, fitness for a particular purpose, accuracy, and
              non-infringement.
            </p>
          </Section>

          <Section title="16. Indemnification">
            <p>
              You agree to indemnify and hold harmless OpenVitals, its officers, employees, and agents from
              any claims, damages, losses, or expenses (including reasonable legal fees) arising from your
              use of the Service, your violation of these Terms, or your violation of any rights of another.
            </p>
          </Section>

          <Section title="17. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify you of material changes by
              posting the updated Terms on the Service and updating the effective date. Your continued use
              of the Service after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="18. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of
              Delaware, without regard to its conflict of law provisions. Any disputes arising under these
              Terms shall be resolved in the state or federal courts located in Delaware.
            </p>
          </Section>

          <Section title="19. Contact Us">
            <p>
              If you have questions about these Terms, contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@openvitals.com
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
