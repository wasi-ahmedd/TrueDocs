
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2,
    Users,
    Activity,
    ShieldBan,
    ShieldCheck,
    Search,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface User {
    id: number;
    username: string;
    isAdmin: boolean;
    isBanned: boolean;
    createdAt: string;
    lastActive: string | null;
}

interface Stats {
    totalUsers: number;
    activeUsers: number;
    totalCards: number;
    totalWallets: number;
}

export default function AdminDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [adminPassword, setAdminPassword] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Stats Query (Poll every 15s for "Live" feel)
    const { data: stats } = useQuery<Stats>({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/admin/stats");
            return res.json();
        },
        refetchInterval: 15000,
    });

    // Users Query
    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/admin/users");
            // client-side sort: admins first, then newest
            const data: User[] = await res.json();
            return data.sort((a, b) =>
                b.isAdmin === a.isAdmin ? 0 : b.isAdmin ? 1 : -1
            );
        },
    });

    // Ban Mutation
    const banMutation = useMutation({
        mutationFn: async ({
            userId,
            ban,
            password,
        }: {
            userId: number;
            ban: boolean;
            password: string;
        }) => {
            await apiRequest("POST", `/api/admin/user/${userId}/ban`, {
                password,
                ban,
            });
        },
        onSuccess: (_, variables) => {
            toast({
                title: variables.ban ? "User Banned" : "User Unbanned",
                description: `Successfully ${variables.ban ? "banned" : "unbanned"} the user.`,
            });
            setBanDialogOpen(false);
            setAdminPassword("");
            setSelectedUser(null);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Action Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleBanClick = (user: User) => {
        setSelectedUser(user);
        setBanDialogOpen(true);
        setAdminPassword("");
    };

    const confirmBan = () => {
        if (!selectedUser || !adminPassword) return;
        banMutation.mutate({
            userId: selectedUser.id,
            ban: !selectedUser.isBanned,
            password: adminPassword,
        });
    };

    const filteredUsers = users?.filter((u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of system activity and user management.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="px-3 py-1 border-purple-200 bg-purple-50 text-purple-700"
                    >
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Admin Access Secure
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-card text-card-foreground border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || "-"}</div>
                        <p className="text-xs text-muted-foreground">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card className="bg-card text-card-foreground border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats?.activeUsers || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Online in last 15 mins
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card text-card-foreground border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCards || 0}</div>
                        <p className="text-xs text-muted-foreground">Stored documents</p>
                    </CardContent>
                </Card>
                <Card className="bg-card text-card-foreground border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Seed Phrases</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalWallets || 0}</div>
                        <p className="text-xs text-muted-foreground">Secured wallets</p>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                View and manage registered users.
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers?.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers?.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className={user.isBanned ? "bg-red-50/50" : ""}
                                        >
                                            <TableCell className="font-medium">
                                                {user.username}
                                            </TableCell>
                                            <TableCell>
                                                {user.isBanned ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="items-center gap-1"
                                                    >
                                                        <ShieldBan className="h-3 w-3" /> Banned
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                                                    >
                                                        Active
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {user.isAdmin ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-purple-200 text-purple-700 bg-purple-50"
                                                    >
                                                        Admin
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">
                                                        User
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {user.lastActive
                                                    ? formatDistanceToNow(new Date(user.lastActive), {
                                                        addSuffix: true,
                                                    })
                                                    : "Never"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!user.isAdmin && (
                                                    <Button
                                                        variant={user.isBanned ? "outline" : "destructive"}
                                                        size="sm"
                                                        onClick={() => handleBanClick(user)}
                                                    >
                                                        {user.isBanned ? "Unban" : "Ban"}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Ban Confirmation Dialog */}
            <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser?.isBanned ? "Unban User" : "Ban User"}
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to{" "}
                            {selectedUser?.isBanned ? "unban" : "ban"} <b>
                                {selectedUser?.username}
                            </b>
                            ?
                            <br />
                            This requires admin confirmation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Enter Admin Password</Label>
                            <Input
                                type="password"
                                placeholder="Your password..."
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={selectedUser?.isBanned ? "default" : "destructive"}
                            onClick={confirmBan}
                            disabled={!adminPassword || banMutation.isPending}
                        >
                            {banMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {selectedUser?.isBanned ? "Unban User" : "Ban User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
