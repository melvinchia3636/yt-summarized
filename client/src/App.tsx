import React, { useState } from "react";
import axios from "axios";
import Markdown from "react-markdown";

function App() {
  const [videoURL, setVideoURL] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://youtube-summarize-api.vercel.app/api/yt-video-summary",
        { videoURL }
      );
      setSummary(response.data.summary);
    } catch (error) {
      setError("Failed to fetch summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark overflow-y-auto bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
      <img
        src="bg.svg"
        alt="Background"
        className="fixed bottom-0 h-full right-0 z-0 opacity-20"
      />
      <div className="w-full flex-1 h-full flex items-center justify-center">
        <div className="max-w-[calc(100vw-4rem)]  relative lg:max-w-[calc(100vw-24rem)] w-fit my-8 md:my-20 bg-zinc-900 p-12 rounded shadow-xl">
          <h2 className="text-2xl font-medium uppercase tracking-widest mb-12 text-center justify-center flex flex-col sm:flex-row items-center gap-2">
            <span className="sm:mb-4 flex flex-col items-start">
              <span className="text-xs sm:text-left w-full mb-6 sm:mb-1">
                A 1HR side project
              </span>
              YouTube Video
            </span>
            <span className="h-10 w-[3px] rotate-[20deg] bg-orange-500 hidden sm:block" />
            <span className="sm:mt-9 flex flex-col">
              Summarized
              <p className="sm:text-right text-xs mt-6 sm:mt-1">
                Powered by{" "}
                <a
                  href="https://groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 underline"
                >
                  Groq
                </a>
              </p>
            </span>
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={videoURL}
              onChange={(e) => setVideoURL(e.target.value)}
              placeholder="Enter YouTube Video URL"
              className="w-full px-4 py-4 tracking-wide caret-orange-500 rounded-md border-gray-300 bg-zinc-800 shadow-md focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="w-full mt-4 shadow-md bg-orange-500 transition-all text-white py-4 font-medium px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:bg-orange-600"
              disabled={loading}
            >
              {loading ? "Loading..." : "Summarize It!"}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {summary && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Summary:</h3>
              <Markdown className="prose max-w-full text-zinc-400 prose-headings:text-zinc-100 prose-strong:text-zinc-100 prose-code:text-zinc-100">
                {summary}
              </Markdown>
            </div>
          )}
        </div>
      </div>
      <footer className="w-full p-8 text-sm mt-auto text-center tracking-wide">
        <span className="inline-block text-base tracking-widest font-semibold font-['Jetbrains_Mono'] opacity-50 mb-2">
          &lt;CODEBLOG/&gt;
        </span>
        <br />
        Made with 💖 by{" "}
        <a href="https://thecodeblog.net" className="underline text-orange-500">
          Melvin Chia
        </a>
        . Project under MIT License.
      </footer>
    </div>
  );
}

export default App;
