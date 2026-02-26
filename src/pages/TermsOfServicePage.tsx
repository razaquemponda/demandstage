import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function TermsOfServicePage() {
  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <motion.div {...fadeUp}>
          <div className="text-center mb-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            </motion.div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
              Terms of <span className="text-gradient-primary">Service</span>
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6 text-sm leading-relaxed text-muted-foreground">
            {[
              {
                title: "Acceptance of Terms",
                body: "By accessing or using DemandStage, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.",
              },
              {
                title: "Use of the Platform",
                body: "DemandStage is a free platform for expressing public demand for live music events. You may use the platform to vote for artists in your preferred cities. You agree not to manipulate votes, use automated tools, or engage in any activity that undermines the integrity of the voting system.",
              },
              {
                title: "Account Responsibility",
                body: "If you create an account, you are responsible for maintaining the security of your credentials. You must provide accurate information and promptly update any changes. We reserve the right to suspend accounts that violate these terms.",
              },
              {
                title: "No Guarantee of Events",
                body: "Voting on DemandStage does not guarantee that any event will be organized. Events depend on artists, sponsors, promoters, and other stakeholders. DemandStage serves solely as a demand-signaling platform.",
              },
              {
                title: "Intellectual Property",
                body: "All content, design, and code on DemandStage are owned by DemandStage or its licensors. Artist names and images are used for demand-polling purposes only and remain the property of their respective owners.",
              },
              {
                title: "Limitation of Liability",
                body: "DemandStage is provided 'as is' without warranties of any kind. We are not liable for any damages arising from your use of the platform, including loss of data, business interruption, or reliance on vote data.",
              },
              {
                title: "Modifications",
                body: "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance. Material changes will be communicated to registered users.",
              },
              {
                title: "Contact",
                body: "For questions about these terms, contact us at contact@demandstage.com.",
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
