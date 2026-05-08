import { ArrowRight } from 'lucide-react';

const Navbar = () => (
  <nav className="navbar">
    <div className="container navbar-inner">
      <div className="logo-container">
        <img src="/logo.png" alt="GlimOko Logo" className="navbar-logo-img" />
        <span>GlimOko</span>
      </div>
      <div className="navbar-links mono">
        <a href="#logic" className="navbar-link">Logic</a>
        <a href="#heuristics" className="navbar-link">Heuristics</a>
      </div>
      <div className="navbar-actions">
        <a href="https://github.com/rakshityadav1868/Glim-oko" className="mono navbar-repo-link">View Repo</a>
        <a href="https://github.com/apps/glimokoo" className="btn-black">Deploy System</a>
      </div>
    </div>
  </nav>
);

export default Navbar;
