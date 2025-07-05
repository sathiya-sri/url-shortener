import React, { useState,useEffect } from "react";
import "./App.css";

const App = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

   useEffect(() => {
    const savedHistory = localStorage.getItem("urlHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setDarkMode(savedTheme === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("urlHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  

  const handleShorten = async () => {
    if (!inputUrl.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    let processedUrl = inputUrl.trim();
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      processedUrl = `https://${processedUrl}`;
    }

    if (!isValidUrl(processedUrl)) {
      setError("Please enter a properly formatted URL (e.g., example.com)");
      return;
    }

    setLoading(true);
    setError("");
    setShortUrl("");
    setCopied(false);

    try {
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = "https://cleanuri.com/api/v1/shorten";

      const response = await fetch(proxyUrl + targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ url: inputUrl }),
      });

      const data = await response.json();

     if (data.result_url) {
        setShortUrl(data.result_url);
        setHistory(prev => [{ original: processedUrl, short: data.result_url }, ...prev.slice(0, 9)]);
      } else {
        setError(data.error || "Failed to shorten the URL. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
 const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
   <div className={`container ${darkMode ? "dark-mode" : ""}`}>
      <div className="header">
        <h1>🔗 URL Shortener</h1>
        <button onClick={toggleDarkMode} className="theme-toggle">
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter URL (e.g., example.com)"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleShorten()}
        />
        <button onClick={handleShorten} disabled={loading}>
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {shortUrl && (
        <div className="result">
          <div className="result-link">
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
            <button onClick={() => copyToClipboard(shortUrl)} className="copy-button">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history">
          <h3>Recent URLs</h3>
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                <div className="history-item">
                  <div className="original-url" title={item.original}>
                    {item.original.length > 30 
                      ? `${item.original.substring(0, 30)}...` 
                      : item.original}
                  </div>
                  <div className="short-url">
                    <a href={item.short} target="_blank" rel="noopener noreferrer">
                      {item.short}
                    </a>
                    <button 
                      onClick={() => copyToClipboard(item.short)} 
                      className="copy-button small"
                    >
                      {copied ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer>
        <p>Made with React</p>
      </footer>
    </div>
  );
};

export default App;