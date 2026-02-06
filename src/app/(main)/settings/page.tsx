
"use client";

import { useTheme, type Theme } from '@/context/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Cpu, Shield, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
    { name: 'Light', value: 'light', icon: <Sun className="h-5 w-5" />, bgClass: 'bg-slate-100 text-slate-800' },
    { name: 'Dark', value: 'dark', icon: <Moon className="h-5 w-5" />, bgClass: 'bg-slate-800 text-slate-100' },
    { name: 'Cyberpunk', value: 'cyberpunk', icon: <Cpu className="h-5 w-5" />, bgClass: 'bg-[#0a0f23] text-[#00f6ff]' },
    { name: 'Samurai', value: 'samurai', icon: <Shield className="h-5 w-5" />, bgClass: 'bg-[#f4f1e9] text-[#a12022]' },
    { name: 'Flames', value: 'flames', icon: <Flame className="h-5 w-5" />, bgClass: 'bg-[#1a0a02] text-orange-400' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto">
      <h1 className="font-headline text-4xl font-bold mb-8">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
                <Label className="font-semibold text-lg">Theme</Label>
                <p className="text-muted-foreground">
                    Select a theme for the application.
                </p>
                <RadioGroup
                    value={theme}
                    onValueChange={(value: any) => setTheme(value)}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {themes.map((t) => (
                        <Label key={t.value} htmlFor={t.value} className={cn(
                            "block p-4 border-2 rounded-lg cursor-pointer transition-all",
                            "has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:checked]:border-primary",
                            "hover:border-primary/50 hover:bg-accent/20"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.bgClass}`}>
                                        {t.icon}
                                    </div>
                                    <span className="font-semibold text-base">{t.name}</span>
                                </div>
                                <RadioGroupItem value={t.value} id={t.value} />
                            </div>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
