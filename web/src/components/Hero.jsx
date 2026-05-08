import { ArrowRight, Zap } from 'lucide-react';

const Hero = () => (
  <section className="hero">
    <div className="container hero-grid">
      <div>
        <div className="mono hero-title">
          <Zap size={16} fill="var(--accent)" />
          Qwen-POWERED INFERENCE ENGINE
        </div>
        <h1>
          SURGICAL <br />
          PRECISION.
        </h1>
        <p>
          The first autonomous Pull Request governance layer. Analyze technical intent, enforce heuristics, and label quality with zero human latency.
        </p>
        <div className="hero-buttons">
          <a href="https://github.com/apps/glimokoo" className="btn-black">
            Install GlimOko <ArrowRight size={20} />
          </a>
          <a href="https://github.com/rakshityadav1868/Glim-oko" className="btn-ghost">
            View Source
          </a>
        </div>
      </div>

      <div className="hero-visual">
        <img src="/hero.png" alt="Surgical Intelligence" />
      </div>
    </div>
  </section>
);

export default Hero;
