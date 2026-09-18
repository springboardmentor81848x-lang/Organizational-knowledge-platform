import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";

import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Award,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function Messages() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const navigate = useNavigate();

  const [activeChats, setActiveChats] =
    useState([]);

  const [selectedChat, setSelectedChat] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [newMessage, setNewMessage] =
    useState("");

  const [loadingChats, setLoadingChats] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef(null);

  const chatInputRef =
    useRef(null);

  const employeeId =
    localStorage.getItem("employeeId") || "";

  const currentRole =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "EMPLOYEE";

  const requestedMentorshipId =
    searchParams.get("mentorshipId");

  // =========================================================
  // SCROLL TO BOTTOM
  // =========================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // =========================================================
  // 1. FETCH ACTIVE CHATS
  // =========================================================

  const fetchActiveChats = async (
    selectMentorshipId = null
  ) => {
    if (!employeeId) {
      setLoadingChats(false);
      return;
    }

    try {
      const response = await api.get(
        `/messages/active-chats/${employeeId}`
      );

      const chats = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      setActiveChats(chats);

      // Determine which chat to select
      const targetId =
        selectMentorshipId ||
        requestedMentorshipId;

      if (
        targetId &&
        chats.length > 0
      ) {
        const found = chats.find(
          (c) =>
            String(c.mentorshipId) ===
            String(targetId)
        );

        if (found) {
          setSelectedChat(found);
        } else if (
          !selectedChat &&
          chats.length > 0
        ) {
          setSelectedChat(chats[0]);
        }
      } else if (
        !selectedChat &&
        chats.length > 0
      ) {
        setSelectedChat(chats[0]);
      }
    } catch (err) {
      console.error(
        "Error loading active chats:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load active chats."
      );
    } finally {
      setLoadingChats(false);
    }
  };

  // =========================================================
  // 2. FETCH MESSAGES
  // =========================================================

  const fetchMessages = async (
    mentorshipId,
    isBackground = false
  ) => {
    if (!mentorshipId) {
      return;
    }

    try {
      if (!isBackground) {
        setLoadingMessages(true);
      }

      const response = await api.get(
        `/messages/mentorship/${mentorshipId}`,
        {
          params: {
            employeeId,
          },
        }
      );

      const list = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      setMessages(list);

      if (!isBackground) {
        setTimeout(
          scrollToBottom,
          100
        );
      }
    } catch (err) {
      console.error(
        "Error fetching messages:",
        err
      );

      if (!isBackground) {
        setError(
          err.response?.data?.message ||
            err.response?.data ||
            "Failed to load messages."
        );
      }
    } finally {
      if (!isBackground) {
        setLoadingMessages(false);
      }
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchActiveChats(
      requestedMentorshipId
    );
  }, [
    employeeId,
    requestedMentorshipId,
  ]);

  // =========================================================
  // WHEN SELECTED CHAT CHANGES
  // =========================================================

  useEffect(() => {
    if (
      selectedChat?.mentorshipId
    ) {
      setError("");

      fetchMessages(
        selectedChat.mentorshipId
      );

      // Sync URL query parameter
      setSearchParams(
        {
          mentorshipId: String(
            selectedChat.mentorshipId
          ),
        },
        {
          replace: true,
        }
      );
    } else {
      setMessages([]);
    }
  }, [
    selectedChat?.mentorshipId,
  ]);

  // =========================================================
  // POLLING FOR NEW MESSAGES
  // =========================================================

  useEffect(() => {
    if (
      !selectedChat?.mentorshipId
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        fetchMessages(
          selectedChat.mentorshipId,
          true
        );
      }, 3500);

    return () =>
      clearInterval(interval);
  }, [
    selectedChat?.mentorshipId,
  ]);

  // =========================================================
  // SCROLL WHEN MESSAGE COUNT CHANGES
  // =========================================================

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // =========================================================
  // 3. SEND MESSAGE
  // =========================================================

  const handleSendMessage = async (
    e
  ) => {
    if (e) {
      e.preventDefault();
    }

    if (
      !newMessage.trim() ||
      !selectedChat ||
      sending
    ) {
      return;
    }

    const messageText =
      newMessage.trim();

    setNewMessage("");
    setSending(true);
    setError("");

    try {
      const payload = {
        mentorshipId:
          selectedChat.mentorshipId,

        senderEmployeeId:
          employeeId,

        message:
          messageText,
      };

      const response =
        await api.post(
          "/messages",
          payload
        );

      if (response.data) {
        setMessages(
          (prev) => [
            ...prev,
            response.data,
          ]
        );

        setTimeout(
          scrollToBottom,
          50
        );

        // Refresh chat list snippet
        fetchActiveChats(
          selectedChat.mentorshipId
        );
      }
    } catch (err) {
      console.error(
        "Error sending message:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to send message. Peer mentorship must be accepted."
      );

      // Put message back if failed
      setNewMessage(
        messageText
      );
    } finally {
      setSending(false);

      chatInputRef.current?.focus();
    }
  };

  // =========================================================
  // ENTER KEY HANDLER
  // =========================================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // =========================================================
  // FILTERED CHATS
  // =========================================================

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeChats;
    }

    const q =
      searchQuery.toLowerCase();

    return activeChats.filter(
      (c) =>
        (
          c.peerName &&
          c.peerName
            .toLowerCase()
            .includes(q)
        ) ||
        (
          c.skillName &&
          c.skillName
            .toLowerCase()
            .includes(q)
        ) ||
        (
          c.peerEmployeeId &&
          c.peerEmployeeId
            .toLowerCase()
            .includes(q)
        )
    );
  }, [
    activeChats,
    searchQuery,
  ]);

  // =========================================================
  // FORMAT MESSAGE TIME
  // =========================================================

  const formatMessageTime = (
    dateString
  ) => {
    if (!dateString) {
      return "";
    }

    const date =
      new Date(dateString);

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // FORMAT CHAT DATE
  // =========================================================

  const formatChatDate = (
    dateString
  ) => {
    if (!dateString) {
      return "";
    }

    const date =
      new Date(dateString);

    const today =
      new Date();

    const isToday =
      date.getDate() ===
        today.getDate() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getFullYear() ===
        today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    return date.toLocaleDateString(
      [],
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden">
      <Sidebar role={currentRole} />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar title="Peer Mentoring Chat" />

        {/* Main Messenger Layout */}

        <div className="flex-1 flex overflow-hidden p-4 md:p-6">
          <div className="flex-1 flex bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden">

            {/* ========================================================
                LEFT PANEL: ACTIVE PEER CHATS
            ======================================================== */}

            <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/60 shrink-0">

              {/* Header */}

              <div className="p-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <MessageSquare size={18} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        Peer Messages
                      </h2>

                      <p className="text-[11px] text-slate-500">
                        Accepted Mentorship Chats
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      fetchActiveChats(
                        selectedChat?.mentorshipId
                      )
                    }
                    title="Refresh Chats"
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>

                {/* Search */}

                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    placeholder="Search chats by peer or skill..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Chat List Items */}

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {loadingChats ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                    <RefreshCw
                      size={20}
                      className="animate-spin text-blue-600"
                    />

                    <span>
                      Loading active peer chats...
                    </span>
                  </div>
                ) : filteredChats.length ===
                  0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <UserCheck
                      size={36}
                      className="mx-auto text-slate-300 mb-2"
                    />

                    <p className="text-xs font-semibold text-slate-700">
                      No active chats found
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                      Messaging is unlocked when a peer mentorship request is accepted.
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          "/expert-directory"
                        )
                      }
                      className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
                    >
                      Find Experts
                    </button>
                  </div>
                ) : (
                  filteredChats.map(
                    (chat) => {
                      const isSelected =
                        selectedChat?.mentorshipId ===
                        chat.mentorshipId;

                      const peerInitials =
                        chat.peerName
                          ? chat.peerName
                              .split(" ")
                              .map(
                                (n) =>
                                  n[0]
                              )
                              .slice(
                                0,
                                2
                              )
                              .join("")
                              .toUpperCase()
                          : "P";

                      return (
                        <button
                          key={
                            chat.mentorshipId
                          }
                          onClick={() =>
                            setSelectedChat(
                              chat
                            )
                          }
                          className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                            isSelected
                              ? "bg-blue-50/90 border-l-4 border-l-blue-600"
                              : "hover:bg-white bg-transparent"
                          }`}
                        >
                          {/* Avatar */}

                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                              {peerInitials}
                            </div>

                            <span
                              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                              title="Active Peer"
                            />
                          </div>

                          {/* Details */}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {
                                  chat.peerName
                                }
                              </h4>

                              {chat.lastMessageTime && (
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {formatChatDate(
                                    chat.lastMessageTime
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Skill & Role */}

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-700 text-[10px] font-semibold truncate max-w-[150px]">
                                <Award size={10} />

                                {chat.skillName}
                              </span>

                              <span className="text-[10px] font-medium text-slate-400">
                                {chat.isCurrentUserMentor
                                  ? "Mentee"
                                  : "Mentor"}
                              </span>
                            </div>

                            {/* Last message */}

                            <div className="flex items-center justify-between gap-2 mt-1">
                              <p className="text-[11px] text-slate-500 truncate">
                                {chat.lastMessage ||
                                  "No messages yet"}
                              </p>

                              {chat.unreadCount >
                                0 && (
                                <span className="shrink-0 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                                  {
                                    chat.unreadCount
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )
                )}
              </div>
            </div>

            {/* ========================================================
                RIGHT PANEL: CHAT WINDOW
            ======================================================== */}

            <div className="flex-1 flex flex-col bg-[#efeae2]/30 min-w-0 relative">
              {selectedChat ? (
                <>
                  {/* Chat Top Header */}

                  <div className="p-3.5 md:p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                        {selectedChat.peerName
                          ? selectedChat.peerName
                              .split(" ")
                              .map(
                                (n) =>
                                  n[0]
                              )
                              .slice(
                                0,
                                2
                              )
                              .join("")
                              .toUpperCase()
                          : "P"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm truncate">
                            Chat with{" "}
                            {
                              selectedChat.peerName
                            }
                          </h3>

                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                            <ShieldCheck
                              size={11}
                            />{" "}
                            Accepted
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-blue-700">
                            {
                              selectedChat.skillName
                            }{" "}
                            Mentoring
                          </span>

                          <span>•</span>

                          <span>
                            {selectedChat.peerDesignation ||
                              "Peer Expert"}
                          </span>

                          {selectedChat.peerDepartment && (
                            <>
                              <span>•</span>

                              <span>
                                {
                                  selectedChat.peerDepartment
                                }
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            "/peer-mentoring"
                          )
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        Peer Mentoring Home
                      </button>
                    </div>
                  </div>

                  {/* Error banner */}

                  {error && (
                    <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center justify-between">
                      <span>{error}</span>

                      <button
                        onClick={() =>
                          setError("")
                        }
                        className="font-bold ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Message Thread */}

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">

                    {/* Security Notice */}

                    <div className="flex justify-center my-2">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center text-[11px] text-amber-800 shadow-sm max-w-md">
                        🔒 Peer mentoring chat for{" "}
                        <strong>
                          {
                            selectedChat.skillName
                          }
                        </strong>{" "}
                        is active and secured. You and{" "}
                        <strong>
                          {
                            selectedChat.peerName
                          }
                        </strong>{" "}
                        can now exchange mentoring advice and questions.
                      </div>
                    </div>

                    {loadingMessages ? (
                      <div className="flex justify-center p-8">
                        <RefreshCw
                          size={24}
                          className="animate-spin text-blue-600"
                        />
                      </div>
                    ) : messages.length ===
                      0 ? (
                      <div className="text-center py-12">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-blue-600 shadow-sm mb-3">
                          <MessageSquare
                            size={24}
                          />
                        </div>

                        <h4 className="text-sm font-bold text-slate-800">
                          No messages yet
                        </h4>

                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Start the conversation with{" "}
                          {
                            selectedChat.peerName
                          }{" "}
                          by asking a question or introducing your learning goals!
                        </p>
                      </div>
                    ) : (
                      messages.map(
                        (msg, index) => {
                          const isMe =
                            String(
                              msg.senderEmployeeId
                            ) ===
                              String(
                                employeeId
                              ) ||
                            String(
                              msg.senderId
                            ) ===
                              String(
                                localStorage.getItem(
                                  "userId"
                                )
                              );

                          return (
                            <div
                              key={
                                msg.id ||
                                index
                              }
                              className={`flex flex-col ${
                                isMe
                                  ? "items-end"
                                  : "items-start"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm relative group ${
                                  isMe
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                                }`}
                              >
                                {/* Sender label */}

                                {!isMe && (
                                  <p className="text-[11px] font-bold text-blue-600 mb-0.5">
                                    {msg.senderName ||
                                      selectedChat.peerName}
                                  </p>
                                )}

                                {/* Message text */}

                                <p className="whitespace-pre-wrap leading-relaxed break-words text-[13px] md:text-sm">
                                  {
                                    msg.message
                                  }
                                </p>

                                {/* Timestamp */}

                                <div
                                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                                    isMe
                                      ? "text-blue-100"
                                      : "text-slate-400"
                                  }`}
                                >
                                  <span>
                                    {formatMessageTime(
                                      msg.sentAt
                                    )}
                                  </span>

                                  {isMe && (
                                    <CheckCheck
                                      size={
                                        13
                                      }
                                      className={
                                        msg.readStatus
                                          ? "text-emerald-300"
                                          : "text-blue-200"
                                      }
                                      title={
                                        msg.readStatus
                                          ? "Read"
                                          : "Delivered"
                                      }
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )
                    )}

                    <div
                      ref={
                        messagesEndRef
                      }
                    />
                  </div>

                  {/* Input Bar */}

                  <div className="p-3 md:p-4 bg-white border-t border-slate-200">
                    <form
                      onSubmit={
                        handleSendMessage
                      }
                      className="flex items-center gap-2 md:gap-3"
                    >
                      <div className="flex-1 relative">
                        <textarea
                          ref={
                            chatInputRef
                          }
                          rows={1}
                          value={
                            newMessage
                          }
                          onChange={(e) =>
                            setNewMessage(
                              e.target.value
                            )
                          }
                          onKeyDown={
                            handleKeyDown
                          }
                          placeholder="Type a message... (Press Enter to send)"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none max-h-32"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={
                          !newMessage.trim() ||
                          sending
                        }
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {sending ? (
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <>
                            <span>
                              Send
                            </span>

                            <Send
                              size={15}
                            />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-[10px] text-slate-400 mt-1 pl-2">
                      Tip: Press{" "}
                      <kbd className="bg-slate-100 px-1 rounded border">
                        Enter
                      </kbd>{" "}
                      to send, or{" "}
                      <kbd className="bg-slate-100 px-1 rounded border">
                        Shift + Enter
                      </kbd>{" "}
                      for a new line.
                    </p>
                  </div>
                </>
              ) : (
                /* No Chat Selected State */

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm mb-4">
                    <MessageSquare
                      size={32}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Peer Mentorship Messaging
                  </h3>

                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Select an active conversation on the left to start chatting with your mentor or mentee.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}