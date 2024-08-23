import { NextResponse } from "next/server";
import OpenAI from "openai";


export async function POST(req) {

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })

    // Extract the user's message from the request body
    const data = await req.text();
    // const userMessage = params.someData; // This contains the message sent from the frontend
    
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a flashcard creator. Your goal is to create flashcards that are concise, clear, and focus on key concepts. The output should be a JSON object in the following format:
                {
                    "flashcards": [{
                        "front": "Question here",
                        "back": "Answer here"
                    }]
                }
                Create flashcards using the following structure:
                1. **Front**: A clear and specific question.
                2. **Back**: A concise and accurate answer. 
                Use simple language, and ensure that the flashcards are easy to understand and remember.
                only generate 8 flashcards`,
            },
            {
                role: "user",
                content: data
            }
        ],
        temperature: 0,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    })

    try {
        const flashcards = JSON.parse(response.choices[0].message.content);

        if (flashcards.flashcards && Array.isArray(flashcards.flashcards)) {
            return NextResponse.json(flashcards.flashcards);
        } else {
            return NextResponse.json({ error: "Invalid flashcard format" });
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to parse flashcard data" });
    }

}