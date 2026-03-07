"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    isExpanded: boolean;
    toggleSidebar: () => void;
    setIsExpanded: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleSidebar = () => setIsExpanded((prev) => !prev);

    return (
        <SidebarContext.Provider value={{ isExpanded, toggleSidebar, setIsExpanded }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
