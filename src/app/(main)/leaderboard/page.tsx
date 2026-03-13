
"use client";

import { useMemo, useContext } from 'react';
import Link from 'next/link';
import { GameContext, GameContextType } from '@/context/GameContext';
import { UserAccount } from '@/lib/types';
import { cocData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GamifiedAvatar } from '@/components/ui/gamified-avatar';
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
     * 2. Calculate Completion Percentage: Based on unique steps completed.
     * 3. Sort Users:
     *    - Primary sort key: `totalScore` (descending).
     *    - Tie-breaker: `completionPercentage` (descending).
     */
    const rankedUsers = useMemo((): RankedUser[] => {
        if (!game.accounts) return [];

        const totalPossibleSteps = cocData.reduce((sum, coc) => sum + coc.steps.length, 0);

        const usersWithStats = game.accounts
            .filter(account => !account.player.isBanned) // Filter out banned users
            .map(account => {
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
    
    const getDisplayTitle = (player: UserAccount['player']) => {
        if (player.customTitle) return player.customTitle;
        if (!player.activeTitleId) return null;
        return achievementsData.find(a => a.id === player.activeTitleId)?.name || null;
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="font-headline text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3"><Trophy className="text-yellow-400"/> Leaderboard</h1>
            <p className="text-muted-foreground mb-8 text-sm md:text-base">Simulation top-tier operatives. Rankings prioritized by Total Score then Completion %.</p>
            
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Global Rankings</CardTitle>
                    <CardDescription className="text-xs md:text-sm">The most advanced agents identified within the simulation environment.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center w-[60px] md:w-[80px]">Rank</TableHead>
                                    <TableHead className="min-w-[150px]">Agent</TableHead>
                                    <TableHead className="text-right min-w-[100px]">Score</TableHead>
                                    <TableHead className="text-right min-w-[100px]">Sync %</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rankedUsers.map(rankedUser => {
                                    const userAccount = game.accounts.find(acc => acc.player.username === rankedUser.player.username);
                                    if (!userAccount) return null;

                                    const displayTitle = getDisplayTitle(rankedUser.player);
                                    const isCurrentUser = rankedUser.player.username === game.currentUser?.player.username;
                                    
                                    return (
                                        <TableRow key={rankedUser.player.username} className={cn(isCurrentUser && 'bg-primary/10 hover:bg-primary/20')}>
                                            <TableCell className="text-center">
                                                <div className="text-xl md:text-2xl font-bold font-cyber">
                                                    {rankedUser.rank === 1 ? '🥇' : 
                                                     rankedUser.rank === 2 ? '🥈' : 
                                                     rankedUser.rank === 3 ? '🥉' : 
                                                     rankedUser.rank}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/users/${rankedUser.player.username}`} className="flex items-center gap-3 group min-w-0">
                                                    <GamifiedAvatar account={userAccount} imageClassName="w-8 h-8 md:w-10 md:h-10" />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-xs md:text-sm group-hover:text-primary transition-colors truncate max-w-[100px] md:max-w-[200px]">{rankedUser.player.displayName}</p>
                                                         {displayTitle && <Badge variant="destructive" className="mt-0.5 text-[8px] md:text-[10px] py-0 px-1 truncate max-w-[80px] md:max-w-none">{displayTitle}</Badge>}
                                                    </div>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm md:text-lg text-primary">{rankedUser.totalScore.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono text-sm md:text-lg">{rankedUser.completionPercentage.toFixed(1)}%</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    {rankedUsers.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                            <Trophy className="h-12 w-12 opacity-10" />
                            <p className="text-sm font-cyber uppercase tracking-widest">No Active Operatives</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
