import { SidebarProvider } from "./SidebarProvider";
import { AppProvider } from "./AppProvider";
import { ThemeProvider } from "./ThemeProvider";
import { RouterProvider } from "@/router";

interface ProvidersProp {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProp> = ({ children }) => {
  return (
    <RouterProvider>
      <AppProvider>
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </AppProvider>
    </RouterProvider>

  )
}