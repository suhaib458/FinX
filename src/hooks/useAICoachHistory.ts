import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, orderBy, deleteDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { ChatMessage } from "../types";

export function useAICoachHistory(
  activeConversationId: string | null,
  setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  chatGreeting: string,
  isMobile: boolean
) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const fetchConversations = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, "conversations"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("updatedAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const convos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(convos);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const createNewChat = () => {
    setActiveConversationId(null);
    setMessages([
      {
        id: "greet",
        role: "assistant",
        content: chatGreeting,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    if (isMobile) setShowHistorySidebar(false);
  };

  const saveConversation = async (msgs: ChatMessage[]) => {
    if (!auth.currentUser) return;
    try {
      if (activeConversationId) {
        if (msgs.length === 0) {
          await deleteDoc(doc(db, "conversations", activeConversationId));
          fetchConversations();
          createNewChat();
        } else {
          await updateDoc(doc(db, "conversations", activeConversationId), {
            messages: msgs,
            lastMessagePreview: msgs[msgs.length - 1].content.substring(
              0,
              Math.min(50, msgs[msgs.length - 1].content.length),
            ),
            updatedAt: serverTimestamp(),
          });
          fetchConversations();
        }
      } else if (msgs.length > 1) {
        const firstUserMsg = msgs.find((m) => m.role === "user");
        const title = firstUserMsg
          ? firstUserMsg.content.substring(0, 30)
          : "New Chat";
        const newDoc = await addDoc(collection(db, "conversations"), {
          userId: auth.currentUser.uid,
          title,
          messages: msgs,
          lastMessagePreview: msgs[msgs.length - 1].content.substring(
            0,
            Math.min(50, msgs[msgs.length - 1].content.length),
          ),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setActiveConversationId(newDoc.id);
        fetchConversations();
      }
    } catch (err) {
      console.error("Error saving conversation:", err);
      throw err;
    }
  };

  const loadConversation = (convo: any) => {
    setActiveConversationId(convo.id);
    setMessages(convo.messages || []);
  };

  const deleteConversation = async (id: string) => {
    try {
      await deleteDoc(doc(db, "conversations", id));
      if (activeConversationId === id) {
        createNewChat();
      } else {
        fetchConversations();
      }
      setConversationToDelete(null);
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const executeDeleteAllConversations = async () => {
    try {
      setShowClearAllConfirm(false);
      await Promise.all(conversations.map(c => deleteDoc(doc(db, "conversations", c.id))));
      setConversations([]);
      createNewChat();
    } catch (err) {
      console.error("Error deleting all chats:", err);
    }
  };

  return {
    conversations,
    showHistorySidebar,
    setShowHistorySidebar,
    conversationToDelete,
    setConversationToDelete,
    showClearAllConfirm,
    setShowClearAllConfirm,
    createNewChat,
    saveConversation,
    loadConversation,
    deleteConversation,
    executeDeleteAllConversations
  };
}
