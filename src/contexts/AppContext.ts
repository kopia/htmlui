import { createContext } from 'react';

export interface AppInfo {
    repoDescription: string
}

export const defaultValue: AppInfo = {
    repoDescription: "",
};

export const AppContext = createContext(defaultValue);
