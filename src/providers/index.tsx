import { AppProvider } from "./AppProvider";
import { ThemeProvider } from "./ThemeProvider";

interface ProvidersProp {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProp> = ({ children }) => {
  return (
    <AppProvider>
        <ThemeProvider>
            {children}
        </ThemeProvider>
    </AppProvider>
  )
}