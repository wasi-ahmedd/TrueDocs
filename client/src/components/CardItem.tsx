import { Card as CardType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Trash2, ExternalLink } from "lucide-react";
import { useDeleteCard } from "@/hooks/use-cards";
import { Badge } from "@/components/ui/badge";

interface CardItemProps {
  card: CardType;
}

export function CardItem({ card }: CardItemProps) {
  const deleteCard = useDeleteCard();

  const handleOpenPdf = () => {
    // Open PDF in new tab
    window.open(`/pdfs/${card.type}/${card.filename}`, '_blank');
  };

  return (
    <Card className="group overflow-hidden border-l-4 border-l-primary/50 hover:border-l-primary transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold capitalize text-foreground">{card.type}</span>
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{card.filename.split('.').pop()}</Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{card.filename}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button variant="ghost" size="icon" onClick={handleOpenPdf} title="View PDF">
            <ExternalLink className="h-4 w-4 text-primary" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => deleteCard.mutate({ id: card.id, personId: card.personId })}
            disabled={deleteCard.isPending}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete Card"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
