import React from "react";
import { useApp } from "./AppProvider";
import { Theme } from "@radix-ui/themes";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isDarkMode } = useApp()
  return (
    <Theme
      accentColor='blue'
      grayColor='gray'
      radius='medium'
      scaling='100%'
      appearance={isDarkMode ? 'dark' : 'light'}
    >
      {children}
    </Theme>
  )
}