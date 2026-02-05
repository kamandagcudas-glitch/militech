
"use client";

import { useMemo, useContext } from 'react';
import Link from 'next/link';
import { GameContext, GameContextType } from '@/context/GameContext';
import { UserAccount } from '@/lib/types';
import { cocData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { achievementsData } from '@/lib/data';

// Data structure for a ranked user on the leaderboard.
interface RankedUser {
  rank: number;
  player: UserAccount['player'];
  totalScore: number;
  completionPercentage: number;
}

export default function LeaderboardPage() {
    const game = useContext(GameContext) as GameContextType;

    /**
     * Ranking Logic:
     * 1. Calculate Total Score: Sums all scores from all completed quizzes for each user.
     *    Scores are only stored upon passing a quiz.
     * 2. Calculate Completion Percentage: Divides the number of unique steps completed by the total
     *    number of steps available across all COCs.
     * 3. Sort Users:
     *    - Primary sort key: `totalScore` (descending).
     *    - Tie-breaker: `completionPercentage` (descending).
     * The entire calculation is memoized with `useMemo` to prevent re-computation on every render.
     */
    const rankedUsers = useMemo((): RankedUser[] => {
        if (!game.accounts) return [];

        const totalPossibleSteps = cocData.reduce((sum, coc) => sum + coc.steps.length, 0);

        const usersWithStats = game.accounts.map(account => {
            const totalScore = Object.values(account.progress).reduce((cocSum, cocProgress) => {
                const stepScores = Object.values(cocProgress.scores || {});
                return cocSum + stepScores.reduce((stepSum, score) => stepSum + score, 0);
            }, 0);
            
            const totalCompletedSteps = Object.values(account.progress).reduce((sum, p) => sum + p.completedSteps.length, 0);
            
            const completionPercentage = totalPossibleSteps > 0 ? (totalCompletedSteps / totalPossibleSteps) * 100 : 0;

            return {
                player: account.player,
                totalScore,
                completionPercentage
            };
        });

        usersWithStats.sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }
            return b.completionPercentage - a.completionPercentage;
        });

        return usersWithStats.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

    }, [game.accounts]);
    
    const getActiveTitle = (user: UserAccount['player']) => {
        if (!user.activeTitleId) return null;
        return achievementsData.find(a => a.id === user.activeTitleId);
    };

    return (
        <div className="container mx-auto">
            <h1 className="font-headline text-4xl font-bold mb-4 flex items-center gap-3"><Trophy className="text-yellow-400"/> Leaderboard</h1>
            <p className="text-muted-foreground mb-8">See who is at the top of the class. Rankings are based on total score, then completion %.</p>
            
            <Card>
                <CardHeader>
                    <CardTitle>Agent Rankings</CardTitle>
                    <CardDescription>The top agents currently in the simulation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center w-[10%]">Rank</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead className="text-right w-[20%]">Total Score</TableHead>
                                <TableHead className="text-right w-[20%]">Completion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rankedUsers.map(user => {
                                const activeTitle = getActiveTitle(user.player);
                                const isCurrentUser = user.player.username === game.currentUser?.player.username;
                                
                                return (
                                    <TableRow key={user.player.username} className={cn(isCurrentUser && 'bg-primary/20 hover:bg-primary/30')}>
                                        <TableCell className="text-center">
                                            <div className="text-2xl font-bold">
                                                {user.rank === 1 && '🥇'}
                                                {user.rank === 2 && '🥈'}
                                                {user.rank === 3 && '🥉'}
                                                {user.rank > 3 && user.rank}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/users/${user.player.username}`} className="flex items-center gap-4 group hover:cursor-pointer">
                                                <Avatar>
                                                    <AvatarImage src={user.player.avatar} alt={user.player.username} />
                                                    <AvatarFallback>{user.player.username.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-base group-hover:underline group-hover:text-primary">{user.player.username}</p>
                                                     {activeTitle && <Badge variant="destructive" className="mt-1">{activeTitle.name}</Badge>}
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-lg">{user.totalScore.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono text-lg">{user.completionPercentage.toFixed(1)}%</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {rankedUsers.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>The leaderboard is empty. Complete some quizzes to get on the board!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
