import { Link } from "wouter";
import { Users, CreditCard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full z-10 space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Govt Cards <span className="text-primary">Organiser</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Securely manage and access your essential government identification documents in one organized place.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
        >
          <Link href="/people" className="group block">
            <motion.div variants={item} className="h-full bg-card hover:bg-accent/5 border border-border rounded-3xl p-8 md:p-12 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center gap-6 group">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">Browse by People</h2>
                <p className="text-muted-foreground">View documents organized by family member or individual.</p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                View People <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </motion.div>
          </Link>

          <Link href="/cards" className="group block">
            <motion.div variants={item} className="h-full bg-card hover:bg-accent/5 border border-border rounded-3xl p-8 md:p-12 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center gap-6 group">
              <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold group-hover:text-accent transition-colors">Browse by Cards</h2>
                <p className="text-muted-foreground">Filter documents by type like Aadhaar, PAN, or Voter ID.</p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                View Card Types <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      <div className="fixed bottom-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Government Document Management System
      </div>
    </div>
  );
}
