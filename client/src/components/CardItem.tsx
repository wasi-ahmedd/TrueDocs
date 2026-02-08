import { Card as CardType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Trash2, ExternalLink } from "lucide-react";
import { useDeleteCard } from "@/hooks/use-cards";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

import { useLocation } from "wouter";

import { CARD_CONFIG } from "@/lib/card-config";

interface CardItemProps {
  card: CardType;
}

export function CardItem({ card }: CardItemProps) {
  const deleteCard = useDeleteCard();
  const [, setLocation] = useLocation();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleOpenPdf = () => {
    setLocation(`/view/${card.id}`);
  };

  const config = CARD_CONFIG[card.type] || {
    icon: FileText,
    label: card.type,
    desc: "",
    color: "text-primary bg-primary/10"
  };
  const Icon = config.icon;

  return (
    <Card className="group overflow-hidden border-l-4 border-l-primary transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold capitalize text-foreground">
                {card.title || config.label}
              </span>
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{card.filename.split('.').pop()}</Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {card.title ? config.label : card.filename}
            </p>
          </div>
        </div>

        {/* Desktop Actions (Hover) */}
        <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button variant="ghost" size="icon" onClick={handleOpenPdf} title="View PDF">
            <ExternalLink className="h-4 w-4 text-primary" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={deleteCard.isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Delete Card"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Card</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this card? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteCard.mutate({ id: card.id, personId: card.personId })}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Mobile Actions (Dropdown) */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenPdf}>
                <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                Open PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setShowDeleteAlert(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Card</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this card? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteCard.mutate({ id: card.id, personId: card.personId })}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card >
  );
}
