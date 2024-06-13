require('dotenv').config({ path: require('find-config')('.env') })
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs").promises;
const Groq = require("groq-sdk");

const app = express();
const port = 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

app.post("/api/yt-video-summary", async (req, res) => {
  const { videoURL } = req.body;

  if (!videoURL) {
    return res.status(400).json({ error: "Video URL is required." });
  }

  const command = `yt-dlp --write-auto-sub --sub-lang en --skip-download -o "transcript.%(ext)s" ${videoURL}`;

  try {
    const { stdout, stderr } = await execCommand(command);
    console.log(`stdout: ${stdout}`);
    console.log("Transcript downloaded successfully as transcript.vtt");

    const data = await fs.readFile("transcript.en.vtt", "utf8");
    const cleanedTranscript = cleanTranscript(data);

    const summary = await generateSummary(cleanedTranscript);
    await fs.writeFile("summary.md", summary);

    console.log("Summary written to summary.md");

    res.status(200).json({ summary });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res
      .status(500)
      .json({ error: "Failed to process video transcript and summary." });
  }
});

async function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(new Error(`stderr: ${stderr}`));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function cleanTranscript(data) {
  return data
    .replace(/<[^>]*>/g, "")
    .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/g, "")
    .replace(/WEBVTT\n\n/g, "")
    .replace(/(\d+)\n/g, "")
    .replace(/^\s*$(?:\r\n?|\n)/gm, "")
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => !e.startsWith("align:start position:0%"))
    .reduce((acc, e, i, arr) => {
      if (arr.includes(e, i + 1)) {
        return acc;
      }
      acc.push(e);
      return acc;
    }, [])
    .join(" ");
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

app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});
