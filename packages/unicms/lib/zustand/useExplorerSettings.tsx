import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FileExplorerSettings = {
    showHiddenItems: boolean;
};

type SettingsStore = {
    settings: FileExplorerSettings;
    toggleHiddenItems: () => void;
};

export const useExplorerSettings = create<SettingsStore>()(
    persist(
        (set, get) => ({
            settings: {
                showHiddenItems: false, // 默认不显示隐藏文件
            },
            toggleHiddenItems: () => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        showHiddenItems: !state.settings.showHiddenItems,
                    },
                }));
            },
        }),
        {
            name: 'explorer-settings',
            storage: {
                getItem: (name) => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name, value) => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => {
                    localStorage.removeItem(name);
                },
            },
        }
    )
);
