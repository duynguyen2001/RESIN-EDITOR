import { createContext } from "react";
export const CountContext = createContext({
    ProvenanceCount: 0,
    EventsCount: 0,
    EntitiesCount: 0,
});

function CountProvider({ children }) {
    return (
        <CountContext.Provider
            value={{
                ProvenanceCount: 30000,
                EventsCount: 30000,
                EntitiesCount: 30000,
            }}
        >
            {children}
        </CountContext.Provider>
    );
}

export default CountProvider;
