import React, { createContext, ReactNode } from 'react';

export const TestContext = createContext({
  someValue: 1,
});

export const TestProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <TestContext.Provider
      value={{
        someValue: 2,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};
