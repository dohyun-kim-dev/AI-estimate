type AdminAuthContextType = {
    isLoggedIn: boolean;
    ready: boolean;
    login: (id: string) => void;
    logout: () => void;
};
export declare const AdminAuthProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const triggerAdminLogout: () => void;
export declare const useAdminAuth: () => AdminAuthContextType;
export {};
