import { createContext, FC, useContext } from "react";
const DataContext = createContext<DataContextType | null>(null);

export const DataContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <DataContext.Provider value={{}}>{children}</DataContext.Provider>;
};

export default DataContextProvider;

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataContextProvider");
  }
  return context;
};
