import { useState, useEffect, useRef } from 'react';

export function useProjectChat(user: any) {
  const [activeChatRequest, setActiveChatRequest] = useState<any | null>(null);
  const [chatSessions, setChatSessions] = useState<Record<string, {id: string, text: string, senderId: string, timestamp: Date}[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const EMPTY_MESSAGES: any[] = [];
  const activeMessages = activeChatRequest ? chatSessions[activeChatRequest.id || ""] || EMPTY_MESSAGES : EMPTY_MESSAGES;

  useEffect(() => {
    if (activeChatRequest) {
      const chatId = activeChatRequest.id || "";
      if (!chatSessions[chatId]) {
        setChatSessions(prev => ({
          ...prev,
          [chatId]: [
            {
              id: "initial",
              text: activeChatRequest.message,
              senderId: activeChatRequest.investorId,
              timestamp: new Date()
            }
          ]
        }));
      }
      setChatInput("");
    }
  }, [activeChatRequest, chatSessions]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessages, activeChatRequest]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user || !activeChatRequest || sendingMsg) return;
    setSendingMsg(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newMsg = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      senderId: user.uid,
      timestamp: new Date()
    };
    
    const chatId = activeChatRequest.id || "";
    setChatSessions(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg]
    }));
    
    setChatInput("");
    setSendingMsg(false);
  };

  return {
    activeChatRequest,
    setActiveChatRequest,
    chatInput,
    setChatInput,
    sendingMsg,
    activeMessages,
    handleSendMessage,
    messagesEndRef,
    attachments,
    setAttachments,
    fileInputRef
  };
}
