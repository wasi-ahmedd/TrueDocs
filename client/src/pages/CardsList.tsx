import { Link } from "wouter";
import { CARD_TYPES } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CardsList() {
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
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  // Prettier names map
  const typeNames: Record<string, string> = {
    aadhaar: "Aadhaar Card",
    pan: "PAN Card",
    voterid: "Voter ID",
    ration: "Ration Card"
  };

  const typeColors: Record<string, string> = {
    aadhaar: "text-blue-600 bg-blue-50 border-blue-100",
    pan: "text-orange-600 bg-orange-50 border-orange-100",
    voterid: "text-purple-600 bg-purple-50 border-purple-100",
    ration: "text-green-600 bg-green-50 border-green-100",
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex items-center gap-4 mb-12">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Card Types</h1>
          <p className="text-muted-foreground">Select a document type to view records</p>
        </div>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
      >
        {CARD_TYPES.map((type) => (
          <Link key={type} href={`/cards/${type}`} className="block h-full group">
            <motion.div variants={item} className="h-full">
              <Card className={`h-full border-2 transition-all duration-300 hover:shadow-lg ${typeColors[type]} hover:border-current hover:-translate-y-1`}>
                <CardContent className="p-8 flex items-center justify-between h-full">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CreditCard className="h-8 w-8 opacity-80" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{typeNames[type]}</h3>
                      <p className="opacity-70 font-medium">View all records</p>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
