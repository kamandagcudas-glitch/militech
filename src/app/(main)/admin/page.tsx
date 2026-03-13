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
import { Shield, Loader2, ListFilter, ShieldX, MicOff, Edit, Ban, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAccount } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';

const adminBackgroundUrl = "https://images.unsplash.com/photo-1514439827219-9137a0b99245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjeWJlcnB1bmslMjBjaXR5fGVufDB8fHx8MTc3MDIyMDE0N3ww&ixlib=rb-4.1.0&q=80&w=1080";

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
        <div className="relative -m-4 md:-m-6 lg:-m-8 min-h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* Background Layers */}
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center feedback-bg-image z-[-20]"
                style={{ backgroundImage: `url(${adminBackgroundUrl})` }}
                data-ai-hint="cyberpunk city"
            />
            
            <div className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-[4px] z-[-5]" />
            <div className="absolute inset-0 w-full h-full feedback-bg-scanlines z-[-5]" />

            {/* Content Layer */}
            <div className="relative z-10 h-full overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="container mx-auto">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3 text-white" style={{ textShadow: '0 0 10px hsl(var(--primary))' }}>
                        <Shield className="text-destructive shrink-0"/> Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mb-8 text-sm md:text-base">Monitor user activity and system logs.</p>

                    <Card className="mb-8 bg-card/60 backdrop-blur-md border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg md:text-xl"><ListFilter /> Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                placeholder="Filter by username..."
                                value={usernameFilter}
                                onChange={(e) => setUsernameFilter(e.target.value)}
                                className="bg-background/50 h-10 text-sm"
                            />
                            <Input 
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-background/50 h-10 text-sm"
                            />
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="activity" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4 bg-background/40 backdrop-blur-sm">
                            <TabsTrigger value="activity" className="text-[10px] md:text-sm px-1">Activity</TabsTrigger>
                            <TabsTrigger value="login" className="text-[10px] md:text-sm px-1">Logins</TabsTrigger>
                            <TabsTrigger value="management" className="text-[10px] md:text-sm px-1">Users</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="activity">
                            <Card className="bg-card/60 backdrop-blur-md border-primary/20 overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-lg md:text-xl">Feature Usage Logs</CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Recent actions performed by users.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 md:p-6 overflow-x-auto">
                                    <div className="min-w-[600px] w-full">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[120px]">Timestamp</TableHead>
                                                    <TableHead className="w-[120px]">Username</TableHead>
                                                    <TableHead className="w-[120px]">Activity</TableHead>
                                                    <TableHead>Details</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredActivityLogs.map(log => (
                                                    <TableRow key={log.id} className="hover:bg-primary/5 transition-colors">
                                                        <TableCell className="text-[10px] md:text-xs">{format(new Date(log.timestamp), 'MM/dd HH:mm')}</TableCell>
                                                        <TableCell className="font-medium text-[10px] md:text-xs truncate max-w-[100px]">{log.username}</TableCell>
                                                        <TableCell><Badge variant="secondary" className="text-[9px] md:text-[10px] whitespace-nowrap">{log.activity}</Badge></TableCell>
                                                        <TableCell className="text-muted-foreground text-[10px] md:text-xs">{log.details}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {filteredActivityLogs.length === 0 && <p className="text-center text-muted-foreground p-8">No records found.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="login">
                            <Card className="bg-card/60 backdrop-blur-md border-primary/20 overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-lg md:text-xl">Login History</CardTitle>
                                    <CardDescription className="text-xs md:text-sm">All login attempts recorded by the simulation.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 md:p-6 overflow-x-auto">
                                    <div className="min-w-[400px] w-full">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">Timestamp</TableHead>
                                                    <TableHead className="w-[150px]">Username</TableHead>
                                                    <TableHead className="w-[100px]">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredLoginHistory.map(log => (
                                                    <TableRow key={log.id} className="hover:bg-primary/5 transition-colors">
                                                        <TableCell className="text-[10px] md:text-xs">{format(new Date(log.timestamp), 'PPpp')}</TableCell>
                                                        <TableCell className="font-medium text-[10px] md:text-xs truncate max-w-[120px]">{log.username}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={log.status === 'Success' ? 'default' : 'destructive'} className="text-[9px] md:text-[10px]">{log.status}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {filteredLoginHistory.length === 0 && <p className="text-center text-muted-foreground p-8">No records found.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="management">
                            <Card className="bg-card/60 backdrop-blur-md border-primary/20 overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl"><User /> User Management</CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Manage roles and security state.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 md:p-6 overflow-x-auto">
                                    <div className="min-w-[450px] w-full">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead className="w-[150px]">Status</TableHead>
                                                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {manageableUsers.map(({ player }) => (
                                                    <TableRow key={player.username} className="hover:bg-primary/5 transition-colors">
                                                        <TableCell>
                                                            <p className="font-medium text-xs md:text-sm truncate max-w-[150px]">{player.displayName}</p>
                                                            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">@{player.username}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {player.isBanned && <Badge variant="destructive" className="text-[8px] md:text-[9px] px-1"><ShieldX className="h-2 w-2 mr-1" /> Banned</Badge>}
                                                                {player.isMuted && <Badge variant="secondary" className="text-[8px] md:text-[9px] px-1"><MicOff className="h-2 w-2 mr-1" /> Muted</Badge>}
                                                                {player.customTitle && <Badge variant="outline" className="text-[8px] md:text-[9px] px-1 truncate max-w-[80px]">{player.customTitle}</Badge>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingUser(player); setCustomTitleInput(player.customTitle || ''); }}>
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </Button>
                                                                
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <MicOff className={cn("h-3.5 w-3.5", player.isMuted && "text-green-500")} />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent className="max-w-[90vw] md:max-w-md">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Update Mute Status?</AlertDialogTitle>
                                                                            <AlertDialogDescription>Change feedback permissions for {player.displayName}.</AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter className="gap-2 sm:gap-0">
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => player.isMuted ? unmuteUser(player.username) : muteUser(player.username)}>Confirm</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                                
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <Ban className={cn("h-3.5 w-3.5", player.isBanned ? "text-green-500" : "text-destructive")} />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent className="max-w-[90vw] md:max-w-md">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Update Ban Status?</AlertDialogTitle>
                                                                            <AlertDialogDescription>Access control for {player.displayName}.</AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter className="gap-2 sm:gap-0">
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => player.isBanned ? unbanUser(player.username) : banUser(player.username)}>Confirm</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {manageableUsers.length === 0 && <p className="text-center text-muted-foreground p-8">No agents found.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <Dialog open={!!editingUser} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                        <DialogContent className="max-w-[90vw] md:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit Title: {editingUser?.displayName}</DialogTitle>
                                <DialogDescription>Assign a tactical callsign suffix.</DialogDescription>
                            </DialogHeader>
                            <Input 
                                value={customTitleInput}
                                onChange={(e) => setCustomTitleInput(e.target.value)}
                                placeholder="e.g., The Bug Hunter"
                                className="bg-background/50 h-10"
                            />
                            <DialogFooter className="mt-4 gap-2">
                                <Button variant="outline" onClick={() => setEditingUser(null)} className="w-full md:w-auto">Cancel</Button>
                                <Button onClick={() => {
                                    if (editingUser) setCustomTitle(editingUser.username, customTitleInput);
                                    setEditingUser(null);
                                }} className="w-full md:w-auto">Save Title</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}