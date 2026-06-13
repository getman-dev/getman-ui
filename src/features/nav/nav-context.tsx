/** React Context for sidebar navigation: active endpoint/schema and search query. */
import type {ReactNode} from "react";
import {createContext, useCallback, useContext, useMemo, useState} from "react";
import type {EndpointEntry} from "../spec/openapi";

interface NavState {
    searchQuery: string;
    activeEndpoint: EndpointEntry | null;
    activeSchema: string | null;
}

interface NavContextActions {
    setSearchQuery: (q: string) => void;
    setActiveEndpoint: (ep: EndpointEntry | null) => void;
    setActiveSchema: (name: string | null) => void;
}

type NavContextValue = NavState & NavContextActions;

const defaultState: NavState = {
    searchQuery: "",
    activeEndpoint: null,
    activeSchema: null,
};

export let navSnapshot: NavState = {...defaultState};
export const navActions: NavContextActions = {
    setSearchQuery: () => {
    },
    setActiveEndpoint: () => {
    },
    setActiveSchema: () => {
    },
};

const NavContext = createContext<NavContextValue>(null!);

/** Provides navigation state to the component tree. */
export function NavProvider({children}: { children: ReactNode }) {
    const [state, setState] = useState<NavState>(defaultState);

    const setSearchQuery = useCallback((searchQuery: string) => {
        navSnapshot = {...navSnapshot, searchQuery};
        setState(s => ({...s, searchQuery}));
    }, []);
    const setActiveEndpoint = useCallback((activeEndpoint: EndpointEntry | null) => {
        navSnapshot = {...navSnapshot, activeEndpoint};
        setState(s => ({...s, activeEndpoint}));
    }, []);
    const setActiveSchema = useCallback((activeSchema: string | null) => {
        navSnapshot = {...navSnapshot, activeSchema};
        setState(s => ({...s, activeSchema}));
    }, []);

    navSnapshot = state;
    navActions.setSearchQuery = setSearchQuery;
    navActions.setActiveEndpoint = setActiveEndpoint;
    navActions.setActiveSchema = setActiveSchema;

    const value = useMemo(
        () => ({...state, setSearchQuery, setActiveEndpoint, setActiveSchema}),
        [state, setSearchQuery, setActiveEndpoint, setActiveSchema]
    );
    return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

/** Returns nav context. Must be called inside NavProvider. */
export const useNav = () => useContext(NavContext);
