import { Fingerprint, CreditCard, FileBadge, ShoppingBasket, GraduationCap } from "lucide-react";

export const CARD_CONFIG: Record<string, { icon: any, label: string, desc: string, color: string }> = {
    aadhaar: {
        icon: Fingerprint,
        label: "Aadhaar Card",
        desc: "Biometric identity proof",
        color: "text-orange-500 bg-orange-500/10"
    },
    pan: {
        icon: CreditCard,
        label: "PAN Card",
        desc: "Tax identification",
        color: "text-blue-500 bg-blue-500/10"
    },
    voterid: {
        icon: FileBadge,
        label: "Voter ID",
        desc: "Election commission ID",
        color: "text-green-500 bg-green-500/10"
    },
    ration: {
        icon: ShoppingBasket,
        label: "Ration Card",
        desc: "Essential commodities",
        color: "text-yellow-500 bg-yellow-500/10"
    },
    marks: {
        icon: GraduationCap,
        label: "Marks Card",
        desc: "Academic Records",
        color: "text-pink-500 bg-pink-500/10"
    }
};
