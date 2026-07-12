// Dashboard Layout Fixes
// Apply these changes to app/dashboard/layout.tsx

/*
REQUIREMENTS:
1. Eliminate nested scrolling - single primary scrollbar
2. Keep sidebar sticky/fixed without internal scrollbar
3. User profile area in fixed sidebar footer
4. Log out moved to account menu attached to profile
5. Every sidebar item: full-width link, 60-64px row height
6. Reduce oversized empty-state cards
7. Use reusable button and card components
8. Preserve all existing routes

CSS Layout:
```
.dashboard-container {
  display: flex;
  min-height: 100vh;
}

.dashboard-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard-sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 60px;
  padding: 0 1rem;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.sidebar-nav-item:hover,
.sidebar-nav-item.active {
  background: #f5f5f5;
  color: #dc2626;
  border-left-color: #dc2626;
}

.sidebar-profile-footer {
  position: sticky;
  bottom: 0;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  background: #fff;
}

.profile-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #dc2626;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.dashboard-main {
  margin-left: 280px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1400px;
}

@media (max-width: 1024px) {
  .dashboard-sidebar {
    width: 240px;
  }
  
  .dashboard-main {
    margin-left: 240px;
  }
}

@media (max-width: 768px) {
  .dashboard-sidebar {
    position: fixed;
    left: -280px;
    z-index: 40;
    transition: left 0.3s;
  }
  
  .dashboard-sidebar.open {
    left: 0;
  }
  
  .dashboard-main {
    margin-left: 0;
  }
}
```
*/
