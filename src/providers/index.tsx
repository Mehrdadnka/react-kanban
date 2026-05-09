import { SidebarProvider } from "./SidebarProvider";
import { AppProvider } from "./AppProvider";
import { ThemeProvider } from "./ThemeProvider";
import { RouterProvider } from "@/router";
import { TooltipProvider } from '@radix-ui/react-tooltip';

interface ProvidersProp {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProp> = ({ children }) => {
  return (
    <RouterProvider>
      <AppProvider>
        <ThemeProvider>
          <TooltipProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AppProvider>
    </RouterProvider>

  )
}