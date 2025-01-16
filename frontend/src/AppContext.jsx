import React, { createContext, useContext, useState } from "react";

// Create the context
const AppContext = createContext();

// AppProvider wraps your application and provides context
export const AppProvider = ({ children }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);

  return (
    <AppContext.Provider value={{ selectedPackage, setSelectedPackage }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};