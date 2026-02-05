
"use client";

import { useContext, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2, ListFilter, ShieldX, MicOff, Edit, CheckCircle, Ban, User, CaseSensitive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAccount } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"


export default function AdminDashboardPage() {
    const { currentUser, isAdmin, loginHistory, activityLogs, accounts, banUser, unbanUser, muteUser, unmuteUser, setCustomTitle } = useContext(GameContext) as GameContextType;
    const router = useRouter();

    const [usernameFilter, setUsernameFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD
    
    const [editingUser, setEditingUser] = useState<UserAccount['player'] | null>(null);
    const [customTitleInput, setCustomTitleInput] = useState('');

    // Route guard
    useEffect(() => {
        if (currentUser && !isAdmin) {
            router.replace('/dashboard');
        }
    }, [currentUser, isAdmin, router]);

    const filteredLoginHistory = useMemo(() => {
        if (!loginHistory) return [];
        return loginHistory
            .filter(log => usernameFilter ? log.username.toLowerCase().includes(usernameFilter.toLowerCase()) : true)
            .filter(log => dateFilter ? log.timestamp.startsWith(dateFilter) : true);
    }, [loginHistory, usernameFilter, dateFilter]);

    const filteredActivityLogs = useMemo(() => {
        if (!activityLogs) return [];
        return activityLogs
            .filter(log => usernameFilter ? log.username.toLowerCase().includes(usernameFilter.toLowerCase()) : true)
            .filter(log => dateFilter ? log.timestamp.startsWith(dateFilter) : true);
    }, [activityLogs, usernameFilter, dateFilter]);

    const manageableUsers = useMemo(() => {
        return accounts
            .filter(acc => !acc.player.isCreator)
            .filter(acc => usernameFilter ? acc.player.displayName.toLowerCase().includes(usernameFilter.toLowerCase()) || acc.player.username.toLowerCase().includes(usernameFilter.toLowerCase()) : true);
    }, [accounts, usernameFilter]);

    if (!currentUser || !isAdmin) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="container mx-auto">
            <h1 className="font-headline text-4xl font-bold mb-4 flex items-center gap-3"><Shield className="text-destructive"/> Admin Dashboard</h1>
            <p className="text-muted-foreground mb-8">Monitor user activity and system logs.</p>

            <Card className="mb-8 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListFilter /> Filters</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        placeholder="Filter by username..."
                        value={usernameFilter}
                        onChange={(e) => setUsernameFilter(e.target.value)}
                    />
                    <Input 
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </CardContent>
            </Card>

            <Tabs defaultValue="activity">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activity">Activity Logs</TabsTrigger>
                    <TabsTrigger value="login">Login History</TabsTrigger>
                    <TabsTrigger value="management">User Management</TabsTrigger>
                </TabsList>
                <TabsContent value="activity">
                    <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Feature Usage Logs</CardTitle>
                            <CardDescription>Recent actions performed by users across the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="max-h-[60vh] overflow-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-card">
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Activity</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredActivityLogs.map(log => (
                                            <TableRow key={log.id}>
                                                <TableCell>{format(new Date(log.timestamp), 'PPpp')}</TableCell>
                                                <TableCell className="font-medium">{log.username}</TableCell>
                                                <TableCell><Badge variant="secondary">{log.activity}</Badge></TableCell>
                                                <TableCell className="text-muted-foreground">{log.details}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {filteredActivityLogs.length === 0 && <p className="text-center text-muted-foreground p-8">No activity logs match the current filters.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="login">
                    <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Login History</CardTitle>
                            <CardDescription>Record of all user login attempts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[60vh] overflow-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-card">
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLoginHistory.map(log => (
                                            <TableRow key={log.id}>
                                                <TableCell>{format(new Date(log.timestamp), 'PPpp')}</TableCell>
                                                <TableCell className="font-medium">{log.username}</TableCell>
                                                <TableCell>
                                                    <Badge variant={log.status === 'Success' ? 'default' : 'destructive'}>{log.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {filteredLoginHistory.length === 0 && <p className="text-center text-muted-foreground p-8">No login history matches the current filters.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="management">
                    <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User /> User Management</CardTitle>
                            <CardDescription>Manage user roles, permissions, and status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="max-h-[60vh] overflow-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-card">
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {manageableUsers.map(({ player }) => (
                                            <TableRow key={player.username}>
                                                <TableCell>
                                                    <p className="font-medium">{player.displayName}</p>
                                                    <p className="text-sm text-muted-foreground">@{player.username}</p>
                                                </TableCell>
                                                <TableCell className="flex items-center gap-2 flex-wrap">
                                                    {player.isBanned && <Badge variant="destructive" className="items-center gap-1"><ShieldX className="h-3 w-3" /> Banned</Badge>}
                                                    {player.isMuted && <Badge variant="secondary" className="items-center gap-1"><MicOff className="h-3 w-3" /> Muted</Badge>}
                                                    {player.customTitle && <Badge variant="outline" className="items-center gap-1"><CaseSensitive className="h-3 w-3" /> {player.customTitle}</Badge>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => { setEditingUser(player); setCustomTitleInput(player.customTitle || ''); }}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    {player.isMuted ? <MicOff className="h-4 w-4 text-green-500" /> : <MicOff className="h-4 w-4" />}
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>You are about to {player.isMuted ? 'unmute' : 'mute'} {player.displayName}. {player.isMuted ? 'They will be able to post feedback again.' : 'They will not be able to post feedback.'}</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => player.isMuted ? unmuteUser(player.username) : muteUser(player.username)}>Continue</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                        
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    {player.isBanned ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Ban className="h-4 w-4 text-destructive" />}
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>You are about to {player.isBanned ? 'unban' : 'ban'} {player.displayName}. {player.isBanned ? 'They will regain full access.' : 'This will prevent them from logging in.'}</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => player.isBanned ? unbanUser(player.username) : banUser(player.username)}>Continue</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {manageableUsers.length === 0 && <p className="text-center text-muted-foreground p-8">No users match the current filter.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={!!editingUser} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Title for {editingUser?.displayName}</DialogTitle>
                        <DialogDescription>Set a custom title. Leave blank to remove.</DialogDescription>
                    </DialogHeader>
                    <Input 
                        value={customTitleInput}
                        onChange={(e) => setCustomTitleInput(e.target.value)}
                        placeholder="e.g., The Bug Hunter"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                        <Button onClick={() => {
                            if (editingUser) setCustomTitle(editingUser.username, customTitleInput);
                            setEditingUser(null);
                        }}>Save Title</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
