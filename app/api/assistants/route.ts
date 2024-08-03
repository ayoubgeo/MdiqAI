import { openai } from "@/app/openai";

export const runtime = "nodejs";

// Helper function to determine if text contains a code block
const isCodeBlock = (text: string): boolean => {
  const codeKeywords = ['function', 'const', 'let', 'import', 'export', 'class', 'return', 'if', 'else', 'for', 'while'];
  const lines = text.split('\n');

  // Consider it a code block if it contains code-specific keywords or has more than three lines
  const result = lines.length > 3 || codeKeywords.some(keyword => text.includes(keyword));
  console.log(`Checking text for code blocks: ${result ? 'Code block detected' : 'No code block detected'}`);
  return result;
};

// Create a new assistant
export async function POST(req, res) {
  const { text } = req.body;

  if (text) {
    const result = isCodeBlock(text);
    console.log(`isCodeBlock result for text "${text}": ${result}`);
    return res.status(200).json({ is_code_block: result });
  }

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

  console.log(`Assistant created with ID: ${assistant.id}`);
  return new Response(JSON.stringify({ assistantId: assistant.id }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
