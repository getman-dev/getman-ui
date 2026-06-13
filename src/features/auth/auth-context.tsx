/** React Context for authentication credentials and auth modal visibility. */
import type {ReactNode} from "react";
import {createContext, useCallback, useContext, useMemo, useState} from "react";
import type {AuthValues} from "../spec/openapi";

interface AuthState {
    authValues: AuthValues;
    authModalVisible: boolean;
}

interface AuthContextActions {
    setAuthValues: (values: AuthValues) => void;
    setAuthModalVisible: (visible: boolean) => void;
}

type AuthContextValue = AuthState & AuthContextActions;

const defaultState: AuthState = {authValues: {}, authModalVisible: false};

export let authSnapshot: AuthState = {...defaultState};
export const authActions: AuthContextActions = {
    setAuthValues: () => {
    },
    setAuthModalVisible: () => {
    },
};

const AuthContext = createContext<AuthContextValue>(null!);

/** Provides auth credentials and modal state to the component tree. */
export function AuthProvider({children}: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(defaultState);

    const setAuthValues = useCallback((authValues: AuthValues) => {
        authSnapshot = {...authSnapshot, authValues};
        setState(s => ({...s, authValues}));
    }, []);
    const setAuthModalVisible = useCallback((authModalVisible: boolean) => {
        authSnapshot = {...authSnapshot, authModalVisible};
        setState(s => ({...s, authModalVisible}));
    }, []);

    authSnapshot = state;
    authActions.setAuthValues = setAuthValues;
    authActions.setAuthModalVisible = setAuthModalVisible;

    const value = useMemo(() => ({
        ...state,
        setAuthValues,
        setAuthModalVisible
    }), [state, setAuthValues, setAuthModalVisible]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Returns auth context. Must be called inside AuthProvider. */
export const useAuth = () => useContext(AuthContext);
