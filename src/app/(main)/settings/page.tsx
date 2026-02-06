
"use client";

import { useTheme } from '@/context/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

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
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
                <Label htmlFor="theme-switch" className="font-semibold text-lg">
                    Theme
                </Label>
                <p className="text-muted-foreground">
                    Switch between light and dark mode.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                <Switch
                    id="theme-switch"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
                <Moon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
