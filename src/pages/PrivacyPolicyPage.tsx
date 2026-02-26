import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <motion.div {...fadeUp}>
          <div className="text-center mb-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
              <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
            </motion.div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
              Privacy <span className="text-gradient-primary">Policy</span>
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6 text-sm leading-relaxed text-muted-foreground">
            {[
              {
                title: "Information We Collect",
                body: "We collect minimal information needed to operate the platform. This includes your email address when you create an account, anonymous device identifiers for vote tracking, and general usage data to improve our services.",
              },
              {
                title: "How We Use Your Information",
                body: "Your information is used solely to provide and improve DemandStage services, including tracking votes, preventing abuse, displaying aggregate results, and communicating platform updates. We never sell your personal data to third parties.",
              },
              {
                title: "Vote Data",
                body: "Votes are collected anonymously using device identifiers. Aggregate vote data (total counts per artist and city) is publicly displayed. Individual voting records are not publicly accessible.",
              },
              {
                title: "Cookies & Tracking",
                body: "We use essential cookies and local storage to maintain your session and remember your preferences. We do not use third-party advertising trackers.",
              },
              {
                title: "Data Security",
                body: "We implement industry-standard security measures to protect your data, including encrypted connections (HTTPS), secure database storage, and access controls. However, no system is 100% secure.",
              },
              {
                title: "Your Rights",
                body: "You can request access to, correction of, or deletion of your personal data at any time by contacting us at contact@demandstage.com. We will respond to valid requests within 30 days.",
              },
              {
                title: "Changes to This Policy",
                body: "We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email. Continued use of the platform constitutes acceptance of the updated policy.",
              },
            ].map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{section.title}</h2>
                <p>{section.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
