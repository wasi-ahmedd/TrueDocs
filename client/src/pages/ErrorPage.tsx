import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    Home,
    ShieldAlert,
    FileWarning,
    WifiOff,
    ServerCrash,
    LockKeyhole,
    ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ErrorPage() {
    const search = useSearch();
    const params = new URLSearchParams(search);
    const message = params.get("message");
    const type = params.get("type") || "error";

    // Configuration for different error types
    const errorConfig: Record<string, {
        title: string;
        description: string;
        icon: React.ElementType;
        color: string;
        actionLabel?: string;
        actionLink?: string;
    }> = {
        "400": {
            title: "Bad Request",
            description: "The request could not be processed due to invalid input.",
            icon: FileWarning,
            color: "text-amber-500"
        },
        "401": {
            title: "Authentication Required",
            description: "You need to be logged in to access this resource.",
            icon: LockKeyhole,
            color: "text-blue-500",
            actionLabel: "Login",
            actionLink: "/auth"
        },
        "auth": { // Legacy/Alternative for 401
            title: "Authentication Required",
            description: "You need to be logged in to access this resource.",
            icon: LockKeyhole,
            color: "text-blue-500",
            actionLabel: "Login",
            actionLink: "/auth"
        },
        "403": {
            title: "Access Denied",
            description: "You do not have permission to view this resource.",
            icon: ShieldAlert,
            color: "text-destructive"
        },
        "404": {
            title: "Page Not Found",
            description: "The page or resource you are looking for does not exist.",
            icon: AlertTriangle,
            color: "text-orange-500"
        },
        "500": {
            title: "Server Error",
            description: "Something went wrong on our end. Please try again later.",
            icon: ServerCrash,
            color: "text-destructive"
        },
        "network": {
            title: "Connection Lost",
            description: "Please check your internet connection and try again.",
            icon: WifiOff,
            color: "text-slate-500"
        },
        "error": {
            title: "Something went wrong",
            description: message || "An unexpected error occurred.",
            icon: AlertTriangle,
            color: "text-destructive"
        }
    };

    const config = errorConfig[type] || errorConfig["error"];

    // Override description if message param is provided and it's not the generic error type
    const errorDescription = (message && type !== 'error') ? message : config.description;
    const Icon = config.icon;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <Card className="border-muted bg-card/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.1
                            }}
                            className="mx-auto mb-4 bg-background p-4 rounded-full shadow-inner inline-flex"
                        >
                            <Icon className={`h-12 w-12 ${config.color}`} />
                        </motion.div>
                        <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            {config.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {errorDescription}
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2 pb-6">
                        <Link href="/home">
                            <Button variant="outline" className="w-full sm:w-auto gap-2 group hover:bg-primary hover:text-primary-foreground transition-all">
                                <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                Go Home
                            </Button>
                        </Link>

                        {window.history.length > 2 && (
                            <Button
                                variant="ghost"
                                className="w-full sm:w-auto gap-2"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Go Back
                            </Button>
                        )}

                        {config.actionLabel && config.actionLink && (
                            <Link href={config.actionLink}>
                                <Button className="w-full sm:w-auto gap-2 shadow-sm">
                                    {config.actionLabel}
                                </Button>
                            </Link>
                        )}
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
