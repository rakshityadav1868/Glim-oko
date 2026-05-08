const Heuristics = () => {

  const labels = [
    {
      title: "high-quality",
      description: "PR meets all security and architectural benchmarks."
    },

    {
      title: "needs-review",
      description: "Significant changes detected, human review required."
    },

    {
      title: "low-quality",
      description: "Fails basic heuristics or intent mismatch."
    }
  ];

  return (
    <section id="heuristics" className="heuristics-section">

      <div className="container heuristics-grid">

        <div>

          <h2>Deterministic Governance.</h2>

          <p>
            We've replaced manual code reviews with automated quality heuristics.
          </p>

          <div className="heuristics-labels">

            {labels.map((label, index) => {

              return (
                <div key={index} className="heuristics-label">

                  <div className={`label-badge ${label.title}`}>
                    {label.title}
                  </div>

                  <p className="label-description">
                    {label.description}
                  </p>

                </div>
              );

            })}

          </div>

        </div>

        <div className="heuristics-visual">

          <div className="console-box">

            <div className="mono console-title">
              Console Output
            </div>

            <div className="console-output">

              <div className="console-success">
                [SUCCESS] Webhook received
              </div>

              <div>
                [Qwen] Analyzing PR...
              </div>

              <div>
                [Qwen] Intent match: 98%
              </div>

              <div className="console-accent">
                [Octokit] Applying label...
              </div>

              <div className="console-success">
                [FINISH] Completed in 1.42s
              </div>

            </div>

          </div>

          <div className="console-backdrop"></div>

        </div>

      </div>

    </section>
  );
};

export default Heuristics;