// Makes one MP3 per step with edge-tts and records each length in audio/durations.json.
// Adapted from the Tailored Travel video POC.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const FFPROBE = process.env.FFPROBE ?? 'ffprobe';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const { voice, rate, steps } = JSON.parse(readFileSync(path.join(here, 'steps.json'), 'utf8'));
const audioDir = path.join(here, 'audio');
mkdirSync(audioDir, { recursive: true });

const durations = {};
for (const step of steps) {
  const mp3 = path.join(audioDir, `${step.id}.mp3`);
  execFileSync('py', ['-m', 'edge_tts', '--voice', voice, ...(rate ? [`--rate=${rate}`] : []), '--text', step.narration, '--write-media', mp3], { stdio: 'inherit' });
  const out = execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).toString().trim();
  durations[step.id] = Number(out);
  console.log(`${step.id}: ${durations[step.id].toFixed(2)}s`);
}

const total = Object.values(durations).reduce((a, b) => a + b, 0);
writeFileSync(path.join(audioDir, 'durations.json'), JSON.stringify(durations, null, 2));
const publicAudio = path.join(here, 'remotion', 'public', 'audio');
mkdirSync(publicAudio, { recursive: true });
cpSync(audioDir, publicAudio, { recursive: true });
console.log(`Total narration: ${total.toFixed(2)}s`);
