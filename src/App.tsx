import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WorkflowCanvas from './components/WorkflowCanvas';
import ProjectSidebar from './components/ProjectSidebar';
import TerminalDrawer from './components/TerminalDrawer';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAppStore } from './store/useStore';
import './index.css';

function AppContent() {
  const activeTargetId = useAppStore(state => state.activeTargetId);
  const { isOpen, command, targetNodeId } = useAppStore(state => state.terminal);
  const setTerminal = useAppStore(state => state.setTerminal);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-green-500/30">
      <ProjectSidebar />
      <div className="flex-1 h-full relative flex flex-col">
        <div className="flex-1 relative">
          {activeTargetId ? (
            <WorkflowCanvas />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Create or Select a Target to begin
            </div>
          )}
        </div>
        <TerminalDrawer
          isOpen={isOpen}
          command={command}
          targetNodeId={targetNodeId}
          onClose={() => setTerminal(false)}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppContent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
