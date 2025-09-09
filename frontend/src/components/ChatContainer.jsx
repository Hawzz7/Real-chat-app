import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

import { summarizeChat } from "../lib/geminiApi";
import SummaryModal from "./SummaryModal";
import PollCard from "./PollCard";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndReff = useRef(null);

  // In use for Ai summaristion
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndReff.current && messages) {
      messageEndReff.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  // this is for the summary button which is using the gemini api
  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      setSummary(""); // clear old summary
      const chatTexts = messages.map((m) => m.text).filter(Boolean); // only text
      const result = await summarizeChat(chatTexts);
      setSummary(result);
      setShowSummary(true);
    } catch (error) {
      console.error("Summarization failed", error);
      setSummary("Failed to generate summary.");
      setShowSummary(true);
    } finally {
      setIsSummarizing(false);
    }
  };
  // ----------------------------------------------------

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  console.log("message: ", messages);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Summarization Button */}
      <div className="px-4 py-2 border-b flex items-center gap-2">
        <button
          onClick={handleSummarize}
          className="btn btn-sm"
          disabled={isSummarizing}
        >
          {isSummarizing ? "Summarizing..." : "Summarize Chat"}
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndReff}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile-pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.type === "poll" ? (
                <PollCard poll={message.poll} />
              ) : (
                message.text && <p>{message.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Modal */}
      <SummaryModal
        show={showSummary}
        onClose={() => {
          setShowSummary(false);
          setSummary("");
        }}
        summary={summary}
      />
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
