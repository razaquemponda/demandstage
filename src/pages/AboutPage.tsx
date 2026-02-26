import { motion } from "framer-motion";
import { Heart, Users, Mic2, Globe } from "lucide-react";

const values = [
  { icon: Users, title: "Fan-Powered", desc: "Every vote comes from a real person who wants to see their favorite artist perform." },
  { icon: Mic2, title: "Artist-Friendly", desc: "We help artists understand where their fanbase is strongest across Malawi." },
  { icon: Globe, title: "Transparent Data", desc: "All vote counts are public and transparent — no hidden agendas." },
  { icon: Heart, title: "Community First", desc: "DemandStage exists to connect Malawian communities with the music they love." },
];

export default function AboutPage() {
  return (
    <section className="container py-10 md:py-28 px-5">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">About DemandStage</h1>
          <p className="text-lg text-muted-foreground">
            DemandStage is a public voting platform built in Malawi, for Malawi. We believe the best events happen when the people have a say. By collecting transparent vote data on which artists fans want to see — and where — we bridge the gap between public demand, artists, and event organizers.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-card"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-card text-center">
          <h2 className="font-heading text-2xl font-bold mb-3">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6 mt-6">
            {[
              { step: "1", title: "Choose", desc: "Select your favorite artist and the city you want them in" },
              { step: "2", title: "Vote", desc: "Cast your vote — it's free and takes seconds" },
              { step: "3", title: "Impact", desc: "Your vote becomes visible data for sponsors and promoters" },
            ].map((s) => (
              <div key={s.step}>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full gradient-primary text-primary-foreground font-heading font-bold mb-3">
                  {s.step}
                </div>
                <h4 className="font-heading font-semibold mb-1">{s.title}</h4>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
