import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, Grid3X3, Hash, Type } from "lucide-react";
import { PatternLock } from "@/components/PatternLock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useLocation } from "wouter";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("password");
    const [allowedMode, setAllowedMode] = useState<string>("password");
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);
    const [, setLocation] = useLocation();

    // Lockout State
    const [lockoutTime, setLockoutTime] = useState(0); // in seconds

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (lockoutTime > 0) {
            timer = setInterval(() => {
                setLockoutTime(prev => prev <= 1 ? 0 : prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [lockoutTime]);

    // Check what auth mode is set on the server
    useEffect(() => {
        fetch('/api/auth/config')
            .then(res => res.json())
            .then(data => {
                setAllowedMode(data.mode);
                setMode(data.mode);
                setIsConfigLoaded(true);
            })
            .catch(() => {
                // Fallback
                setIsConfigLoaded(true);
            });
    }, []);

    const handleLogin = async (secret: string) => {
        if (lockoutTime > 0) return;

        setLoading(true);
        setError("");

        const result = await login(secret);
        if (result.success) {
            setTimeout(() => setLocation("/"), 100);
        } else {
            setLoading(false);
            if (result.lockout && result.remainingSeconds) {
                setLockoutTime(result.remainingSeconds);
                setError(""); // Clear text error, show visual lockout instead
            } else {
                setError(result.message || "Incorrect credentials");
                // vibrate pattern error or show shake animation
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(password);
    };

    const handlePatternComplete = (pattern: string) => {
        handleLogin(pattern);
    };

    if (!isConfigLoaded) return null;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px]"></div>
            </div>

            <Card className={`w-full max-w-md mx-auto shadow-2xl glass-panel border-white/20 dark:border-white/10 relative z-10 transition-all duration-300 ${lockoutTime > 0 ? 'scale-95 grayscale' : ''}`}>

                {/* Visual Lockout Overlay */}
                {lockoutTime > 0 && (
                    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl p-6 text-center animate-in fade-in duration-300">
                        <Lock className="h-16 w-16 text-destructive mb-4 animate-bounce" />
                        <h2 className="text-2xl font-bold text-destructive mb-2">System Disabled</h2>
                        <p className="text-muted-foreground mb-6">Too many failed attempts.</p>
                        <div className="text-4xl font-mono font-bold tabular-nums">
                            {Math.floor(lockoutTime / 60)}:{(lockoutTime % 60).toString().padStart(2, '0')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Please wait before trying again.</p>
                    </div>
                )}

                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2 animate-in zoom-in duration-500">
                        {allowedMode === 'pattern' ? <Grid3X3 className="w-8 h-8 text-primary" /> :
                            allowedMode === 'pin' ? <Hash className="w-8 h-8 text-primary" /> :
                                <Lock className="w-8 h-8 text-primary" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        {allowedMode === 'pattern' ? "Draw your pattern to unlock" :
                            allowedMode === 'pin' ? "Enter your PIN to unlock" :
                                "Enter your password to unlock"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={mode} className="w-full">
                        {/* We hide the list if we want forced mode, or we can leave it to allow switching backup methods? 
                            User asked "based on what i set". Usually this means ONLY that method. 
                            So we skip rendering TabsList if we want to enforce strictness, 
                            but keeping it hidden is safer UI wise (just render content).
                        */}

                        <TabsContent value="password" className="mt-0">
                            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                                            autoFocus
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                    {error && <p className="text-sm text-destructive font-medium animate-in slide-in-from-left-1 whitespace-pre-wrap">{error}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={loading || !password}>
                                    {loading ? "Unlocking..." : "Unlock"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="pin" className="mt-0">
                            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"} // Hide PIN by default
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder="Enter PIN"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={error ? "border-destructive focus-visible:ring-destructive text-center text-lg tracking-widest" : "text-center text-lg tracking-widest"}
                                            autoFocus
                                            maxLength={8}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                    {error && <p className="text-sm text-destructive font-medium text-center animate-in slide-in-from-left-1 whitespace-pre-wrap">{error}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={loading || password.length < 4}>
                                    {loading ? "Unlocking..." : "Unlock"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="pattern" className="mt-0">
                            <div className="flex flex-col items-center justify-center pt-2 gap-4">
                                <PatternLock onComplete={handlePatternComplete} error={error} />
                                {error && <p className="text-sm text-destructive font-medium animate-in zoom-in whitespace-pre-wrap text-center">{error}</p>}
                                {loading && <p className="text-sm text-muted-foreground animate-pulse">Unlocking...</p>}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="link" size="sm" className="px-0 text-muted-foreground text-xs" onClick={() => { localStorage.clear(); window.location.reload(); }}>
                        Reset Session
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
