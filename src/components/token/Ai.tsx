"use client";
import { useState, useEffect, useRef } from "react";
import { AiOutlineMessage, AiOutlineClose } from "react-icons/ai";
import React from "react";
import axios from "axios";

const ChatAiButton = ({ initialResponse = "", initialRequestContent = "" }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(initialResponse);
  const [requestContent, setRequestContent] = useState(initialRequestContent);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set timeout untuk menampilkan notifikasi setelah 5 detik
    const showTimer = setTimeout(() => {
      setShowNotification(true);
    }, 5000);

    // Set timeout untuk menyembunyikan notifikasi setelah 10 detik
    const hideTimer = setTimeout(() => {
      setShowNotification(false);
    }, 10000);

    // Membersihkan timeout saat komponen dilepas
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    // Fungsi untuk melakukan scroll ke bagian bawah setiap kali respons berubah
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      setRequestContent(message);
      setResponse(""); // Clear previous response
      setIsLoading(true);
      try {
        // Get API URL from environment variable or use default
        const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.zascript.com";
        const response = await axios.post(
          `${API_URL}/api/ai-chat/chat`,
          {
            content: message, // Support legacy format
            messages: [
              {
                role: "user",
                content: message,
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000, // 10 second timeout
          }
        );

        const data = response.data;
        
        // Handle response format
        if (data.success && data.response) {
          // Panggil display function untuk menampilkan respon secara bertahap
          display(data.response);
        } else {
          throw new Error(data.error || "Failed to get response");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          setResponse(`Error: ${error.response.data.error}`);
        } else {
          setResponse("Sorry, there was an error processing your request. Please try again.");
        }
      } finally {
        setIsLoading(false);
        setMessage("");
      }
    }
  };

  // Fungsi untuk menampilkan respon secara bertahap (lebih cepat dengan chunk-based)
  const display = async (text: string) => {
    const chunkSize = 10; // Render 10 karakter sekaligus untuk lebih cepat
    
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);
      setResponse((prevResponse) => prevResponse + chunk);
      
      // Gunakan requestAnimationFrame untuk batch update yang lebih efisien
      // Ini akan sync dengan browser refresh rate (~60fps) untuk performa optimal
      if (i + chunkSize < text.length) {
        await new Promise((resolve) => {
          requestAnimationFrame(resolve);
        });
      }
    }
  };

  // Fungsi untuk parsing markdown sederhana
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];

    // Split text into lines untuk handle headings
    const lines = text.split('\n');
    
    lines.forEach((line, lineIndex) => {
      if (line.trim() === '') {
        parts.push(<br key={`br-${lineIndex}`} />);
        return;
      }

      // Check for heading first
      if (line.match(/^### /)) {
        const match = line.match(/^### (.+)$/);
        if (match) {
          parts.push(
            <h3 key={`h3-${lineIndex}`} className="text-base font-bold mt-2 mb-1 text-white">
              {parseMarkdownInline(match[1])}
            </h3>
          );
          return;
        }
      } else if (line.match(/^## /)) {
        const match = line.match(/^## (.+)$/);
        if (match) {
          parts.push(
            <h2 key={`h2-${lineIndex}`} className="text-lg font-bold mt-2 mb-1 text-white">
              {parseMarkdownInline(match[1])}
            </h2>
          );
          return;
        }
      } else if (line.match(/^# /)) {
        const match = line.match(/^# (.+)$/);
        if (match) {
          parts.push(
            <h1 key={`h1-${lineIndex}`} className="text-xl font-bold mt-2 mb-1 text-white">
              {parseMarkdownInline(match[1])}
            </h1>
          );
          return;
        }
      }

      // Parse inline markdown (bold, italic, code)
      parts.push(<span key={`line-${lineIndex}`}>{parseMarkdownInline(line)}</span>);
      
      // Add line break if not last line
      if (lineIndex < lines.length - 1) {
        parts.push(<br key={`br-after-${lineIndex}`} />);
      }
    });

    return parts;
  };

  // Fungsi untuk parsing inline markdown (bold, italic, code)
  const parseMarkdownInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let keyCounter = 0;

    // Regex untuk bold, italic, dan code
    const boldRegex = /\*\*(.+?)\*\*/g;
    const italicRegex = /\*(.+?)\*/g;
    const codeRegex = /`(.+?)`/g;

    // Collect all matches
    const matches: Array<{ start: number; end: number; type: string; content: string }> = [];
    
    let match;
    // Parse bold first
    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'bold',
        content: match[1]
      });
    }
    
    // Parse code
    codeRegex.lastIndex = 0;
    while ((match = codeRegex.exec(text)) !== null) {
      // Check if it overlaps with bold
      const isOverlapping = matches.some(m => 
        (match!.index >= m.start && match!.index < m.end) ||
        (match!.index + match![0].length > m.start && match!.index + match![0].length <= m.end)
      );
      if (!isOverlapping) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'code',
          content: match[1]
        });
      }
    }
    
    // Parse italic last (avoiding bold and code)
    italicRegex.lastIndex = 0;
    while ((match = italicRegex.exec(text)) !== null) {
      // Check if it's actually bold (check for ** before or after)
      const charBefore = match.index > 0 ? text[match.index - 1] : '';
      const charAfter = match.index + match[0].length < text.length ? text[match.index + match[0].length] : '';
      const isBold = (charBefore === '*' && text[match.index] === '*') || 
                     (charAfter === '*' && text[match.index + match[0].length - 1] === '*');
      if (isBold) continue;
      
      // Check if it overlaps with existing matches
      const isOverlapping = matches.some(m => 
        (match!.index >= m.start && match!.index < m.end) ||
        (match!.index + match![0].length > m.start && match!.index + match![0].length <= m.end)
      );
      if (!isOverlapping) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'italic',
          content: match[1]
        });
      }
    }

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);

    // Build parts
    matches.forEach((match) => {
      // Add text before match
      if (match.start > lastIndex) {
        const beforeText = text.substring(lastIndex, match.start);
        if (beforeText) {
          parts.push(beforeText);
        }
      }

      // Add formatted match
      if (match.type === 'bold') {
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-bold text-white">
            {match.content}
          </strong>
        );
      } else if (match.type === 'italic') {
        parts.push(
          <em key={`italic-${keyCounter++}`} className="italic">
            {match.content}
          </em>
        );
      } else if (match.type === 'code') {
        parts.push(
          <code key={`code-${keyCounter++}`} className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">
            {match.content}
          </code>
        );
      }

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <>
      <div
        className={`fixed bottom-28 right-10 ${
          isChatOpen ? "z-50" : "-z-50"
        } flex flex-col items-end`}
      >
        {/* Chat Window */}
        <div
          className={`transition-all transform duration-300 ${
            isChatOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
          } bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl rounded-2xl p-0 w-80 h-96 mb-4 flex flex-col justify-between relative border border-gray-700/50 overflow-hidden`}
          style={{
            visibility: isChatOpen ? "visible" : "hidden",
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Header */}
          <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 border-b border-gray-700/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-bold text-white text-sm">AI Assistant</h3>
                <span className="text-xs text-gray-400">Beta V1</span>
              </div>
              <button
                onClick={toggleChat}
                className="focus:outline-none text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-700"
                aria-label="Close chat"
              >
                <AiOutlineClose size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div
            ref={responseRef}
            className="relative flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-900/50"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 #1F2937'
            }}
          >
            {/* User Message */}
            {requestContent && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-lg">
                  <p className="text-sm break-words">{requestContent}</p>
                </div>
              </div>
            )}

            {/* AI Response */}
            {(response || isLoading) && (
              <div className="flex justify-start">
                <div className="bg-gray-800/80 text-gray-100 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] shadow-lg border border-gray-700/50">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Thinking</span>
                      <div className="flex gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm break-words whitespace-pre-wrap">
                      {parseMarkdown(response)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Welcome Message */}
            {!requestContent && !response && !isLoading && (
              <div className="flex justify-center items-center h-full">
                <div className="text-center text-gray-400">
                  <div className="mb-2">
                    <AiOutlineMessage size={32} className="mx-auto opacity-50" />
                  </div>
                  <p className="text-sm">Start a conversation with AI</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="relative bg-gray-800/80 px-4 py-3 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-gray-700/50 text-white placeholder-gray-400 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-600/50 focus:border-blue-500/50 transition-all text-sm"
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-20 right-7 z-50 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-xl shadow-2xl border border-gray-700/50 animate-pulse">
          <div className="flex items-center gap-2">
            <AiOutlineMessage size={16} className="text-blue-400" />
            <span className="text-sm font-medium">Let&rsquo;s try AI</span>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className={`fixed bottom-7 right-7 z-50 transition-transform duration-300 hover:scale-110`}>
        <button
          id="ai-response"
          onClick={toggleChat}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all relative overflow-hidden group"
          aria-label="Open chat"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <AiOutlineMessage size={24} className="relative z-10" />
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></span>
          )}
        </button>
      </div>
    </>
  );
};

export default ChatAiButton;
