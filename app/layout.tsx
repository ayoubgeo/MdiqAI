import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./warnings";
import { assistantId } from "./assistant-config";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Assistants API Quickstart",
  description: "A quickstart template using the Assistants API with OpenAI",
  icons: {
    icon: "/carto.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {assistantId ? children : <Warnings />}
        <img className="logo" src="/carto.svg" alt="OpenAI Logo" />
      </body>
    </html>
  );
}
