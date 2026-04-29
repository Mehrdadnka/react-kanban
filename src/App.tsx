import { RouterProvider, Routes, Route } from './router';
import MainLayout from "./components/layout/MainLayout";
import { Home } from './router/Pages/Home';
import { Tasks } from './router/Pages/Tasks';
import { Calendar } from './router/Pages/Calendar';

function App() {
  return (
      <MainLayout>
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
        </Routes>
      </MainLayout>
  );
}

export default App;