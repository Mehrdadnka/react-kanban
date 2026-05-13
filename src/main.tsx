import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import '@radix-ui/themes/styles.css';
import { Providers } from './providers'

const originalError = console.error;
console.error = (...args) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  
  const warningsToHide = [
    'ReactDOM.render is no longer supported',
    'unmountComponentAtNode is deprecated'
  ];
  
  const shouldHide = warningsToHide.some(warning => message.includes(warning));
  
  if (!shouldHide) {
    originalError.apply(console, args);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);