import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type LoginData = Pick<SelectUser, "username" | "password">;

type AuthContextType = {
    user: SelectUser | null;
    isLoading: boolean;
    error: Error | null;
    loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
    logoutMutation: UseMutationResult<void, Error, void>;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();

    const {
        data: user,
        error,
        isLoading,
    } = useQuery<SelectUser | null>({
        queryKey: ["/api/user"],
        queryFn: async () => {
            try {
                // IMPORTANT: Must include credentials to send the session cookie!
                const res = await fetch("/api/user", { credentials: "include" });
                if (res.status === 401) {
                    return null;
                }
                if (!res.ok) {
                    throw new Error("Failed to fetch user");
                }
                return await res.json();
            } catch (e) {
                return null; // fallback to null on error (offline etc)
            }
        },
        retry: false, // Don't retry if 401
        staleTime: Infinity, // Keep user data fresh until explicit invalidation
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginData) => {
            const res = await apiRequest("POST", "/api/auth/login", credentials);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Login failed");
            }
            return await res.json();
        },
        onSuccess: (data: any) => {
            // The backend returns { success: true, user: ... } or similar.
            // We should update the query cache with the user object if possible, or just invalidate.
            queryClient.setQueryData(["/api/user"], data.user);

            toast({
                title: "Welcome back",
                description: "Vault unlocked successfully",
            });
        },
        onError: (e: Error) => {
            // Suppress "User not found" error because we handle it in Auth.tsx by auto-switching tabs
            if (e.message && e.message.includes("User not found")) return;

            toast({
                title: "Login failed",
                description: e.message,
                variant: "destructive",
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/auth/logout");
        },
        onSuccess: () => {
            // Clear ALL data from the cache to prevent User B from seeing User A's data
            queryClient.clear();
            // set user to null explicitly to trigger auth redirect immediately
            queryClient.setQueryData(["/api/user"], null);

            toast({
                title: "Logged out",
                description: "See you next time",
            });
        },
        onError: (e: Error) => {
            toast({
                title: "Logout failed",
                description: e.message,
                variant: "destructive",
            });
        },
    });


    return (
        <AuthContext.Provider
            value={{
                user: user ?? null,
                isLoading,
                error: error as Error,
                loginMutation,
                logoutMutation,
                // Backward compatibility helpers
                logout: () => logoutMutation.mutate(),
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

