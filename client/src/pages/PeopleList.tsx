import { Link } from "wouter";
import { usePeople, useDeletePerson } from "@/hooks/use-people";
import { CreatePersonDialog } from "@/components/CreatePersonDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, CreditCard, ChevronRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PeopleList() {
  const { data: people, isLoading, error } = usePeople();
  const deletePerson = useDeletePerson();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) return <PeopleSkeleton />;
  if (error) return <div className="p-8 text-center text-destructive">Failed to load people. Please try again.</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8 md:mb-12">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">People</h1>
            <p className="text-muted-foreground">Manage individuals and their documents</p>
          </div>
        </div>
        <CreatePersonDialog />
      </header>

      {people && people.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
          <div className="bg-background rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No people added yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">Start by adding a family member or individual to manage their documents.</p>
          <CreatePersonDialog />
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {people?.map((person) => (
            <motion.div key={person.id} variants={item}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 border border-border/60 hover:border-primary/50 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete <strong>{person.name}</strong> and remove all their associated cards.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deletePerson.mutate(person.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <Link href={`/people/${person.id}`} className="block h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{person.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: #{person.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium text-foreground">{person.cards.length}</span>
                        <span>Cards stored</span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <ChevronRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function PeopleSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
