import { Inter } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch messages from API
    const fetchMessages = async () => {
      const messagesResponse = await fetch(`/api/messages`);
      const data = await messagesResponse.json();

      setMessages(data);
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    // Auto scroll to bottom
    messagesEndRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e.key === "Enter") {
      // Call API to store the message and query ChatGPT API

      // Add my message to messages
      setMessages((prevMessage) => {
        return [
          ...prevMessage,
          {
            role: "user",
            content: message,
          },
        ];
      });

      // Clean up the message field
      setMessage("");

      const response = await fetch(`/api/chatgpt`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      const data = await response.json();

      // Add my message to messages
      setMessages((prevMessage) => {
        return [
          ...prevMessage,
          {
            role: "assistant",
            content: data.message,
          },
        ];
      });
    }
  };

  return (
    <main
      className={`flex h-screen justify-center p-12 max-w-5xl mx-auto ${inter.className}`}
    >
      <div className="w-full flex flex-col bg-slate-300 rounded-xl p-4 ring-4 ring-slate-600 shadow-xl relative">
        <Link
          href="/settings"
          className="inline-block self-start p-1 bg-slate-200 hover:bg-slate-400 rounded absolute"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="inline-block w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
        </Link>

        <div className="flex-1 overflow-auto -mt-4 py-4" ref={messagesEndRef}>
          {messages.map((message, index) => {
            if (message.role === "user") {
              return (
                <div key={index} className="flex mb-4 justify-end">
                  <div className="max-w-2/3 bg-slate-600 text-white rounded-xl px-4 py-2 ml-4">
                    {message.content}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={index} className="flex mb-4">
                  <div className="max-w-2/3 bg-slate-200 rounded-xl px-4 py-2 mr-4">
                    {message.content}
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div>
          <input
            type="text"
            className="text-lg p-4 w-full block rounded-lg shadow-lg outline-none focus:ring-2 ring-slate-700"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleSendMessage}
          />
        </div>
      </div>
    </main>
  );
}
