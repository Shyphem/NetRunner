import WorkflowCanvas from "./components/WorkflowCanvas";
import ProjectSidebar from "./components/ProjectSidebar";
import './index.css';

const App = () => {
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-green-500/30">
      <ProjectSidebar />
      <div className="flex-1 h-full relative">
        <WorkflowCanvas />
      </div>
    </div>
  );
};

export default App;
