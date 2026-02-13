"use client";

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '@/lib/utils';
import { Player, UserAccount } from '@/lib/types';
import { cocData } from '@/lib/data';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

type BorderType = 'bronze' | 'silver' | 'gold' | 'creator' | 'black-flame' | 'default';

const totalPossibleSteps = cocData.reduce((sum, coc) => sum + coc.steps.length, 0);

const getBorderData = (player: Player, progress: UserAccount['progress']): { type: BorderType; name: string; requirement: string } => {
    if (player.isCreator) {
        return { type: 'creator', name: 'Creator Border', requirement: 'Be the creator of the system.' };
    }
    if (player.specialInsignia === 'black-flame') {
        return { type: 'black-flame', name: 'Black Flame Border', requirement: 'Master the dark arts.' };
    }

    const totalCompletedSteps = Object.values(progress).reduce((sum, p) => sum + p.completedSteps.length, 0);
    const completionPercentage = totalPossibleSteps > 0 ? (totalCompletedSteps / totalPossibleSteps) * 100 : 0;

    if (completionPercentage >= 75) {
        return { type: 'gold', name: 'Gold Border', requirement: 'Achieve 75% total completion.' };
    }
    if (completionPercentage >= 25) {
        return { type: 'silver', name: 'Silver Border', requirement: 'Achieve 25% total completion.' };
    }
    if (completionPercentage > 0) {
        return { type: 'bronze', name: 'Bronze Border', requirement: 'Complete your first step.' };
    }

    return { type: 'default', name: 'Default Border', requirement: 'Begin your journey.' };
};

export function GamifiedAvatar({ account, className, imageClassName }: { account: UserAccount; className?: string; imageClassName?: string }) {
    if (!account) {
        return (
            <div className={cn("avatar-border-wrapper", className)} data-border="default">
                <div className="avatar-border"></div>
                <Avatar className={cn('relative', imageClassName)}>
                    <AvatarFallback>?</AvatarFallback>
                </Avatar>
            </div>
        );
    }
    
    const { player, progress } = account;
    const borderData = getBorderData(player, progress);

    const avatarComponent = (
        <div className={cn("avatar-border-wrapper", className)} data-border={borderData.type}>
            <div className="avatar-border"></div>
            <Avatar className={cn('relative', imageClassName)}>
                <AvatarImage src={player.avatar} alt={player.username} />
                <AvatarFallback>{player.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>
    );

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{avatarComponent}</TooltipTrigger>
                <TooltipContent>
                    <p className="font-bold">{borderData.name}</p>
                    <p className="text-muted-foreground">{borderData.requirement}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
