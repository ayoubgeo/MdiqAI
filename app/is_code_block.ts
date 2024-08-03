import { NextApiRequest, NextApiResponse } from 'next';

const isCodeBlock = (text: string): boolean => {
  const codeKeywords = ['function', 'const', 'let', 'import', 'export', 'class', 'return', 'if', 'else', 'for', 'while'];
  const lines = text.split('\n');

  // Consider it a code block if it contains code-specific keywords or has more than three lines
  return lines.length > 3 || codeKeywords.some(keyword => text.includes(keyword));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { text } = req.body;
    const result = isCodeBlock(text);
    res.status(200).json({ is_code_block: result });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
