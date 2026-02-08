import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Eye, EyeOff, Hash, Grid3X3, Type, ArrowLeft, RotateCcw, LockKeyhole, LogOut } from "lucide-react";
import { PatternLock } from "@/components/PatternLock";
import { useAuth } from "@/context/AuthContext";

type Step = 'verify' | 'select' | 'setup' | 'confirm-pattern';
type Mode = 'password' | 'pin' | 'pattern';

export function ChangePasswordDialog() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>('verify');
    const [targetMode, setTargetMode] = useState<Mode>('password'); // What we are changing TO
    const [currentMode, setCurrentMode] = useState<Mode>('password'); // What we use for verify

    // Credentials state
    const [verifiedCredential, setVerifiedCredential] = useState("");
    const [newCredential, setNewCredential] = useState("");
    const [confirmCredential, setConfirmCredential] = useState("");

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const { toast } = useToast();

    // Fetch current mode on open
    useEffect(() => {
        if (open) {
            setStep('verify');
            setVerifiedCredential("");
            setNewCredential("");
            setConfirmCredential("");
            setError("");
            fetch('/api/auth/config')
                .then(res => res.json())
                .then(data => setCurrentMode(data.mode || 'password'));
        }
    }, [open]);

    const handleVerify = async (credential: string) => {
        setError("");
        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: credential }),
            });
            const data = await res.json();

            if (data.success) {
                setVerifiedCredential(credential);
                setStep('select');
            } else {
                setError("Incorrect credential");
            }
        } catch (e) {
            setError("Verification failed");
        }
    };

    const handleFinalSubmit = async (finalCredential: string) => {
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: verifiedCredential,
                    newPassword: finalCredential,
                    mode: targetMode
                }),
            });

            if (!res.ok) throw new Error("Failed to update");

            toast({ title: "Success", description: "Security lock updated successfully" });
            setOpen(false);
        } catch (e) {
            toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full bg-background/50 backdrop-blur-sm border-border hover:bg-accent/10 transition-all hover:scale-105 shadow-sm group">
                    <Settings className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-90 duration-500" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {step !== 'verify' && step !== 'select' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2" onClick={() => setStep('select')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        {step === 'verify' && "Verify Identity"}
                        {step === 'select' && "Choose Security Method"}
                        {step === 'setup' && `Set New ${targetMode === 'pin' ? 'PIN' : targetMode === 'pattern' ? 'Pattern' : 'Password'}`}
                        {step === 'confirm-pattern' && "Confirm Pattern"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* STEP 1: VERIFY */}
                    {step === 'verify' && (
                        <div className="space-y-4">
                            <p className="text-center text-muted-foreground text-sm">
                                Enter your current {currentMode} to continue.
                            </p>

                            {currentMode === 'pattern' ? (
                                <div className="flex flex-col items-center">
                                    <PatternLock onComplete={handleVerify} error={!!error} />
                                    {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder={`Enter current ${currentMode}`}
                                            className={currentMode === 'pin' ? "text-center text-lg tracking-widest" : ""}
                                            onChange={(e) => {
                                                if (currentMode === 'pin' && e.target.value.length === 8) handleVerify(e.target.value);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleVerify(e.currentTarget.value);
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <Button className="w-full" onClick={() => {
                                        // Trigger verify from button if needed (e.g. for password)
                                        const input = document.querySelector('input') as HTMLInputElement;
                                        if (input) handleVerify(input.value);
                                    }}>Verify</Button>
                                    {error && <p className="text-destructive text-sm text-center">{error}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: SELECT */}
                    {step === 'select' && (
                        <div className="grid grid-cols-1 gap-4">
                            <SelectionCard icon={Type} title="Password" desc="Standard alphanumeric password" onClick={() => { setTargetMode('password'); setStep('setup'); }} />
                            <SelectionCard icon={Hash} title="PIN" desc="4-8 digit numeric code" onClick={() => { setTargetMode('pin'); setStep('setup'); }} />
                            <SelectionCard icon={Grid3X3} title="Pattern" desc="Draw a pattern on a grid" onClick={() => { setTargetMode('pattern'); setStep('setup'); }} />
                        </div>
                    )}

                    {/* STEP 3: SETUP */}
                    {step === 'setup' && (
                        <div className="space-y-4">
                            {targetMode === 'pattern' ? (
                                <div className="flex flex-col items-center text-center">
                                    <p className="text-sm text-muted-foreground mb-4">Draw your new pattern</p>
                                    <PatternLock onComplete={(p) => {
                                        if (p.length < 4) {
                                            toast({ title: "Too short", description: "Connect at least 4 dots", variant: "destructive" });
                                            return;
                                        }
                                        setNewCredential(p);
                                        setStep('confirm-pattern');
                                    }} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Input
                                        type={targetMode === 'pin' ? "number" : "text"}
                                        placeholder={`Enter new ${targetMode}`}
                                        className={targetMode === 'pin' ? "text-center text-lg tracking-widest" : ""}
                                        value={newCredential}
                                        onChange={(e) => setNewCredential(e.target.value)}
                                        autoFocus
                                    />
                                    <Input
                                        type={targetMode === 'pin' ? "number" : "text"}
                                        placeholder={`Confirm new ${targetMode}`}
                                        className={targetMode === 'pin' ? "text-center text-lg tracking-widest" : ""}
                                        value={confirmCredential}
                                        onChange={(e) => setConfirmCredential(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                if (newCredential.length < 4) {
                                                    toast({ title: "Too short", description: "Must be at least 4 chars", variant: "destructive" });
                                                    return;
                                                }
                                                if (newCredential !== confirmCredential) {
                                                    toast({ title: "Mismatch", description: "Credentials do not match", variant: "destructive" });
                                                    return;
                                                }
                                                handleFinalSubmit(newCredential);
                                            }
                                        }}
                                    />
                                    <Button className="w-full" onClick={() => {
                                        if (newCredential.length < 4) {
                                            toast({ title: "Too short", description: "Must be at least 4 chars", variant: "destructive" });
                                            return;
                                        }
                                        if (newCredential !== confirmCredential) {
                                            toast({ title: "Mismatch", description: "Credentials do not match", variant: "destructive" });
                                            return;
                                        }
                                        handleFinalSubmit(newCredential);
                                    }}>Set {targetMode === 'pin' ? 'PIN' : 'Password'}</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: CONFIRM PATTERN */}
                    {step === 'confirm-pattern' && (
                        <div className="flex flex-col items-center text-center space-y-4">
                            <p className="text-sm text-muted-foreground">Draw the pattern again to confirm</p>
                            <PatternLock onComplete={(p) => {
                                if (p === newCredential) {
                                    handleFinalSubmit(p);
                                } else {
                                    toast({ title: "Mismatch", description: "Patterns didn't match. Try again.", variant: "destructive" });
                                    setStep('setup'); // Go back to start of setup
                                }
                            }} />
                            <Button variant="ghost" size="sm" onClick={() => setStep('setup')}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

const SelectionCard = ({ icon: Icon, title, desc, onClick }: any) => (
    <div
        onClick={onClick}
        className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md active:scale-95"
    >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
    </div>
);
