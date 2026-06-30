import React from 'react';
import { Bot, User, Check, RefreshCcw, CheckSquare, Copy, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Avatar from './Avatar';
import { auth } from '../lib/firebase';
import { ChatMessage } from '../types';

interface ChatMessageItemProps {
  msg: ChatMessage;
  isUser: boolean;
  isSelected: boolean;
  isRtl: boolean;
  selectionMode: boolean;
  copiedMessageId: string | null;
  toggleMessageSelection: (id: string) => void;
  copyMessage: (msg: ChatMessage) => void;
  setMessageToDelete: (id: string) => void;
  handleSend: (text: string) => void;
  setAttachments: (attachments: any[]) => void;
  getMarkdownComponents: (msg: ChatMessage) => any;
  setSelectionMode: (val: boolean) => void;
}

const ChatMessageItem = ({
  msg,
  isUser,
  isSelected,
  isRtl,
  selectionMode,
  copiedMessageId,
  toggleMessageSelection,
  copyMessage,
  setMessageToDelete,
  handleSend,
  setAttachments,
  getMarkdownComponents,
  setSelectionMode
}: ChatMessageItemProps) => {
  return (
    <div
      tabIndex={0}
      className={`flex w-full group items-start gap-2 focus:outline-none ${isUser ? (isRtl ? "justify-end flex-row" : "justify-end flex-row-reverse") : "justify-start"}`}
    >
      {selectionMode && msg.id !== "greet" && (
        <button
          onClick={() => toggleMessageSelection(msg.id)}
          className={`mt-2 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-indigo-500 border-indigo-500" : "border-slate-600 bg-transparent"}`}
        >
          {isSelected && <Check className="w-3 h-3 text-text-primary" />}
        </button>
      )}

      <div
        className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isSelected ? "opacity-80" : ""}`}
      >
        {/* Profile Avatar indicator */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
            isUser
              ? "bg-surface-primary border-none text-indigo-600 dark:text-indigo-400"
              : "bg-indigo-950/30 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
          }`}
        >
          {isUser && auth.currentUser ? (
            <Avatar
              uid={auth.currentUser.uid}
              className="w-8 h-8"
              iconClassName="w-4 h-4"
            />
          ) : isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4.5 h-4.5" />
          )}
        </div>

        {/* Text Bubble */}
        <div className="space-y-1 min-w-0 flex-1">
          <div
            className={`p-3.5 rounded-2xl text-[12.5px] shadow-sm leading-relaxed break-words select-text selection:bg-indigo-500/30 selection:text-text-primary ${
              isUser
                ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-500 shadow-md shadow-indigo-500/10"
                : "bg-surface-primary text-text-primary border border-border-primary rounded-tl-none markdown-container"
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            ) : msg.content.includes("CV analysis in progress") || msg.content.includes("جاري تحليل السيرة الذاتية") ? (
              <div className="flex items-center gap-3 py-1">
                <div className="flex gap-1.5 h-4 items-center pl-1">
                  <span className="w-1 bg-indigo-500 h-full animate-bounce rounded-full" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1 bg-indigo-500 h-3/4 animate-bounce rounded-full" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1 bg-indigo-500 h-full animate-bounce rounded-full" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight text-[13px]">{msg.content}</span>
              </div>
            ) : (
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={getMarkdownComponents(msg)}
              >
                {(() => {
                   let content = msg.content;
                   if (!content.includes('\`\`\`')) {
                      content = content.replace(/(\{\s*"title"[\s\S]*?\})/g, "\n\n\`\`\`json\n$1\n\`\`\`\n\n");
                      content = content.replace(/(\[\s*\{\s*"title"[\s\S]*?\}\s*\])/g, "\n\n\`\`\`json\n$1\n\`\`\`\n\n");
                   }
                   return content;
                })()}
              </Markdown>
            )}
          </div>
          <div
            className={`flex items-center gap-2 text-[8.5px] text-text-primary dark:text-text-secondary block ${isUser ? "justify-end" : "justify-start"}`}
          >
            <span>{msg.timestamp}</span>
            {copiedMessageId === msg.id && (
              <span className="text-accent-green flex items-center gap-0.5">
                <Check className="w-3 h-3" />{" "}
                {/* Copied label text passed as prop if needed, or simple localization block?
                    Wait, let's hardcode or pass translated string. Let's pass copiedText prop.
                    Ah, I will pass `copiedText` from parent. */}
                {isRtl ? "تم النسخ" : "Copied"}
              </span>
            )}
          </div>
          {msg.isError && msg.rawPrompt !== undefined && (
            <div className={`flex ${isRtl ? "justify-start" : "justify-start"}`}>
              <button
                onClick={() => {
                  if (msg.rawAttachments) {
                    setAttachments(msg.rawAttachments);
                  }
                  handleSend(msg.rawPrompt || "");
                }}
                className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                {isRtl ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hover Actions (Desktop) / Visible on selection mode */}
      {!selectionMode && (
        <div
          className={`opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-0.5 mt-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
        >
          <button
            onClick={() => {
              setSelectionMode(true);
              toggleMessageSelection(msg.id);
            }}
            className="p-1.5 rounded-md hover:bg-bg-secondary text-text-primary dark:text-text-secondary hover:text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => copyMessage(msg)}
            className="p-1.5 rounded-md hover:bg-bg-secondary text-text-primary dark:text-text-secondary hover:text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {msg.id !== "greet" && (
            <button
              onClick={() => setMessageToDelete(msg.id)}
              className="p-1.5 rounded-md hover:bg-bg-secondary text-text-primary dark:text-text-secondary hover:text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const areEqual = (prevProps: ChatMessageItemProps, nextProps: ChatMessageItemProps) => {
  return (
    prevProps.msg === nextProps.msg &&
    prevProps.isUser === nextProps.isUser &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isRtl === nextProps.isRtl &&
    prevProps.selectionMode === nextProps.selectionMode &&
    prevProps.copiedMessageId === nextProps.copiedMessageId
  );
};

export default React.memo(ChatMessageItem, areEqual);
