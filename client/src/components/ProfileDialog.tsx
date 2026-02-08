import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, CreditCard, ShieldAlert, BadgeInfo, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function ProfileDialog() {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch card count
    const { data: cards } = useQuery({
        queryKey: ["/api/cards"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/cards");
            return await res.json();
        }
    });

    const handleDeleteAccount = async () => {
        if (!password) {
            toast({ title: "Password Required", description: "Please enter your password to confirm.", variant: "destructive" });
            return;
        }

        setIsDeleting(true);
        try {
            await apiRequest("DELETE", "/api/user", { password });
            toast({ title: "Account Deleted", description: "Your data has been wiped. Goodbye." });
            setOpen(false);
            window.location.reload(); // Force full reload to reset all states
        } catch (error: any) {
            toast({
                title: "Deletion Failed",
                description: error.message || "Incorrect password or server error",
                variant: "destructive"
            });
            setIsDeleting(false);
        }
    };

    const resetState = (openState: boolean) => {
        setOpen(openState);
        if (!openState) {
            setDeleteMode(false);
            setPassword("");
            setShowPassword(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={resetState}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full bg-background/50 backdrop-blur-sm border-border hover:bg-accent/10 transition-all hover:scale-105 shadow-sm group" title="Profile">
                    <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BadgeInfo className="h-5 w-5 text-primary" />
                        My Profile
                    </DialogTitle>
                </DialogHeader>

                {!deleteMode ? (
                    <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between p-4 bg-accent/5 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Username</p>
                                    <p className="font-semibold text-lg">{user.username}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-accent/5 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Cards</p>
                                    <p className="font-semibold text-lg">{cards?.length || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border mt-4">
                            <Button
                                variant="destructive"
                                className="w-full bg-red-900/10 text-red-500 hover:bg-red-900/20 hover:text-red-400 border border-red-900/20"
                                onClick={() => setDeleteMode(true)}
                            >
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Danger Zone: Delete Account
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 py-4 animate-in fade-in slide-in-from-right-5 duration-200">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center space-y-2">
                            <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
                            <h3 className="font-bold text-red-500 text-lg">CRITICAL WARNING</h3>
                            <p className="text-sm text-red-400">
                                This action is permanent and cannot be undone. All your people, cards, and data will be wiped instantly.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Verify Identity to Delete</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1 h-7 w-7 p-0"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="w-full" onClick={() => setDeleteMode(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={handleDeleteAccount}
                                    disabled={!password || isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Confirm Deletion"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
