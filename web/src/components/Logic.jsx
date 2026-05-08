import { FileCode, Cpu, CheckCircle2 } from 'lucide-react';

const Logic = () => {

  const cards = [
    {
      icon: <FileCode size={28} className="card-icon" />,
      title: "Fetch Diff",
      description: "Octokit-powered extraction of raw pull request diffs for semantic parsing."
    },

    {
      icon: <Cpu size={28} className="card-icon" />,
      title: "Qwen Inference",
      description: "Deep learning models analyze code intent vs. PR description in under 200ms."
    },

    {
      icon: <CheckCircle2 size={28} className="card-icon" />,
      title: "Upsert Result",
      description: "Automated status enforcement via labels and persistence markers."
    }
  ];

  return (
    <section id="logic" className="logic-section">

      <div className="container">

        <div className="mono logic-subtitle">
          System Logic Flow
        </div>

        <div className="logic-grid">

          {cards.map((card, index) => {

            return (
              <div key={index} className="card">

                <div className="card-icon-box">
                  {card.icon}
                </div>

                <h3>{card.title}</h3>

                <p>{card.description}</p>

              </div>
            );

          })}

        </div>

      </div>

    </section>
  );
};

export default Logic;