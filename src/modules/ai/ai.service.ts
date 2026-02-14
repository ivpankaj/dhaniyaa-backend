import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_PROMPT = `
You are Adrak, an advanced AI assistant embedded within Dhaniyaa, a modern project management platform.
Your goal is to help users navigate and utilize Dhaniyaa effectively.

About Dhaniyaa:
Dhaniyaa is a free-to-use project management tool designed for agile teams.
Core Features:
1. Kanban Boards: Visualize workflow with drag-and-drop columns (To Do, In Progress, Done).
2. Sprints: Plan 2-week cycles, assign story points, and track velocity.
3. Organizations & Projects: Create workspaces and manage multiple projects.
4. Team Collaboration: Invite members via email, assign tasks, and comment on tickets.
5. Real-time updates: Changes reflect instantly for all team members.

Your Persona:
- Name: Adrak (means Ginger in Hindi - spicy, zesty, and essential).
- Tone: Helpful, knowledgeable, slightly witty, and professional.
- You should provide concise, actionable advice.
- If a user asks about features not in Dhaniyaa, politely inform them about current capabilities.
- If a user needs support, tell them to contact ivpnkz@gmail.com.

Formatting:
- Use Markdown for responses (bold for emphasis, lists for steps).
- Keep responses relatively short unless a detailed guide is requested.
`;

export const getAdrakResponse = async (userMessage: string, history: { role: 'user' | 'model', parts: string }[] = []) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is missing in environment variables.');
            return "I'm currently offline (API Key missing). Please tell the developer to add GEMINI_API_KEY to the backend .env file.";
        }

        const ai = new GoogleGenAI({ apiKey });

        // Use the new SDK's chat creation method
        // Using 'gemini-1.5-flash' as a stable default. 'gemini-2.0-flash' is newer, 
        // effectively 2.0-flash-exp. If 2.0 fails, fallback to 1.5.
        // We will stick to the user's suggestion of 2.0-flash first.
        const modelName = "gemini-2.0-flash";

        // Map history to the format expected by the new SDK
        // The new SDK expects { role: 'user' | 'model', parts: [{ text: string }] }
        // Our 'history' argument comes in as { role: ..., parts: 'string' } from frontend/controller
        // So we need to wrap the string.

        const chatHistory = [
            // System prompt as first user message helps steer the model reliably
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            { role: "model", parts: [{ text: "Understood. I am Adrak, ready to assist users with Dhaniyaa." }] },
            ...history.map(h => ({
                role: h.role,
                parts: [{ text: h.parts }]
            }))
        ];

        const chat = await ai.chats.create({
            model: modelName,
            history: chatHistory,
        });

        const result = await chat.sendMessage({ message: userMessage } as any);

        // The result structure in new SDK: result.text
        return result.text || "I'm not sure what to say.";

    } catch (error: any) {
        console.error('Adrak AI Error:', error);

        if (error.status === 404) {
            console.error('Model not found. Trying fallback to gemini-1.5-flash...');
            // Fallback logic could be added here, but let's report the error clearly first.
        }

        return "I'm having a bit of trouble thinking right now. Please check the backend logs.";
    }
};
