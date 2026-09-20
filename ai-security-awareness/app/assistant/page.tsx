"use client"

import { useState, useRef, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { aiAssistantMockResponses } from "@/lib/mock-data"
import { Bot, User, Send, Plus, MessageSquare, MoreHorizontal, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  timestamp: string
}

// Initial mock chat history
const mockHistory: ChatSession[] = [
  {
    id: "chat-1",
    title: "Analisis Phishing Email",
    timestamp: "2 jam yang lalu",
    messages: [
      { id: "m1", role: "user", content: "Bagaimana cara mendeteksi email phishing?" },
      { id: "m2", role: "ai", content: aiAssistantMockResponses["phishing"] }
    ]
  },
  {
    id: "chat-2",
    title: "Tanya Jawab Deepfake",
    timestamp: "Kemarin",
    messages: [
      { id: "m3", role: "user", content: "Jelaskan tentang deepfake" },
      { id: "m4", role: "ai", content: aiAssistantMockResponses["deepfake"] }
    ]
  }
]

const suggestedPrompts = [
  "Apa itu prompt injection?",
  "Bagaimana cara mendeteksi email phishing?",
  "Jelaskan tentang deepfake"
]

export default function AssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(mockHistory)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get active session or return empty state
  const activeSession = sessions.find(s => s.id === activeSessionId)
  const messages = activeSession?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const startNewChat = () => {
    setActiveSessionId(null)
    setInputValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleSend = (text: string = inputValue) => {
    const trimmedText = text.trim()
    if (!trimmedText || isTyping) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmedText }
    
    let currentSessionId = activeSessionId
    let newSessions = [...sessions]

    if (!currentSessionId) {
      // Create new session
      currentSessionId = `chat-${Date.now()}`
      const newSession: ChatSession = {
        id: currentSessionId,
        title: trimmedText.length > 30 ? trimmedText.substring(0, 30) + "..." : trimmedText,
        timestamp: "Baru saja",
        messages: [userMsg]
      }
      newSessions = [newSession, ...newSessions]
      setSessions(newSessions)
      setActiveSessionId(currentSessionId)
    } else {
      // Update existing session
      newSessions = newSessions.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, userMsg] }
        }
        return s
      })
      setSessions(newSessions)
    }

    setInputValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
    setIsTyping(true)

    // Simulate AI thinking and response mapping
    setTimeout(() => {
      // Simple keyword matching
      let responseText = aiAssistantMockResponses["default"]
      const lowerText = trimmedText.toLowerCase()
      
      if (lowerText.includes("phishing")) responseText = aiAssistantMockResponses["phishing"]
      else if (lowerText.includes("prompt injection")) responseText = aiAssistantMockResponses["prompt injection"]
      else if (lowerText.includes("deepfake")) responseText = aiAssistantMockResponses["deepfake"]
      else if (lowerText.includes("ransomware")) responseText = aiAssistantMockResponses["ransomware"]

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: responseText }
      
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, aiMsg] }
        }
        return s
      }))
      
      setIsTyping(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Simple Markdown Renderer
  const formatMarkdown = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code class="bg-black/30 px-1.5 py-0.5 rounded text-sm font-mono text-accent/90">$1</code>')
      // Handling simple lists by adding a bullet and line break
      .replace(/\n- (.*?)/g, '<br/><span class="text-primary mr-1">•</span> $1')
      // Handling double breaks as paragraphs
      .replace(/\n\n/g, '<br/><br/>')
      // Handling single breaks
      .replace(/\n/g, '<br/>')
      
    return { __html: html }
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex -mx-6 -mt-6">
        
        {/* Inner Sidebar */}
        <div className="w-[280px] bg-card border-r border-border hidden md:flex flex-col">
          <div className="p-4 border-b border-border">
            <Button onClick={startNewChat} className="w-full gap-2 justify-start font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              <Plus className="h-4 w-4" />
              Percakapan Baru
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1">Riwayat</h3>
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex flex-col gap-1 transition-colors ${
                  activeSessionId === session.id 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="text-sm font-medium truncate">{session.title}</span>
                </div>
                <span className="text-[10px] pl-6 opacity-60">{session.timestamp}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background min-w-0 relative">
          {/* Header */}
          <div className="h-14 border-b border-border flex items-center px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <h2 className="font-semibold text-foreground flex items-center gap-2 truncate">
              {activeSession ? (
                <>
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {activeSession.title}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-primary" />
                  Percakapan Baru
                </>
              )}
            </h2>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Halo, saya AI Security Assistant.</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Saya di sini untuk membantu menjawab pertanyaan Anda terkait konsep keamanan siber, ancaman AI, dan praktik terbaik SOC.
                </p>
                
                <div className="grid grid-cols-1 gap-2 w-full max-w-md mt-8">
                  {suggestedPrompts.map((prompt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="px-4 py-3 bg-card border border-border hover:border-primary/50 hover:bg-secondary/50 rounded-xl text-sm text-left transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className="text-muted-foreground group-hover:text-foreground">{prompt}</span>
                      <Send className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "ai" && (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {msg.role === "ai" ? (
                        <div dangerouslySetInnerHTML={formatMarkdown(msg.content)} className="space-y-2" />
                      ) : (
                        <div>{msg.content}</div>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-4 justify-start">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5 w-fit">
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-background">
            <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Tanya sesuatu ke AI Assistant..."
                className="flex-1 max-h-[120px] min-h-[44px] bg-transparent resize-none border-none outline-none py-3 px-3 text-sm scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                rows={1}
                disabled={isTyping}
              />
              <Button 
                size="icon" 
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 mb-0.5 mr-0.5"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center mt-3 text-[10px] text-muted-foreground">
              AI dapat membuat kesalahan. Harap verifikasi informasi keamanan secara mandiri.
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  )
}
