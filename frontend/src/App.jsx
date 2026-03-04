import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Forecasting from './pages/Forecasting';
import Alerts from './pages/Alerts';
import ConversationalBI from './pages/ConversationalBI';
import Reports from './pages/Reports';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-background font-sans overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Topbar toggleSidebar={() => setIsSidebarOpen(true)} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/forecast" element={<Forecasting />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/bi" element={<ConversationalBI />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
