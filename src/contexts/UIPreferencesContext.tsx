import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export const PAGE_SIZES = [10, 20, 30, 40, 50, 100];
export const UIPreferencesContext = React.createContext<UIPreferences>({} as UIPreferences);

const DEFAULT_PREFERENCES = { pageSize: PAGE_SIZES[0], bytesStringBase2: false, defaultSnapshotViewAll: false, theme: getDefaultTheme(), preferWebDav: false, fontSize: "fs-6" } as SerializedUIPreferences;
const PREFERENCES_URL = '/api/v1/ui-preferences';

export type Theme = "light" | "dark" | "pastel" | "ocean";
export type PageSize = 10 | 20 | 30 | 40 | 50 | 100;
export type fontSize = "fs-6" | "fs-5" | "fs-4" | "fs-3";

export interface UIPreferences {
    get pageSize(): PageSize
    get theme(): Theme
    get bytesStringBase2(): boolean
    get defaultSnapshotViewAll(): boolean
    get preferWebDav(): boolean
    get fontSize(): fontSize
    setTheme: (theme: Theme) => void
    setPageSize: (pageSize: number) => void
    setByteStringBase: (bytesStringBase2: String) => void
    setDefaultSnapshotViewAll: (defaultSnapshotView: boolean) => void
    setPreferWebDav: (preferWebDav: String) => void
    setFontSize: (size: String) => void
}

interface SerializedUIPreferences {
    pageSize?: number
    bytesStringBase2?: boolean
    defaultSnapshotView?: boolean
    theme: Theme
    preferWebDav?: boolean
    fontSize: fontSize
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
    /**
         * 
         * @param theme 
         * @returns 
         */
    const setTheme = useCallback((theme: Theme) => setPreferences(oldPreferences => {
        syncTheme(theme, oldPreferences.theme);
        return { ...oldPreferences, theme };
    }),[]);

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

    const setPreferWebDav = (input: String) => setPreferences(oldPreferences => {
        var preferWebDav = input === "true";
        return { ...oldPreferences, preferWebDav };
    });

    const setFontSize = useCallback((fontSize: fontSize) => setPreferences(oldPreferences => {
        syncFontSize(fontSize, oldPreferences.fontSize);
        return { ...oldPreferences, fontSize };
    }),[]);

    useEffect(() => {
        axios.get(PREFERENCES_URL).then(result => {
            let storedPreferences = result.data as SerializedUIPreferences;
            if (!storedPreferences.theme || (storedPreferences.theme as string) === "") {
                storedPreferences.theme = getDefaultTheme();
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
     * Synchronizes the selected theme with the html class
     * 
     * @param theme 
     * The theme to be set
     */
    const syncTheme = (newTheme: Theme, oldTheme: Theme) => {
        var doc = document.querySelector("html")!;
        if (!doc.classList.replace(oldTheme, newTheme)) {
            doc.classList.add(newTheme)
        }
    }

    /**
     * Synchronizes the selected theme with the html class
     * 
     * @param theme 
     * The theme to be set
     */
    const syncFontSize = (newFontSize: fontSize, oldFontSize: fontSize) => {
        var doc = document.querySelector("html")!;
        if (!doc.classList.replace(oldFontSize, newFontSize)) {
            doc.classList.add(newFontSize)
        }
    }



    const providedValue = { ...preferences, setTheme, setPageSize, setByteStringBase, setDefaultSnapshotViewAll, setPreferWebDav, setFontSize } as UIPreferences;

    return <UIPreferencesContext.Provider value={providedValue}>
        {props.children}
    </UIPreferencesContext.Provider>;
}
