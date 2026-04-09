// Importation de Framer Motion pour les animations au défilement
import { motion } from "framer-motion";
// Importation des icônes de contact (Envoi, Localisation, Téléphone, Mail)
import { Send, MapPin, Phone, Mail } from "lucide-react";
// Importation de l'outil React pour gérer l'état du formulaire
import { useState } from "react";

/**
 * Composant CONTACT SECTION.
 * Affiche les coordonnées d'Axis24 et un formulaire de contact lié à "Formspree"
 * pour recevoir les messages directement par email.
 */
const ContactSection = () => {
  // État pour savoir si le message a bien été envoyé
  const [submitted, setSubmitted] = useState(false);

  /**
   * Fonction de gestion de l'envoi du formulaire.
   * Elle envoie les données à l'API Formspree.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // URL unique Formspree pour la réception des mails
    const formspreeUrl = "https://formspree.io/f/mdawvwdb";

    const formData = new FormData(e.currentTarget);
    try {
      // Envoi de la requête POST au service externe
      await fetch(formspreeUrl, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      // On indique le succès à l'utilisateur
      setSubmitted(true);
      (e.target as HTMLFormElement).reset(); // On vide les champs du formulaire
      
      // On remet le bouton à l'état normal après 5 secondes
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Erreur d'envoi du formulaire :", error);
    }
  };

  return (
    <section id="contact" className="py-12">
      <div className="container mx-auto px-4">
        
        {/* --- EN-TÊTE DE LA SECTION --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-2">Restons en contact</p>
          <h2 className="section-heading text-foreground uppercase">Partenariat & Contact</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          
          {/* --- INFORMATIONS DE CONTACT (Partie Gauche) --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-2xl text-foreground tracking-wide mb-6 font-bold uppercase underline decoration-primary decoration-4 underline-offset-8">Siège Social</h3>
            <p className="text-muted-foreground leading-relaxed mb-8 italic">
              Que vous soyez annonceur, partenaire média ou simplement un auditeur fidèle, 
              nous sommes à votre entière écoute. N'hésitez pas à nous solliciter pour toute demande 
              de collaboration, de publicité ou d'information complémentaire.
            </p>

            {/* Liste des coordonnées avec icônes */}
            <div className="space-y-5">
              {[
                { icon: MapPin, text: "Ngaoundéré, Adamaoua, Cameroun" },
                { icon: Phone, text: "+237 690 164 060" },
                { icon: Mail, text: "axis24media.groupe@gmail.com" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4 text-foreground group">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-border/50">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <span className="font-medium tracking-wide">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* --- FORMULAIRE DE CONTACT (Partie Droite) --- */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="glass-card p-8 md:p-10 space-y-6 bg-white/5 backdrop-blur-xl border-white/10"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest pl-1">Votre Nom</label>
                <input
                  type="text"
                  name="nom"
                  required
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest pl-1">Votre Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
                  placeholder="ex: jean@domaine.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest pl-1">Sujet de votre demande</label>
              <select name="objet" className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all">
                <option>Partenariat Commercial</option>
                <option>Diffusion de Publicité</option>
                <option>Information de Presse</option>
                <option>Autre demande</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest pl-1">Message</label>
              <textarea
                name="message"
                required
                rows={4}
                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all resize-none"
                placeholder="Expliquez-nous comment nous pouvons vous aider..."
              />
            </div>

            {/* Bouton d'envoi dynamique */}
            <button
              type="submit"
              className="btn-primary-glow w-full h-14 flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-sm text-white"
            >
              {submitted ? "MESSAGE ENVOYÉ ✓" : <><Send size={18} /> ENVOYER LE MESSAGE</>}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
