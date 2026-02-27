import React, { createContext, useState, ReactNode } from 'react';

export const BuildingContext = createContext<any>(null);

export const BuildingProvider = ({ children }: { children: ReactNode }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);

  return (
    <BuildingContext.Provider value={{ selectedBuilding, setSelectedBuilding }}>
      {children}
    </BuildingContext.Provider>
  );
};