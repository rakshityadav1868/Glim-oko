import { ShieldCheck, ArrowRight, Terminal, Activity, Cpu, Zap, CheckCircle2, FileCode } from 'lucide-react';
import ScrollProgress from './components/ScrollProgress.jsx';

import Navbar from './components/Navbar.jsx';
import MetricCard from './components/MetricCard.jsx';
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import Logic from './components/Logic.jsx';
import Heuristics from './components/Heuristics.jsx';
import FinalCall from './components/FinalCall.jsx';
import './App.css';

function App() {

  return (
    <div className="app-root">
      <ScrollProgress />
      <Navbar />

      <div className="scan-line" />

      <div className="grid-bg" />

      <Hero />
      <Logic />



      <Heuristics />


      <div className="metrics-bar">
        <div className="container metrics-container">
          <MetricCard icon={Cpu} title="Inference Latency" value="< 180ms" />
          <MetricCard icon={Activity} title="Throughput" value="1.2k PRs/hr" />
          <MetricCard icon={ShieldCheck} title="Heuristics" value="V3.2 Engine" />
          <MetricCard icon={Terminal} title="Connectivity" value="TLS 1.3" />
        </div>
      </div>


      <FinalCall />

      <Footer />
    </div>
  );
}

export default App;
