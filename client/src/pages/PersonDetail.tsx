import { useRoute, Link } from "wouter";
import { usePerson } from "@/hooks/use-people";
import { AddCardDialog } from "@/components/AddCardDialog";
import { CardItem } from "@/components/CardItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function PersonDetail() {
  const [, params] = useRoute("/people/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: person, isLoading, error } = usePerson(id);

  if (isLoading) return <DetailSkeleton />;
  if (error || !person) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h2 className="text-2xl font-bold">Person Not Found</h2>
      <Link href="/people"><Button>Go Back</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-5xl mx-auto">
      <Link href="/people" className="inline-block mb-6">
        <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to People
        </Button>
      </Link>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-lg">
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{person.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full w-fit">
                <User className="h-3 w-3" />
                <span className="text-xs font-medium">ID: #{person.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border shadow-sm">
             <div className="text-center px-4 border-r border-border">
                <div className="text-2xl font-bold text-primary">{person.cards.length}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Cards</div>
             </div>
             <div className="pl-2">
               <AddCardDialog personId={person.id} />
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          Documents & Cards
        </h2>

        {person.cards.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
            <p className="text-muted-foreground mb-4">No cards found for this person.</p>
            <AddCardDialog personId={person.id} />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {person.cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CardItem card={card} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background p-8 max-w-5xl mx-auto space-y-8">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}
