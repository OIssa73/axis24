import { motion } from "framer-motion";
import { Send, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-2">Contactez-nous</p>
          <h2 className="section-heading text-foreground">PARTENARIAT & CONTACT</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-2xl text-foreground tracking-wide mb-6">Restons en contact</h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Que vous soyez annonceur, partenaire média ou simplement un auditeur fidèle, 
              nous sommes à votre écoute. N'hésitez pas à nous contacter pour toute demande 
              de collaboration ou d'information.
            </p>

            <div className="space-y-4">
              {[
                { icon: MapPin, text: "Ngaoundéré, Cameroun" },
                { icon: Phone, text: "+237 690 164 060" },
                { icon: Mail, text: "AXIS24.Media@gmail.com" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="glass-card p-6 md:p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Nom complet</label>
                <input
                  type="text"
                  required
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Objet</label>
              <select className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>Partenariat</option>
                <option>Publicité</option>
                <option>Presse</option>
                <option>Autre</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Message</label>
              <textarea
                required
                rows={4}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Votre message..."
              />
            </div>
            <button
              type="submit"
              className="btn-primary-glow w-full flex items-center justify-center gap-2"
            >
              {submitted ? "Message envoyé ✓" : <><Send size={16} /> Envoyer</>}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
