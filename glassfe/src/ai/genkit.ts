import { genkit } from 'genkit';
import { groq } from 'genkitx-groq'; // Notice the change here

export const ai = genkit({
  plugins: [
    groq({ apiKey: process.env.GROQ_API_KEY })
  ],
});