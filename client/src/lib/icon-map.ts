import {
    Fingerprint,
    CreditCard,
    FileBadge,
    ShoppingBasket,
    GraduationCap,
    VenetianMask,
    Shield,
    FileText,
    Briefcase,
    Heart,
    Home,
    Car,
    Plane,
    Landmark,
    Building,
    User,
    Smartphone,
    Wifi,
    Zap,
    Star
} from "lucide-react";

export const IconMap: Record<string, any> = {
    Fingerprint,
    CreditCard,
    FileBadge,
    ShoppingBasket,
    GraduationCap,
    VenetianMask,
    Shield,
    FileText,
    Briefcase,
    Heart,
    Home,
    Car,
    Plane,
    Landmark,
    Building,
    User,
    Smartphone,
    Wifi,
    Zap,
    Star
};

export const getIcon = (name: string) => {
    return IconMap[name] || FileText;
};
