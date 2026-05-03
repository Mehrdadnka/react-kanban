import { SidebarProvider } from "./SidebarProvider";
import { AppProvider } from "./AppProvider";
import { ThemeProvider } from "./ThemeProvider";
import { RouterProvider } from "@/router";
import { Toaster } from "sonner";

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
             <Toaster position="bottom-right" richColors />
          </SidebarProvider>
        </ThemeProvider>
      </AppProvider>
    </RouterProvider>

  )
}