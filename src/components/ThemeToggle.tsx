
import React from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme as useNextTheme } from 'next-themes';
import { useTheme } from '@/context/ThemeContext';
import { getThemeSettings, saveThemeSettings } from '@/services/localStorage';

type AccentColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange';

interface ColorOptionProps {
  color: AccentColor;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const ColorOption: React.FC<ColorOptionProps> = ({ color, label, selected, onClick }) => {
  const getColorClass = () => {
    switch (color) {
      case 'purple': return 'bg-splitchain-purple';
      case 'blue': return 'bg-splitchain-blue';
      case 'green': return 'bg-splitchain-green';
      case 'pink': return 'bg-splitchain-pink';
      case 'orange': return 'bg-splitchain-orange';
    }
  };

  return (
    <DropdownMenuItem onClick={onClick} className="flex items-center gap-2 cursor-pointer">
      <div className={`w-4 h-4 rounded-full ${getColorClass()}`} />
      <span>{label}</span>
      {selected && <span className="ml-auto">✓</span>}
    </DropdownMenuItem>
  );
};

export const ThemeToggle = () => {
  const { setTheme, theme } = useNextTheme();
  const { accentColor, setAccentColor } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    
    const currentSettings = getThemeSettings();
    saveThemeSettings({
      ...currentSettings,
      theme: newTheme as any
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border shadow-lg">
        <DropdownMenuItem onClick={() => handleThemeChange('light')} className="cursor-pointer">
          <Sun className="h-4 w-4 mr-2" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="cursor-pointer">
          <Moon className="h-4 w-4 mr-2" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')} className="cursor-pointer">
          <span>System</span>
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-sm font-semibold">
          <div className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            <span>Accent Color</span>
          </div>
        </div>
        
        <ColorOption 
          color="purple" 
          label="Purple" 
          selected={accentColor === 'purple'} 
          onClick={() => setAccentColor('purple')} 
        />
        <ColorOption 
          color="blue" 
          label="Blue" 
          selected={accentColor === 'blue'} 
          onClick={() => setAccentColor('blue')} 
        />
        <ColorOption 
          color="green" 
          label="Green" 
          selected={accentColor === 'green'} 
          onClick={() => setAccentColor('green')} 
        />
        <ColorOption 
          color="pink" 
          label="Pink" 
          selected={accentColor === 'pink'} 
          onClick={() => setAccentColor('pink')} 
        />
        <ColorOption 
          color="orange" 
          label="Orange" 
          selected={accentColor === 'orange'} 
          onClick={() => setAccentColor('orange')} 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
