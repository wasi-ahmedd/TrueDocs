import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { GlobalAddCardDialog } from "@/components/GlobalAddCardDialog";
import { getIcon } from "@/lib/icon-map";
import { AddCardTypeDialog } from "@/components/AddCardTypeDialog";
import { useToast } from "@/hooks/use-toast";

type CardType = {
  id: number;
  slug: string;
  label: string;
  description: string;
  icon: string;
  color: string;
};

export default function CardsList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cardTypes, isLoading } = useQuery<CardType[]>({
    queryKey: ['cardTypes'],
    queryFn: async () => {
      const res = await fetch('/api/card-types');
      if (!res.ok) throw new Error('Failed to fetch types');
      return res.json();
    }
  });
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

  if (isLoading) return <div className="p-8">Loading types...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 mb-8 md:mb-12">
        <div className="flex items-center gap-4">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Card Types</h1>
            <p className="text-sm md:text-base text-muted-foreground">Select a document type</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <AddCardTypeDialog />
          <GlobalAddCardDialog />
        </div>
      </header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
      >
        {cardTypes?.map((type) => {
          const Icon = getIcon(type.icon);

          return (
            <Link key={type.slug} href={`/cards/${type.slug}`} className="block h-full group relative">
              <motion.div variants={item} className="h-full">
                <Card className={`h-full border-2 transition-all duration-300 hover:shadow-lg ${type.color || 'bg-card'} hover:-translate-y-1`}>
                  <CardContent className="p-8 flex items-center justify-between h-full relative">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8 opacity-80" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight">{type.label}</h3>
                        <p className="opacity-70 font-medium">{type.description || "View all records"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ChevronRight className="h-6 w-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

    </div>
  );
}
