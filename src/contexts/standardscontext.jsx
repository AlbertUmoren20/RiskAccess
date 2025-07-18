// contexts/StandardsContext.js
import { createContext, useState, useContext } from 'react';

const StandardsContext = createContext();

export const StandardsProvider = ({ children }) => {
    const [standardsEvents, setStandardsEvents] = useState({
        pci: [],
        iso: [],
        vulnerability: [],
        erm: [],
    });

    const updateStandardEvents = (standard, events) => {
        setStandardsEvents(prev => ({
            ...prev,
            [standard]: events
        }));
    };

    // Get all events across all standards
    const getAllEvents = () => {
        return Object.values(standardsEvents).flat();
    };

    return (
        <StandardsContext.Provider value={{ 
            standardsEvents, 
            updateStandardEvents,
            getAllEvents 
        }}>
            {children}
        </StandardsContext.Provider>
    );
};

export const useStandards = () => useContext(StandardsContext);