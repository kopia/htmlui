import Select from 'react-select'
import { useContext } from 'react';
import { UIPreferencesContext } from './contexts/UIPreferencesContext';

export function ThemeSelector() {
    const { theme, setTheme } = useContext(UIPreferencesContext);
    
    //Contains all supported themes
    const themes = [
        { value: 'light', label: 'light' },
        { value: 'dark', label: 'dark' },
        { value: 'pastel', label: 'pastel' },
        { value: 'ocean', label: 'ocean' }
    ]

    //Finds the current selected theme within supported themes
    const currentTheme = themes.find(o => o.value === theme);

    /**
     * Handles the theme selection by the user
     * @param event 
     */
    const handleTheme = (event: any) => {
        var selectedTheme = event.value;
        setTheme(selectedTheme)
      };
    
   return <Select options={themes} value={currentTheme} className="select_theme" onChange={handleTheme}/> 
}