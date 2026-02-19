"use client";

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '@/lib/utils';
import { Player, UserAccount } from '@/lib/types';
import { cocData } from '@/lib/data';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

type BorderType = 'bronze' | 'silver' | 'gold' | 'diamond' | 'black-flame' | 'default' | 'admin-image' | 'custom-no';

const totalPossibleSteps = cocData.reduce((sum, coc) => sum + coc.steps.length, 0);

const getBorderData = (player: Player, progress: UserAccount['progress']): { type: BorderType; name: string; requirement: string } => {
    // Priority 1: Specialized Administrator Identity
    if (player.email?.toLowerCase() === 'kamandagcudas@gmail.com') {
        return { type: 'admin-image', name: 'System Administrator', requirement: 'Highest simulation clearance level.' };
    }

    // Priority 2: Custom User Border
    if (player.email?.toLowerCase() === 'gmorecj22@gmail.com') {
        return { type: 'custom-no', name: 'Special Agent', requirement: 'Unique identity clearance.' };
    }

    if (player.isCreator) {
        return { type: 'diamond', name: 'Architect Frame', requirement: 'An exclusive frame for the system architect.' };
    }
    if (player.specialInsignia === 'black-flame') {
        return { type: 'black-flame', name: 'Abyssal Frame', requirement: 'Master the dark arts of the simulation.' };
    }

    const totalCompletedSteps = Object.values(progress).reduce((sum, p) => sum + p.completedSteps.length, 0);
    const completionPercentage = totalPossibleSteps > 0 ? (totalCompletedSteps / totalPossibleSteps) * 100 : 0;

    if (completionPercentage >= 75) {
        return { type: 'gold', name: 'Master Frame', requirement: 'Achieve 75% total completion.' };
    }
    if (completionPercentage >= 25) {
        return { type: 'silver', name: 'Elite Frame', requirement: 'Achieve 25% total completion.' };
    }
    if (completionPercentage > 0) {
        return { type: 'bronze', name: 'Apprentice Frame', requirement: 'Complete your first step.' };
    }

    return { type: 'default', name: 'Standard Unit', requirement: 'Begin your journey.' };
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
            <Avatar className={cn('relative z-10 overflow-hidden', imageClassName)}>
                <AvatarImage src={player.avatar} alt={player.username} className="object-cover w-full h-full" />
                <AvatarFallback className="bg-muted text-foreground">{player.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>
    );

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{avatarComponent}</TooltipTrigger>
                <TooltipContent side="top" className="bg-card/90 backdrop-blur-md border-primary/50 text-foreground p-3">
                    <p className="font-bold text-primary">{borderData.name}</p>
                    <p className="text-xs text-muted-foreground">{borderData.requirement}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
