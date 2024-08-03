import { openai } from "@/app/openai";

export const runtime = "nodejs";

// Create a new assistant
export async function POST() {
  const assistant = await openai.beta.assistants.create({
    instructions: "You are a helpful assistant.",
    name: "Quickstart Assistant",
    model: "gpt-4o",
    tools: [
      { type: "code_interpreter" },
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Determine weather in my location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state e.g. San Francisco, CA",
              },
              unit: {
                type: "string",
                enum: ["c", "f"],
              },
            },
            required: ["location"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "is_code_block",
          description: "Determine if a given text contains a code block",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The text to be analyzed"
              }
            },
            required: ["text"],
          },
        },
      },
      { type: "file_search" },
    ],
  });
  return new Response(JSON.stringify({ assistantId: assistant.id }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
