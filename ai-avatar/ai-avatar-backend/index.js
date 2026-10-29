import { exec } from 'child_process';
import cors from 'cors';
import dotenv from 'dotenv';
import voice from 'elevenlabs-node';
import express from 'express';
import { promises as fs } from 'fs';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Initialize Groq client using OpenAI compat mode
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_TOKEN || '-',
  baseURL: 'https://api.groq.com/openai/v1',
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = 'cgSgspJ2msm6clMCkdW9';

const app = express();
app.use(express.json());
app.use(cors());
const port = 3001;

app.get('/', (req, res) => {
  res.send('Haven Therapy Bot Backend is online!');
});

app.get('/voices', async (req, res) => {
  try {
    if (!elevenLabsApiKey || elevenLabsApiKey.includes('PLACEHOLDER')) {
      return res.status(400).send({ error: "ElevenLabs API Key is missing or invalid." });
    }
    res.send(await voice.getVoices(elevenLabsApiKey));
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(`Command failed but continuing: ${command}`);
        resolve(null);
      }
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  try {
    console.log(`Starting conversion for message ${message}`);
    await execCommand(
      `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    );

    // Check if rhubarb exists in the project or system path
    // For now, we use a relative path idea or skip if it fails
    const rhubarbPath = "rhubarb.exe";
    await execCommand(
      `${rhubarbPath} -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
    );
    console.log(`Lip sync process completed for ${message}`);
  } catch (err) {
    console.error("Lip sync failed, but skipping crash:", err);
  }
};

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    // Default intro messages
    return res.send({
      messages: [
        {
          text: 'Hello, I am your Haven Therapy assistant. How are you feeling today?',
          audio: await audioFileToBase64('audios/intro_0.wav').catch(() => null),
          lipsync: await readJsonTranscript('audios/intro_0.json').catch(() => null),
          facialExpression: 'smile',
          animation: 'Talking_1',
        }
      ],
    });
  }

  const systemPrompt = `You are a virtual therapy bot designed to provide emotional support.
  Your goal is to listen empathetically and offer thoughtful, comforting advice.
  Respond with a JSON array of messages (max 3). Each message MUST include:
  - text: The message content.
  - facialExpression: Choose based on mood (smile, sad, surprised, angry, crazy, funnyFace, default).
  - animation: VARY THESE HEAVILY. Do not just use Talking_1. Use: Talking_0, Talking_1, Talking_2, Relaxed, Idle, Supportive, or even Surprised.
  
  IMPORTANT: Be extremely expressive! If you are happy, use 'funnyFace' or 'smile'. If you are listening, use 'Supportive'. NEVER use the same animation twice in a row. Return ONLY the JSON array.`;

  let responseText = "";
  let modelUsed = "";

  try {
    try {
      // 1. Try Groq (Primary 70B model)
      console.log("Attempting to use Groq 70B for Therapy Bot...");
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
      });
      responseText = completion.choices[0].message.content;
      modelUsed = "Groq (Llama-3.3-70B)";
    } catch (primaryError) {
      console.warn("Groq 70B failed, trying Groq 8B...");
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.6,
      });
      responseText = completion.choices[0].message.content;
      modelUsed = "Groq (Llama-3.1-8B)";
    }
  } catch (groqError) {
    console.warn("Groq failed, falling back to Gemini:", groqError.message);
    try {
      // 2. Fallback to Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(`${systemPrompt}\n\nClient: ${userMessage}`);
      const response = await result.response;
      responseText = response.text();
      modelUsed = "Gemini";
    } catch (geminiError) {
      console.error("All AI models failed:", geminiError);
      return res.status(429).send({ error: "Exceeded the API limits on all models. Please check your keys or try later." });
    }
  }

  console.log(`Generated response using ${modelUsed}`);

  let messages;
  try {
    const cleanJsonString = responseText
      .replace(/^```json\s*\n/, '')
      .replace(/\n```$/, '')
      .trim();

    messages = JSON.parse(cleanJsonString);
    if (messages.messages) messages = messages.messages;
    if (!Array.isArray(messages)) messages = [messages];
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    // Fallback to simple structure if parsing fails
    messages = [{
      text: responseText.slice(0, 500),
      facialExpression: 'calm',
      animation: 'Talking_1'
    }];
  }

  // Generate audio and lipsync for each message
  for (let i = 0; i < messages.length; i++) {
    try {
      const message = messages[i];
      const fileName = `audios/message_${i}.mp3`;

      // Only attempt ElevenLabs if key is valid
      if (elevenLabsApiKey && !elevenLabsApiKey.includes('PLACEHOLDER')) {
        await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, message.text);
        await lipSyncMessage(i);
        message.audio = await audioFileToBase64(fileName).catch(() => null);
        message.lipsync = await readJsonTranscript(`audios/message_${i}.json`).catch(() => null);
      } else {
        // No voice key, just send text + mock lipsync
        message.audio = null;

        // Generate mock mouth cues so the mouth moves even with system voice
        const words = message.text.split(' ');
        const durationPerWord = 0.35;
        const mouthCues = [];
        let currentTime = 0;

        words.forEach(() => {
          mouthCues.push({ start: currentTime, end: currentTime + 0.15, value: 'B' });
          mouthCues.push({ start: currentTime + 0.15, end: currentTime + 0.3, value: 'C' });
          currentTime += durationPerWord;
        });

        message.lipsync = { mouthCues };
      }
    } catch (audioErr) {
      console.error(`Audio generation failed for message ${i}:`, audioErr.message);
    }
  }

  res.send({ messages });
});
const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, 'utf8');
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString('base64');
};

app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});
