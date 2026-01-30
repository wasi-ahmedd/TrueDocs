import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCardSchema, type InsertCard } from "@shared/schema";
import { CARD_TYPES } from "@shared/routes";
import { useCreateCard } from "@/hooks/use-cards";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";

interface AddCardDialogProps {
  personId: number;
}

export function AddCardDialog({ personId }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const createCard = useCreateCard();
  
  const form = useForm<InsertCard>({
    resolver: zodResolver(insertCardSchema),
    defaultValues: {
      personId,
      type: "aadhaar",
      filename: "",
    },
  });

  const onSubmit = (data: InsertCard) => {
    createCard.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset({ personId, type: "aadhaar", filename: "" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-dashed">
          <Plus className="h-4 w-4" /> Add Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CARD_TYPES.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF Filename</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. document.pdf" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Ensure this file exists in the /pdfs directory
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createCard.isPending}>
                {createCard.isPending ? "Adding..." : "Add Card"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
