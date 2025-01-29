import React, { createContext, useContext, useState } from "react";


const AppContext = createContext();


export const AppProvider = ({ children }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);

  return (
    <AppContext.Provider value={{ selectedPackage, setSelectedPackage }}>
      {children}
    </AppContext.Provider>
  );
};


export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};