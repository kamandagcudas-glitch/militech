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
import { Shield, Loader2, ListFilter } from 'lucide-react';

export default function AdminDashboardPage() {
    const game = useContext(GameContext) as GameContextType;
    const router = useRouter();

    const [usernameFilter, setUsernameFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD

    // Route guard
    useEffect(() => {
        if (game.currentUser && !game.currentUser.player.isCreator) {
            router.replace('/dashboard');
        }
    }, [game.currentUser, router]);

    const filteredLoginHistory = useMemo(() => {
        if (!game.loginHistory) return [];
        return game.loginHistory
            .filter(log => usernameFilter ? log.username.toLowerCase().includes(usernameFilter.toLowerCase()) : true)
            .filter(log => dateFilter ? log.timestamp.startsWith(dateFilter) : true);
    }, [game.loginHistory, usernameFilter, dateFilter]);

    const filteredActivityLogs = useMemo(() => {
        if (!game.activityLogs) return [];
        return game.activityLogs
            .filter(log => usernameFilter ? log.username.toLowerCase().includes(usernameFilter.toLowerCase()) : true)
            .filter(log => dateFilter ? log.timestamp.startsWith(dateFilter) : true);
    }, [game.activityLogs, usernameFilter, dateFilter]);

    if (!game.currentUser || !game.currentUser.player.isCreator) {
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
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="activity">Activity Logs</TabsTrigger>
                    <TabsTrigger value="login">Login History</TabsTrigger>
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
            </Tabs>
        </div>
    );
}
