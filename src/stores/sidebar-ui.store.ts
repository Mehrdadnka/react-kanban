interface SidebarUIState {
  // UI-specific state
  isAnimating: boolean;
  shouldRender: boolean;
  
  // Animation hooks
  animateIn: () => void;
  animateOut: () => void;
  
  // Theme
  isDarkMode: boolean;
}