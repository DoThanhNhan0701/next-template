export const storage = {
    get<T = unknown>(key: string): T | null {
        if (typeof globalThis === 'undefined') return null;
        try {
            const value = localStorage.getItem(key);
            return value ? (JSON.parse(value) as T) : null;
        } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
            return null;
        }
    },

    set<T>(key: string, value: T): void {
        if (typeof globalThis === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    },

    remove(key: string): void {
        if (typeof globalThis === 'undefined') return;
        localStorage.removeItem(key);
    },

    clear(): void {
        if (typeof globalThis === 'undefined') return;
        localStorage.clear();
    },
};
