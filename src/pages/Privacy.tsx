import { Layout } from '@/components/layout/Layout';

export default function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, including your email address, 
              profile information, and preferences. We also collect usage data to improve 
              our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve our services, personalize your 
              experience, communicate with you, and ensure the security of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal 
              information. However, no method of transmission over the Internet is 100% 
              secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with trusted 
              third-party service providers who assist in operating our platform, subject 
              to confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. 
              Contact us at privacy@hedge.ai to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
            <p>
              We use cookies and similar technologies to maintain your session and 
              improve your experience. You can control cookie settings through your browser.
            </p>
          </section>

          <p className="text-sm mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
