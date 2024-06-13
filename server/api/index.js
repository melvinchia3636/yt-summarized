require("dotenv").config({ path: require("find-config")(".env") });
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const { YoutubeTranscript } = require("youtube-transcript");

const app = express();
const port = 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

function cleanTranscript(data) {
  return data.map((item) => item.text).join(" ");
}

async function generateSummary(transcript) {
  const res = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content:
          transcript +
          "\nThese are the words spoken in the video. Please summarize the video as detailed as possible",
      },
    ],
    model: "llama3-70b-8192",
  });

  return res.choices[0]?.message?.content || "";
}

app.post("/api/yt-video-summary", async (req, res) => {
  const { videoURL } = req.body;

  if (!videoURL) {
    return res.status(400).json({ error: "Video URL is required." });
  }

  try {
    const data = await YoutubeTranscript.fetchTranscript(videoURL);
    const cleanedTranscript = cleanTranscript(data);
    const summary = await generateSummary(cleanedTranscript);

    console.log(`Summary successfully generated`);

    res.status(200).json({ summary });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res
      .status(500)
      .json({ error: "Failed to process video transcript and summary." });
  }
});

app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});

module.exports = app;
