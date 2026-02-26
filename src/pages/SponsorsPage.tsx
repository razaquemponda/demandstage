import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, BarChart3, Target, TrendingUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  { icon: BarChart3, title: "Data-Driven Decisions", desc: "Access real voting data showing which artists fans want, and where." },
  { icon: Target, title: "Targeted Sponsorship", desc: "Invest in events backed by proven public demand in specific cities." },
  { icon: TrendingUp, title: "Maximize ROI", desc: "Higher attendance and engagement when events match audience demand." },
];

export default function SponsorsPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Please fill in your name and email", variant: "destructive" });
      return;
    }
    // In production this would send to a backend
    setSent(true);
    toast({ title: "Message sent! We'll be in touch." });
  };

  return (
    <section className="container py-10 md:py-28 px-5">
      <div className="text-center mb-16">
        <Handshake className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">For Sponsors & Promoters</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          DemandStage gives you transparent, crowd-sourced data to plan events that people actually want to attend.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-card text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <b.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">{b.title}</h3>
            <p className="text-sm text-muted-foreground">{b.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="max-w-lg mx-auto">
        <h2 className="font-heading text-2xl font-bold text-center mb-6">Get in Touch</h2>
        {sent ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            <Send className="h-12 w-12 text-accent mx-auto mb-4" />
            <p className="font-heading text-xl font-semibold mb-2">Thank you!</p>
            <p className="text-muted-foreground">We'll get back to you shortly.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="bg-secondary border-border"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="bg-secondary border-border"
                maxLength={255}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Company</label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name"
                className="bg-secondary border-border"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your interest..."
                className="bg-secondary border-border min-h-[100px]"
                maxLength={1000}
              />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
              Send Message
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
