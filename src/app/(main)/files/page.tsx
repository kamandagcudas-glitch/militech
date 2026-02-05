
"use client";

import { useContext, useState, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { GameContext, GameContextType } from '@/context/GameContext';
import { UserAccount, UserFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, FileImage, FileVideo, File, Trash2, Download, Share2, FolderOpen, AlertCircle, Send, Check } from 'lucide-react';

// Helper to format file size into a readable string
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper to get an appropriate icon based on file type
const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-6 w-6 text-blue-400" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-6 w-6 text-purple-400" />;
    if (fileType === 'application/pdf') return <FileText className="h-6 w-6 text-red-400" />;
    return <File className="h-6 w-6 text-gray-400" />;
};


// Component for the "Share File" dialog
function ShareDialog({ file, friends, onShare }: { file: UserFile; friends: UserAccount[]; onShare: (friendUsername: string) => void; }) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Share "{file.name}"</DialogTitle>
                <DialogDescription>Select a friend to share this file with. They will receive a copy in their own file storage.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-64 my-4">
                <div className="space-y-4 pr-4">
                {friends.length > 0 ? friends.map(friend => {
                    const isAlreadyShared = file.sharedWith.includes(friend.player.username);
                    return (
                        <div key={friend.player.username} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={friend.player.avatar} />
                                    <AvatarFallback>{friend.player.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
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
                    <p className="text-center text-muted-foreground py-8">You have no friends to share with.</p>
                )}
                </div>
            </ScrollArea>
        </DialogContent>
    );
}

export default function FilesPage() {
    const game = useContext(GameContext) as GameContextType;
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileToShare, setFileToShare] = useState<UserFile | null>(null);

    if (!game.currentUser) return null;

    const { currentUser, accounts, uploadFile, deleteFile, shareFile } = game;
    
    const friends = useMemo(() => {
        if (!currentUser?.player.friendUsernames) return [];
        return currentUser.player.friendUsernames
            .map(username => accounts.find(acc => acc.player.username === username))
            .filter((acc): acc is UserAccount => !!acc);
    }, [currentUser?.player.friendUsernames, accounts]);
    
    // File Upload Handler
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            uploadFile(file);
        }
        // Reset the input value to allow uploading the same file again
        if(event.target) event.target.value = '';
    };
    
    // File Download Handler
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
        // Optimistically update the UI to reflect the share
        setFileToShare(prev => prev ? {...prev, sharedWith: [...prev.sharedWith, friendUsername]} : null);
    }
    
    const sortedFiles = [...currentUser.files].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    return (
        <div className="container mx-auto">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            
            {/* Share Dialog, controlled by `fileToShare` state */}
            <Dialog open={!!fileToShare} onOpenChange={(isOpen) => !isOpen && setFileToShare(null)}>
                {fileToShare && <ShareDialog file={fileToShare} friends={friends} onShare={(friendUsername) => handleShare(fileToShare.id, friendUsername)} />}
            </Dialog>

            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold flex items-center gap-2"><FolderOpen /> File Storage</h1>
                    <p className="text-muted-foreground">Manage your personal and shared files.</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Upload File
                </Button>
            </div>
            
            <div className="p-4 mb-6 rounded-lg border border-yellow-400/50 bg-yellow-950/30 text-yellow-300 flex items-center gap-3">
                <AlertCircle className="h-5 w-5"/>
                <p className="text-sm font-medium">This is an offline-only demo. Uploaded files are stored in your browser's local storage, which has size limits (typically 2-5MB). Do not upload large or critical files.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Files</CardTitle>
                    <CardDescription>
                        You have {currentUser.files.length} file(s) in your storage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedFiles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedFiles.map(file => {
                                const isOwner = file.ownerUsername === currentUser.player.username;
                                const owner = accounts.find(acc => acc.player.username === file.ownerUsername)?.player;
                                return (
                                    <div key={file.id} className="p-4 border rounded-lg bg-card-foreground/5 flex flex-col gap-4 justify-between">
                                        <div className="flex items-start gap-4">
                                            {getFileIcon(file.type)}
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-semibold truncate" title={file.name}>{file.name}</p>
                                                <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(file.uploadDate), "PPP p")}</p>
                                            </div>
                                        </div>
                                        
                                        {!isOwner && owner && (
                                            <Badge variant="secondary" className="self-start">Shared by {owner.displayName}</Badge>
                                        )}

                                        <div className="flex items-center gap-2 justify-end pt-2 border-t">
                                            <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}><Download className="h-4 w-4"/></Button>
                                            {isOwner && (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => setFileToShare(file)}><Share2 className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteFile(file.id)}><Trash2 className="h-4 w-4"/></Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p className="text-lg font-semibold mb-2">Your storage is empty.</p>
                            <p>Click "Upload File" to add your first file.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
