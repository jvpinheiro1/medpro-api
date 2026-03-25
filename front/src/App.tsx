import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Pacientes } from './pages/Pacientes';
import { Medicos } from './pages/Medicos';
import { Consultas } from './pages/Consultas';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/medicos" element={<Medicos />} />
          <Route path="/consultas" element={<Consultas />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
