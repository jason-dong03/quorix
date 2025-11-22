import { useEffect, useState } from "react";

import { Brain, ChevronRight, ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";

function AINewsBar() {
  const [newsIndex, setNewsIndex] = useState<number>(0);
  const [newsExpanded, setNewsExpanded] = useState<boolean>(false);

  const {holdings, news: aiNews} = usePortfolio(); 

  useEffect(() => {
    if (aiNews.length === 0) return;
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % aiNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [aiNews.length]);
  
  if (holdings.length === 0) {
    return (
      <div className="card news-card mb-4">
        <div className="card-body p-4 text-center">
          <Brain size={32} className="text-muted mb-3 mx-auto" />
          <h6 className="mb-2">No AI News Available</h6>
          <p className="text-muted mb-0 small">
            Add stocks to your portfolio to see personalized AI-powered news insights
          </p>
        </div>
      </div>
    );
  }
  if (aiNews.length === 0) {
    return (
      <div className="card news-card mb-4">
        <div className="card-body p-4 text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0 small">Fetching AI news insights...</p>
        </div>
      </div>
    );
  }

  const currentNews = aiNews[newsIndex];
  return (
    <>
      <div
        className={`card news-card mb-4 ${newsExpanded ? "news-expanded" : ""}`}
      >
        <div className="card-body">
          {!newsExpanded ? (
            <div className="d-flex align-items-center justify-content-between">
              <button
                onClick={() =>
                  setNewsIndex(
                    (prev) => (prev - 1 + aiNews.length) % aiNews.length
                  )
                }
                className="btn btn-link text-white p-2"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="d-flex align-items-center justify-content-center flex-grow-1 px-4">
                <div className="d-flex align-items-center me-3">
                  <Brain size={20} className="brain-icon text-primary me-2" />
                  <span className="badge bg-primary text-uppercase small">
                    AI Insight
                  </span>
                </div>
                <div className="flex-grow-1 text-center">
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <h5 className="mb-0">{currentNews.title}</h5>
                    <span
                      className={`badge ${
                        Number(currentNews.impact) === 1
                          ? "bg-success"
                          : "bg-danger-badge"
                      }`}
                    >
                      {currentNews.symbol}
                    </span>
                    <small className="text-muted">
                      Relevance: {currentNews.relevance * 100}%
                    </small>
                  </div>
                </div>
                <div className="d-flex gap-1 ms-3">
                  {aiNews.map((_, idx) => (
                    <div
                      key={idx}
                      className={`news-indicator ${
                        idx === newsIndex ? "active" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  setNewsIndex((prev) => (prev + 1) % aiNews.length)
                }
                className="btn btn-link text-white p-2"
              >
                <ChevronRight size={20} />
              </button>

              <button
                onClick={() => setNewsExpanded(true)}
                className="btn btn-outline-primary ms-3"
              >
                Expand
              </button>
            </div>
          ) : (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                  <Brain size={24} className="text-primary" />
                  <h2 className="mb-0">AI News Feed</h2>
                  <span className="badge bg-primary">
                    {aiNews.length} Articles
                  </span>
                </div>
                <button
                  onClick={() => setNewsExpanded(false)}
                  className="btn btn-secondary"
                >
                  Collapse
                </button>
              </div>

              <div className="row g-3 news-grid">
                {aiNews.map((news, idx) => (
                  <div key={idx} 
                  className="col-md-4"
                  onClick={() => window.open(news.source_url, "_blank")} // or your own handler
                  style={{ cursor: "pointer" }}
                  >
                    <div className="card news-item h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex flex-row justify-content-start align-items-start gap-2">
                             {Number(news.impact) === 1 ? <><TrendingUp width={20} className="text-success"/></> : <><TrendingDown width={20} className="text-danger"/></>}
                            <span className={`badge ${Number(news.impact) === 1? "bg-success": "bg-danger-badge"}`}>
                              {news.symbol}
                            </span>
                            <span className={`badge bg-primary`}>
                              {news.source}
                            </span>
                          </div>
                          <small className="text-muted">
                            {news.relevance * 100}%
                          </small>
                        </div>
                        <h6 className="card-title">{news.title}</h6>
                        <p className="card-text small text-muted news-summary">
                          {news.summary}
                        </p>
                        <p className="card-text small">
                         {new Date(news.news_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AINewsBar;
