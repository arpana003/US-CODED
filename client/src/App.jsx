import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import RoleRoute from './components/common/RoleRoute';

// Admin layout & pages
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Team from './pages/Team';
import Tasks from './pages/Tasks';

// AI Intelligence Pages
import AICommandCentre from './pages/ai/AICommandCentre';
import AIDelayPredictions from './pages/ai/AIDelayPredictions';
import AIRiskIntelligence from './pages/ai/AIRiskIntelligence';
import AITaskPriority from './pages/ai/AITaskPriority';
import AIWorkloadIntelligence from './pages/ai/AIWorkloadIntelligence';
import AISimulation from './pages/ai/AISimulation';
import AIAssistant from './pages/ai/AIAssistant';
import AIRecommendationHistory from './pages/ai/AIRecommendationHistory';

// Employee layout & pages
import EmployeeAppLayout from './components/layout/EmployeeAppLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeMyTasks from './pages/employee/EmployeeMyTasks';
import EmployeeTaskDetail from './pages/employee/EmployeeTaskDetail';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeProjects from './pages/employee/EmployeeProjects';
import EmployeeActivity from './pages/employee/EmployeeActivity';
import EmployeeAIAssistant from './pages/employee/EmployeeAIAssistant';

// Auth pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Admin Only Routes */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="team" element={<Team />} />
                <Route path="tasks" element={<Tasks />} />

                {/* AI Intelligence Suite */}
                <Route path="ai" element={<AICommandCentre />} />
                <Route path="ai/predictions" element={<AIDelayPredictions />} />
                <Route path="ai/risks" element={<AIRiskIntelligence />} />
                <Route path="ai/tasks" element={<AITaskPriority />} />
                <Route path="ai/workload" element={<AIWorkloadIntelligence />} />
                <Route path="ai/simulation" element={<AISimulation />} />
                <Route path="ai/assistant" element={<AIAssistant />} />
                <Route path="ai/recommendations" element={<AIRecommendationHistory />} />
              </Route>
            </Route>

            {/* Employee Only Routes */}
            <Route element={<RoleRoute allowedRoles={['employee']} />}>
              <Route path="/employee" element={<EmployeeAppLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="tasks" element={<EmployeeMyTasks />} />
                <Route path="tasks/:id" element={<EmployeeTaskDetail />} />
                <Route path="projects" element={<EmployeeProjects />} />
                <Route path="activity" element={<EmployeeActivity />} />
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="ai-assistant" element={<EmployeeAIAssistant />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#15161B',
                color: '#F4F2EE',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                boxShadow: '0 12px 36px rgba(0,0,0,0.65)',
              },
              success: {
                iconTheme: { primary: '#72C9A5', secondary: '#15161B' },
              },
              error: {
                iconTheme: { primary: '#E47C82', secondary: '#15161B' },
              },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
