import React from 'react';
import { Routes, Route } from './router';
import MainLayout from "./components/layout/MainLayout";
import { Home } from './router/Pages/Home';
import { Tasks } from './router/Pages/Tasks';
import { Calendar } from './router/Pages/Calendar';
import { useEventBus } from './stores/core/event-bus.store';
import { EventBusDevPanel } from '@/components/devtools/EventBusDevPanel';
import { AppInitializer } from './components/AppInitializer';
import { XPOverviewPage } from './components/xp/XPOverviewPage';

function App() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__eventBus = useEventBus;
      console.log('🔧 EventBus available at window.__eventBus');
      console.log('Try: __eventBus.getState().emit("system:boot")');
    }
  }, []);
  return (
      <MainLayout>
   {/* {process.env.NODE_ENV === 'development' && (
        <EventBusDevPanel />
        
      )} */}
            <AppInitializer>


        <Routes>
          <Route path="/">
            <Home />
          </Route>
          <Route path="/tasks">
            <Tasks />
          </Route>
          <Route path="/calendar">
            <Calendar />
          </Route>
          <Route path="/xp">
            <XPOverviewPage />
          </Route>
        </Routes>
            </AppInitializer>

      </MainLayout>
  );
}

export default App;