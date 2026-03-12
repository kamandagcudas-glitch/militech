'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Settings2, ShieldAlert, PlusCircle, UserCog, Save, Image as ImageIcon, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithSoul, type SoulMode } from '@/ai/flows/soul-ai-flow';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AiMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface SoulProfile {
  aiName: string;
  aiAvatar: string;
  adminName: string;
  customInstructions: string;
}

const DEFAULT_PROFILE: SoulProfile = {
  aiName: 'Soul',
  aiAvatar: '',
  adminName: 'Admin',
  customInstructions: '',
};

const MODES: { value: SoulMode; label: string; icon: string }[] = [
  { value: 'bro', label: 'Bro Mode', icon: '😎' },
  { value: 'search', label: 'Search Mode', icon: '🔍' },
  { value: 'secretary', label: 'Secretary Mode', icon: '📋' },
  { value: 'researcher', label: 'Researcher Mode', icon: '📚' },
  { value: 'problem-solver', label: 'Problem Solver', icon: '⚙️' },
];

export default function SoulAiAssistant() {
  const { currentUser, isAdmin } = useContext(GameContext) as GameContextType;
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<SoulMode>('bro');
  const scrollRef = useRef<HTMLDivElement>(null);

  // References
  const historyDocRef = useMemoFirebase(
    () => (currentUser && isAdmin) ? doc(firestore, 'users', currentUser.player.uid, 'aiHistory', 'history') : null,
    [firestore, currentUser, isAdmin]
  );

  const profileDocRef = useMemoFirebase(
    () => (currentUser && isAdmin) ? doc(firestore, 'users', currentUser.player.uid, 'aiHistory', 'profile') : null,
    [firestore, currentUser, isAdmin]
  );

  // Subscriptions
  const { data: historyData } = useDoc<{ messages: AiMessage[], lastMode?: SoulMode }>(historyDocRef);
  const { data: profileData } = useDoc<SoulProfile>(profileDocRef);
  
  const messages = historyData?.messages || [];
  const profile = profileData || DEFAULT_PROFILE;

  // Local state for profile editing
  const [editProfile, setEditProfile] = useState<SoulProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    if (historyData?.lastMode) {
      setMode(historyData.lastMode);
    }
  }, [historyData?.lastMode]);

  useEffect(() => {
    if (profileData) {
      setEditProfile(profileData);
    }
  }, [profileData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!currentUser) return null;

  if (!isAdmin) {
    if (!isOpen) return null;
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="w-[380px] border-destructive bg-destructive/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert />
              <CardTitle className="text-sm">Access Denied</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="text-xs text-center pb-6">
            Soul is reserved for the system administrator.
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: AiMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setInput('');
    setIsTyping(true);

    if (historyDocRef) {
      setDoc(historyDocRef, { messages: newMessages, lastMode: mode }, { merge: true });
    }

    try {
      const soulResult = await chatWithSoul({
        history: newMessages.map(m => ({ role: m.role, content: m.content })),
        message: userMessage.content,
        mode: mode,
        profile: {
          aiName: profile.aiName,
          adminName: profile.adminName,
          customInstructions: profile.customInstructions,
        },
      });

      const modelMessage: AiMessage = {
        role: 'model',
        content: soulResult.response,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, modelMessage];
      if (historyDocRef) {
        setDoc(historyDocRef, { messages: finalMessages, lastMode: mode }, { merge: true });
      }
    } catch (error) {
      console.error('Soul Error:', error);
      const errorMessage: AiMessage = {
        role: 'model',
        content: "CRITICAL FAILURE: Logic core timed out. Internal circuitry requires reboot.",
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...newMessages, errorMessage];
      if (historyDocRef) {
        setDoc(historyDocRef, { messages: finalMessages, lastMode: mode }, { merge: true });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleModeChange = (newMode: SoulMode) => {
    setMode(newMode);
    if (historyDocRef) {
      setDoc(historyDocRef, { lastMode: newMode }, { merge: true });
    }
  };

  const handleNewChat = () => {
    if (historyDocRef) {
      setDoc(historyDocRef, { messages: [] }, { merge: true });
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) { // 800KB limit to stay safe with Firestore profile sync limits
        toast({
          variant: "destructive",
          title: "Neural Image Too Large",
          description: "Visual manifestation data must be under 800KB."
        });
        return;
      }

      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditProfile(prev => ({ ...prev, aiAvatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Data Stream",
          description: "Only JPG or PNG visuals are accepted."
        });
      }
    }
  };

  const saveProfile = () => {
    if (profileDocRef) {
      setDoc(profileDocRef, editProfile, { merge: true });
      setIsProfileOpen(false);
      toast({
        title: "Neural Profile Updated",
        description: `${editProfile.aiName}'s identity parameters have been synchronized.`
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:scale-110 transition-transform flex items-center justify-center group"
        >
          <Bot className="h-7 w-7 text-white group-hover:animate-pulse" />
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full animate-ping" />
        </Button>
      ) : (
        <Card className="w-[380px] h-[600px] flex flex-col shadow-2xl border-primary/30 animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="flex flex-col border-b pb-4 gap-3">
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-1 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.aiAvatar} className="object-cover" />
                    <AvatarFallback className="bg-primary text-white"><Bot /></AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <CardTitle className="text-lg font-cyber">{profile.aiName || 'Soul'}</CardTitle>
                  <CardDescription className="text-[10px] uppercase tracking-widest font-mono">Administrator AI Assistant</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsProfileOpen(true)} 
                  className="hover:text-primary"
                  title="Soul Profile"
                >
                  <UserCog className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNewChat} 
                  className="hover:text-primary"
                  title="New Chat"
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:text-destructive">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Settings2 className="h-3 w-3 text-muted-foreground" />
              <Select value={mode} onValueChange={(v) => handleModeChange(v as SoulMode)}>
                <SelectTrigger className="h-8 text-xs bg-muted/50 border-none">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <span className="flex items-center gap-2">
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-cyber text-xs">{profile.aiName || 'Soul'} [{mode.toUpperCase()}] Initialized.</p>
                    <p className="text-[10px] mt-1 opacity-50">How can I help, {profile.adminName || 'Admin'}?</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                      msg.role === 'user' ? "bg-accent" : "bg-primary overflow-hidden"
                    )}>
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Avatar className="h-full w-full">
                          <AvatarImage src={profile.aiAvatar} className="object-cover" />
                          <AvatarFallback className="bg-primary text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg max-w-[80%] text-sm",
                      msg.role === 'user' ? "bg-accent/10 border border-accent/20" : "bg-muted border border-white/5"
                    )}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    </div>
                    <div className="bg-muted p-3 rounded-lg border border-white/5">
                      <p className="text-xs italic text-muted-foreground animate-pulse">{profile.aiName || 'Soul'} is processing in {mode} mode...</p>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <div className="p-4 border-t flex items-center gap-2 bg-background/50">
            <Input
              placeholder={`Send message in ${mode} mode...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="bg-background border-primary/20"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping} 
              size="icon"
              variant="cyber"
              className="h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-cyber flex items-center gap-2">
              <UserCog className="text-primary" /> Soul Neural Profile
            </DialogTitle>
            <DialogDescription>
              Redefine the identity and visual manifestation of your digital companion.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-lg">
                  <AvatarImage src={editProfile.aiAvatar} className="object-cover" />
                  <AvatarFallback className="bg-primary text-white"><Bot className="h-10 w-10" /></AvatarFallback>
                </Avatar>
                <Label 
                  htmlFor="soul-avatar-upload" 
                  className="absolute bottom-0 right-0 p-2 bg-background border border-primary/50 rounded-full cursor-pointer hover:bg-primary/10 transition-colors shadow-lg"
                >
                  <Pencil className="h-4 w-4 text-primary" />
                  <input 
                    id="soul-avatar-upload" 
                    type="file" 
                    accept="image/png, image/jpeg" 
                    className="hidden" 
                    onChange={handleAvatarFileChange}
                  />
                </Label>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Neural Manifestation Link</p>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aiName" className="text-right text-xs uppercase font-mono">AI Name</Label>
              <Input
                id="aiName"
                value={editProfile.aiName}
                onChange={(e) => setEditProfile({ ...editProfile, aiName: e.target.value })}
                className="col-span-3 h-8 text-sm"
                placeholder="e.g. Soul, Oracle, Jarvis"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adminName" className="text-right text-xs uppercase font-mono">My Callsign</Label>
              <Input
                id="adminName"
                value={editProfile.adminName}
                onChange={(e) => setEditProfile({ ...editProfile, adminName: e.target.value })}
                className="col-span-3 h-8 text-sm"
                placeholder="How should I call you?"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="directives" className="text-xs uppercase font-mono tracking-widest text-primary">Core Directives</Label>
              <Textarea
                id="directives"
                value={editProfile.customInstructions}
                onChange={(e) => setEditProfile({ ...editProfile, customInstructions: e.target.value })}
                className="text-xs min-h-[100px] bg-muted/30"
                placeholder="Enter permanent behavioral overrides..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile} variant="cyber" className="gap-2">
              <Save className="h-4 w-4" /> Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
