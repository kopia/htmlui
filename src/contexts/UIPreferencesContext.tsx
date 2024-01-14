import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export const PAGE_SIZES = [10, 20, 30, 40, 50, 100];
export const UIPreferencesContext = React.createContext<UIPreferences>({} as UIPreferences);

const DEFAULT_PREFERENCES = { pageSize: PAGE_SIZES[0], bytesStringBase2: false, defaultSnapshotViewAll: false, theme: getDefaultTheme(), preferWebDav: false, fontSize: "fs-6" } as SerializedUIPreferences;
const PREFERENCES_URL = '/api/v1/ui-preferences';

export type Theme = "light" | "dark" | "pastel" | "ocean";
export type PageSize = 10 | 20 | 30 | 40 | 50 | 100;
export type FontSize = "fs-6" | "fs-5" | "fs-4";

export interface UIPreferences {
    get pageSize(): PageSize
    get theme(): Theme
    get bytesStringBase2(): boolean
    get defaultSnapshotViewAll(): boolean
    get fontSize(): FontSize
    setTheme: (theme: Theme) => void
    setPageSize: (pageSize: number) => void
    setByteStringBase: (bytesStringBase2: String) => void
    setDefaultSnapshotViewAll: (defaultSnapshotView: boolean) => void
    setFontSize: (size: String) => void
}

interface SerializedUIPreferences {
    pageSize?: number
    bytesStringBase2?: boolean
    defaultSnapshotView?: boolean
    theme: Theme
    fontSize: FontSize
}

export interface UIPreferenceProviderProps {
    children: ReactNode,
    initalValue: UIPreferences | undefined
}

/**
 * Returns a default theme based on the user's browser settings.
 * @returns Theme
 */
function getDefaultTheme(): Theme {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

function normalizePageSize(pageSize: number): PageSize {
    for (let index = 0; index < PAGE_SIZES.length; index++) {
        const element = PAGE_SIZES[index];
        if (pageSize === element) {
            return pageSize as PageSize;
        }
        if (pageSize < element) {
            if (index === 0) {
                return element as PageSize;
            }
            return PAGE_SIZES[index - 1] as PageSize;
        }
    }
    return 100;
}

export function UIPreferenceProvider(props: UIPreferenceProviderProps) {
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
   
    const setTheme = useCallback((theme: Theme) => setPreferences(oldPreferences => {
        syncTheme(theme, oldPreferences.fontSize);
        return { ...oldPreferences, theme };
    }), []);

    const setPageSize = (pageSize: PageSize) => setPreferences(oldPreferences => {
        return { ...oldPreferences, pageSize };
    });

    const setByteStringBase = (input: String) => setPreferences(oldPreferences => {
        var bytesStringBase2 = input === "true";
        return { ...oldPreferences, bytesStringBase2 };
    });

    const setDefaultSnapshotViewAll = (input: boolean) => setPreferences(oldPreferences => {
        return { ...oldPreferences, input };
    });

    const setFontSize = useCallback((fontSize: FontSize) => setPreferences(oldPreferences => {
        syncTheme(oldPreferences.theme, fontSize);
        return { ...oldPreferences, fontSize };
    }), []);

    useEffect(() => {
        axios.get(PREFERENCES_URL).then(result => {
            let storedPreferences = result.data as SerializedUIPreferences;
            if (!storedPreferences.theme || (storedPreferences.theme as string) === "") {
                storedPreferences.theme = getDefaultTheme();
            }
            if (!storedPreferences.fontSize || (storedPreferences.fontSize as string) === "") {
                storedPreferences.fontSize = DEFAULT_PREFERENCES.fontSize
            }
            if (!storedPreferences.pageSize || storedPreferences.pageSize === 0) {
                storedPreferences.pageSize = DEFAULT_PREFERENCES.pageSize;
            } else {
                storedPreferences.pageSize = normalizePageSize(storedPreferences.pageSize);
            }
            setTheme(storedPreferences.theme);
            setFontSize(storedPreferences.fontSize);
            setPreferences(storedPreferences);
        }).catch(err => console.error(err));

    }, [setTheme, setFontSize]);

    useEffect(() => {
        if (!preferences) {
            return;
        }
        axios.put(PREFERENCES_URL, preferences).then(result => { }).catch(err => console.error(err));
    }, [preferences]);

    /**
     * Synchronizes the theme as well as the font size with the class.
     * To prevent any situations, where the theme or the font size is not in sync with the class, 
     * we first remove every element and set them again.
     * 
     * @param theme 
     * The theme to be set
     * @param fontSize 
     * The font size to be set
     */
    const syncTheme = (theme: Theme, fontSize: FontSize) => {
        var doc = document.querySelector("html")!;
        doc.classList.remove(...doc.classList);
        doc.classList.add(theme, fontSize)
    }

    const providedValue = { ...preferences, setTheme, setPageSize, setByteStringBase, setDefaultSnapshotViewAll, setFontSize } as UIPreferences;

    return <UIPreferencesContext.Provider value={providedValue}>
        {props.children}
    </UIPreferencesContext.Provider>;
}
