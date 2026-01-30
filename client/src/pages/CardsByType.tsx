import { useRoute, Link } from "wouter";
import { useCardsByType } from "@/hooks/use-cards";
import { CardItem } from "@/components/CardItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CardsByType() {
  const [, params] = useRoute("/cards/:type");
  const type = params?.type || "";
  const { data: people, isLoading, error } = useCardsByType(type);

  // Helper for nice display names
  const displayType = type.charAt(0).toUpperCase() + type.slice(1);

  if (isLoading) return <CardsSkeleton />;
  if (error) return <div className="p-8 text-center text-destructive">Failed to load cards.</div>;

  // Flatten the data to list cards but grouped by person context visually
  const hasCards = people && people.length > 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/cards">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight capitalize flex items-center gap-3">
              {displayType} Records
              <Badge variant="secondary" className="text-base px-3 py-1 font-normal">
                {people?.reduce((acc, p) => acc + p.cards.length, 0)} Total
              </Badge>
            </h1>
          </div>
        </div>
      </header>

      {!hasCards ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No {displayType} cards found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            Go to a person's profile to add their {displayType} card.
          </p>
          <Link href="/people" className="mt-6 inline-block">
            <Button>Go to People</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {people.map((person) => (
            <motion.div 
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/40">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <Link href={`/people/${person.id}`} className="hover:underline decoration-primary decoration-2 underline-offset-4">
                  <h3 className="font-semibold text-lg">{person.name}</h3>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {person.cards.map((card) => (
                  <CardItem key={card.id} card={card} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="min-h-screen bg-background p-8 max-w-5xl mx-auto space-y-8">
      <Skeleton className="h-10 w-64" />
      {[1, 2].map((i) => (
        <div key={i} className="border rounded-2xl p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
