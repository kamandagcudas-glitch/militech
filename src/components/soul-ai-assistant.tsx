'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Settings2, ShieldAlert, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithSoul, type SoulMode } from '@/ai/flows/soul-ai-flow';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AiMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const MODES: { value: SoulMode; label: string; icon: string }[] = [
  { value: 'bro', label: 'Bro Mode', icon: '😎' },
  { value: 'search', label: 'Search Mode', icon: '🔍' },
  { value: 'secretary', label: 'Secretary Mode', icon: '📋' },
  { value: 'researcher', label: 'Researcher Mode', icon: '📚' },
  { value: 'problem-solver', label: 'Problem Solver', icon: '⚙️' },
];

export default function SoulAiAssistant() {
  const { currentUser, isAdmin } = useContext(GameContext) as GameContextType;
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<SoulMode>('bro');
  const scrollRef = useRef<HTMLDivElement>(null);

  const historyDocRef = useMemoFirebase(
    () => (currentUser && isAdmin) ? doc(firestore, 'users', currentUser.player.uid, 'aiHistory', 'history') : null,
    [firestore, currentUser, isAdmin]
  );

  const { data: historyData, isLoading: isHistoryLoading } = useDoc<{ messages: AiMessage[], lastMode?: SoulMode }>(historyDocRef);
  
  const messages = historyData?.messages || [];

  useEffect(() => {
    if (historyData?.lastMode) {
      setMode(historyData.lastMode);
    }
  }, [historyData?.lastMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!currentUser) return null;

  // Visual check for access control
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

    // Save user message and current mode
    if (historyDocRef) {
      setDoc(historyDocRef, { messages: newMessages, lastMode: mode }, { merge: true });
    }

    try {
      const soulResult = await chatWithSoul({
        history: newMessages.map(m => ({ role: m.role, content: m.content })),
        message: userMessage.content,
        mode: mode,
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
      // Backup UI error handling if the flow itself crashes unexpectedly
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
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-cyber">Soul</CardTitle>
                  <CardDescription className="text-[10px] uppercase tracking-widest font-mono">Administrator AI Assistant</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1">
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
                    <p className="font-cyber text-xs">Soul [{mode.toUpperCase()}] Initialized.</p>
                    <p className="text-[10px] mt-1 opacity-50">How can I help, Admin?</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                      msg.role === 'user' ? "bg-accent" : "bg-primary"
                    )}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
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
                      <p className="text-xs italic text-muted-foreground animate-pulse">Soul is processing in {mode} mode...</p>
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
    </div>
  );
}
