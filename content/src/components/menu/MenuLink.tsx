import React, { ReactNode } from 'react';
import './MenuLink.css';

export const MenuLink: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};
