import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <AlertTriangle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Disclaimer</h1>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">No Guarantee of Events</h2>
              <p>
                Voting on DemandStage does not guarantee that any event, concert, or performance will take place. The platform exists solely to collect and display public demand data. Event realization depends on artists, sponsors, promoters, and other stakeholders.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">No Payments</h2>
              <p>
                DemandStage is completely free to use. No payments, fees, or monetary transactions are involved in the voting process. We do not collect any financial information from voters.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">Data Usage</h2>
              <p>
                Vote data is publicly visible and may be used by sponsors, event organizers, and promoters to make business decisions. By casting a vote, you agree that your vote data (artist choice and city selection) will be publicly displayed in aggregate form.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">Accuracy</h2>
              <p>
                While we strive to maintain accurate vote counts, DemandStage makes no warranties about the completeness or accuracy of the data. Votes are tracked on a per-device/session basis and may not perfectly represent unique individual votes.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">No Affiliation</h2>
              <p>
                DemandStage is not affiliated with, endorsed by, or sponsored by any of the artists listed on the platform. Artist names are used solely for the purpose of public demand polling.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
