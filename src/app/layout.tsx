import type { Metadata } from "next";
import { Architects_Daughter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const architectsDaughter = Architects_Daughter({
  variable: "--font-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BotWeave | AI Customer Support Chatbot for Your Business",
  description: "Embed intelligent 24/7 customer support on any website with a single script. BotWeave combines LLM's with your custom knowledge base powered by multiple MCP agents to deliver instant, accurate responses. Built for modern businesses who scale.",
  keywords: ["AI chatbot", "customer support", "live chat", "MCP", "embeddable chatbot", "automated support"],
  authors: [{ name: "BotWeave" }],
  openGraph: {
    title: "BotWeave — AI Support That Weaves Into Your Site",
    description: "24/7 intelligent customer support. One script. Zero hassle.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${architectsDaughter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Toaster/>
        {children}
      </body>
    </html>
  );
}