
"use client";

import { useContext, useState, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { GameContext, GameContextType } from '@/context/GameContext';
import { UserAccount, UserFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { GamifiedAvatar } from '@/components/ui/gamified-avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, Download, Share2, Presentation, AlertCircle, Send, Check, HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Helper to format file size
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Component for the "Share File" dialog
function ShareDialog({ file, friends, onShare }: { file: UserFile; friends: UserAccount[]; onShare: (friendUsername: string) => void; }) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Share "{file.name}"</DialogTitle>
                <DialogDescription>Select an agent to share this briefing with. They will receive a copy in their own vault.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-64 my-4">
                <div className="space-y-4 pr-4">
                {friends.length > 0 ? friends.map(friend => {
                    const isAlreadyShared = file.sharedWith.includes(friend.player.username);
                    return (
                        <div key={friend.player.username} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <GamifiedAvatar account={friend} />
                                <div>
                                    <p className="font-semibold">{friend.player.displayName}</p>
                                    <p className="text-sm text-muted-foreground">@{friend.player.username}</p>
                                </div>
                            </div>
                            <Button size="sm" disabled={isAlreadyShared} onClick={() => onShare(friend.player.username)}>
                                {isAlreadyShared ? <><Check className="mr-2 h-4 w-4"/>Shared</> : <><Send className="mr-2 h-4 w-4"/>Share</>}
                            </Button>
                        </div>
                    )
                }) : (
                    <p className="text-center text-muted-foreground py-8">No agents identified for sharing.</p>
                )}
                </div>
            </ScrollArea>
        </DialogContent>
    );
}

export default function PresentationsPage() {
    const game = useContext(GameContext) as GameContextType;
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileToShare, setFileToShare] = useState<UserFile | null>(null);

    if (!game.currentUser) return null;

    const { currentUser, accounts, uploadFile, deleteFile, shareFile } = game;
    
    // Filter files to only show PowerPoints
    const presentationFiles = useMemo(() => {
        return currentUser.files.filter(f => 
            f.type.includes('presentation') || 
            f.type.includes('powerpoint') || 
            f.name.toLowerCase().endsWith('.ppt') || 
            f.name.toLowerCase().endsWith('.pptx')
        ).sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }, [currentUser.files]);

    const friends = useMemo(() => {
        if (!currentUser?.player.friendUsernames) return [];
        return currentUser.player.friendUsernames
            .map(username => accounts.find(acc => acc.player.username === username))
            .filter((acc): acc is UserAccount => !!acc);
    }, [currentUser?.player.friendUsernames, accounts]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check if it's a PPT file before uploading
            const isPPT = file.type.includes('presentation') || 
                          file.type.includes('powerpoint') || 
                          file.name.toLowerCase().endsWith('.ppt') || 
                          file.name.toLowerCase().endsWith('.pptx');
            
            if (!isPPT) {
                toast({
                    variant: "destructive",
                    title: "Invalid Format",
                    description: "Only PowerPoint files (.ppt, .pptx) are accepted in this vault."
                });
                return;
            }
            uploadFile(file);
        }
        if(event.target) event.target.value = '';
    };
    
    const handleDownload = (file: UserFile) => {
        const link = document.createElement('a');
        link.href = file.dataUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = (fileId: string, friendUsername: string) => {
        shareFile(fileId, friendUsername);
        setFileToShare(prev => prev ? {...prev, sharedWith: [...prev.sharedWith, friendUsername]} : null);
    }

    const totalUsedBytes = useMemo(() => {
        return currentUser.files.reduce((sum, file) => sum + file.size, 0);
    }, [currentUser.files]);

    const totalCapacityBytes = 10 * 1024 * 1024; // 10MB
    const usagePercentage = (totalUsedBytes / totalCapacityBytes) * 100;

    return (
        <div className="container mx-auto">
            <input
                type="file"
                ref={fileInputRef}
                accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileChange}
                className="hidden"
            />
            
            <Dialog open={!!fileToShare} onOpenChange={(isOpen) => !isOpen && setFileToShare(null)}>
                {fileToShare && <ShareDialog file={fileToShare} friends={friends} onShare={(friendUsername) => handleShare(fileToShare.id, friendUsername)} />}
            </Dialog>

            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold flex items-center gap-3 text-orange-500">
                        <Presentation className="h-10 w-10" /> 
                        Presentation Vault
                    </h1>
                    <p className="text-muted-foreground">Tactical storage for mission briefings and educational slide-decks.</p>
                </div>
                <Button variant="cyber" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Briefing
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="md:col-span-2 border-orange-500/20 bg-orange-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-orange-500" />
                            Storage Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-xs mb-2">
                            <span>{formatBytes(totalUsedBytes)} used (Total neural storage)</span>
                            <span>10 MB limit</span>
                        </div>
                        <Progress value={usagePercentage} className="h-2 bg-orange-950" />
                        <div className="mt-4 p-3 rounded bg-background/50 border border-orange-500/20 flex items-start gap-3">
                            <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] leading-relaxed text-muted-foreground">
                                <strong>BRIEFING ADVISORY:</strong> PowerPoint files often contain high-density media. Please ensure individual uploads remain under 1MB to maintain synchronization with the Agent Profile database.
                            </p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-orange-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Vault Specs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Supported:</span>
                            <span className="font-bold text-orange-500">PPT / PPTX</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Max File:</span>
                            <span className="font-bold text-orange-500">1.0 MB</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Sharing:</span>
                            <span className="font-bold text-orange-500">Enabled</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Identified Briefings</CardTitle>
                    <CardDescription>
                        Displaying {presentationFiles.length} PowerPoint files from your central storage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {presentationFiles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {presentationFiles.map(file => {
                                const isOwner = file.ownerUsername === currentUser.player.username;
                                const owner = accounts.find(acc => acc.player.username === file.ownerUsername)?.player;
                                return (
                                    <div key={file.id} className="p-4 border border-orange-500/20 rounded-lg bg-orange-500/5 flex flex-col gap-4 justify-between transition-all hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                        <div className="flex items-start gap-4">
                                            <Presentation className="h-8 w-8 text-orange-500 shrink-0" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-bold truncate text-foreground" title={file.name}>{file.name}</p>
                                                <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                                                <p className="text-[10px] text-muted-foreground/60">{format(new Date(file.uploadDate), "PPP p")}</p>
                                            </div>
                                        </div>
                                        
                                        {!isOwner && owner && (
                                            <Badge variant="secondary" className="self-start bg-orange-500/20 text-orange-200 border-orange-500/30">Shared by {owner.displayName}</Badge>
                                        )}

                                        <div className="flex items-center gap-2 justify-end pt-2 border-t border-orange-500/10">
                                            <Button variant="ghost" size="sm" className="hover:bg-orange-500/20 hover:text-orange-500" onClick={() => handleDownload(file)}><Download className="h-4 w-4"/></Button>
                                            {isOwner && (
                                                <>
                                                    <Button variant="ghost" size="sm" className="hover:bg-orange-500/20 hover:text-orange-500" onClick={() => setFileToShare(file)}><Share2 className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteFile(file.id)}><Trash2 className="h-4 w-4"/></Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-orange-500/20 rounded-lg bg-orange-500/5">
                            <Presentation className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-semibold mb-2">Vault is empty.</p>
                            <p>Upload your first mission briefing to begin cataloging.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
