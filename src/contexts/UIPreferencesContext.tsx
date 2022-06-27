import React, { ReactNode, useEffect, useState } from 'react';

export const PAGE_SIZES = [10, 20, 30, 40, 50, 100];

export type Theme = "dark" | "light";

export type PageSize = 10 | 20 | 30 | 40 | 50 | 100;

export interface UIPreferences {
    get pageSize(): PageSize
    get theme(): Theme
    setTheme: (theme: Theme) => void
    setPageSize: (pageSize: number) => void
}

interface SerializedUIPreferences {
    pageSize?: number
    theme: Theme | undefined
}

export const UIPreferencesContext = React.createContext<UIPreferences>({} as UIPreferences);

export interface UIPreferenceProviderProps {
    children: ReactNode,
    initalValue: UIPreferences | undefined
}

function getDefaultTheme(): Theme {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        // browser supports light/dark mode and user prefers dark theme.
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

const PREFERENCES_URL = '/api/v1/ui-preferences';

const DEFAULT_PREFERENCES = { pageSize: PAGE_SIZES[0], theme: getDefaultTheme() } as SerializedUIPreferences;

export function UIPreferenceProvider(props: UIPreferenceProviderProps) {
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(PREFERENCES_URL, {
                    method: 'GET'
                });

                let storedPreferences = await response.json() as SerializedUIPreferences;
                if (!storedPreferences.theme || (storedPreferences.theme as string) === "") {
                    storedPreferences.theme = getDefaultTheme();
                }
                if (!storedPreferences.pageSize || storedPreferences.pageSize === 0) {
                    storedPreferences.pageSize = DEFAULT_PREFERENCES.pageSize;
                } else {
                    storedPreferences.pageSize = normalizePageSize(storedPreferences.pageSize);
                }

                setPreferences(storedPreferences);
            }
            catch (err) {
                console.error(err);
            }
        })();
    }, []);

    useEffect(() => {
        if (!preferences) {
            return;
        }

        (async () => {
            await fetch(PREFERENCES_URL, {
                method: 'PUT',
                body: JSON.stringify(preferences)
            });
        })();
    }, [preferences]);

    const setTheme = (theme: Theme) => setPreferences(oldPreferences => {
        return { ...oldPreferences, theme };
    });

    const setPageSize = (pageSize: PageSize) => setPreferences(oldPreferences => {
        return { ...oldPreferences, pageSize };
    });

    const providedValue = { ...preferences, setTheme, setPageSize } as UIPreferences;

    return <UIPreferencesContext.Provider value={providedValue}>
        {props.children}
    </UIPreferencesContext.Provider>;
}
