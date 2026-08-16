import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  getUserConversations,
  getConversationById,
  sendMessage,
} from '../../services/conversation.service'
import { useAuthContext } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import type { ConversationItem, ConversationMessage } from '../../types/conversation'
import {
  MessageSquare,
  Send,
  Loader2,
  Package,
  CheckCheck,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const { user } = useAuthContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeConversationId = searchParams.get('conversationId')

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load conversations list
  const loadConversations = async () => {
    try {
      const data = await getUserConversations()
      setConversations(data)

      // If activeConversationId is not specified and we have conversations, select the first one on desktop
      if (!activeConversationId && data.length > 0 && window.innerWidth >= 768) {
        setSearchParams({ conversationId: data[0].id })
      }
    } catch {
      toast.error('Failed to load conversations.')
    } finally {
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  // Load active conversation details when activeConversationId changes
  useEffect(() => {
    if (!activeConversationId) {
      setSelectedConversation(null)
      setMessages([])
      return
    }

    async function loadThread() {
      setIsLoadingDetails(true)
      try {
        const conv = await getConversationById(activeConversationId!)
        setSelectedConversation(conv)
        setMessages(conv.messages || [])
        setTimeout(scrollToBottom, 100)
      } catch {
        toast.error('Could not load conversation details.')
      } finally {
        setIsLoadingDetails(false)
      }
    }

    loadThread()
  }, [activeConversationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeConversationId || !newMessage.trim() || isSending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    // Optimistic message append
    const tempId = `temp-${Date.now()}`
    const optimisticMsg: ConversationMessage = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: user?.id || '',
      content: messageText,
      isRead: false,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticMsg])
    setTimeout(scrollToBottom, 50)

    try {
      const savedMessage = await sendMessage(activeConversationId, messageText)
      // Replace temporary message with server message
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? savedMessage : msg)),
      )
      loadConversations() // update snippet in left panel
    } catch {
      toast.error('Failed to send message.')
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-600" />
            Messages
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Communicate securely with buyers and sellers about marketplace items
          </p>
        </div>

        {/* Messaging Container */}
        <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] h-[75vh]">
          {/* Left Panel: Conversation List (4 cols on desktop) */}
          <div
            className={`md:col-span-4 lg:col-span-4 border-r border-stone-200 flex flex-col ${
              activeConversationId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b border-stone-100 bg-stone-50/50">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Conversations ({conversations.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {isLoadingList ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-stone-800">No messages yet</p>
                  <p className="text-[11px] text-stone-500">
                    When you contact a seller on a listing, your conversations will appear here.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = conv.id === activeConversationId
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSearchParams({ conversationId: conv.id })}
                      className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                        isSelected ? 'bg-amber-50/80 border-l-4 border-amber-600' : 'hover:bg-stone-50'
                      }`}
                    >
                      <img
                        src={conv.listing?.image || '/placeholder.png'}
                        alt={conv.listing?.title}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {conv.otherParty.displayName || conv.otherParty.fullName}
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap">
                            {new Date(conv.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-amber-700 truncate">
                          {conv.listing?.title}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {conv.lastMessage?.content || 'Started conversation'}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Thread (8 cols on desktop) */}
          <div
            className={`md:col-span-8 lg:col-span-8 flex flex-col ${
              !activeConversationId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConversationId && selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSearchParams({})}
                      className="md:hidden p-1.5 rounded-xl bg-white border border-stone-200 text-stone-700"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {selectedConversation.otherParty?.fullName?.charAt(0) || 'U'}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {selectedConversation.otherParty?.displayName || selectedConversation.otherParty?.fullName}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate">
                        Inquiry for{' '}
                        <span className="font-semibold text-amber-700">
                          {selectedConversation.listing?.title}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/listings/${selectedConversation.listingId}`}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1 shadow-2xs whitespace-nowrap"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">View Listing</span>
                  </Link>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/30">
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-xs text-stone-400">
                      No messages yet in this conversation.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-2xs leading-relaxed ${
                              isMe
                                ? 'bg-amber-600 text-white rounded-br-xs'
                                : 'bg-white border border-stone-200 text-stone-900 rounded-bl-xs'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-stone-400 mt-1 px-1 flex items-center gap-1 font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {isMe && <CheckCheck className="w-3 h-3 text-amber-600" />}
                          </span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Send Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-stone-200 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-stone-100 border border-transparent rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 disabled:opacity-50 transition-all"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-stone-400">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center text-stone-400">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-stone-700">Select a conversation</h4>
                <p className="text-xs text-stone-400 max-w-xs">
                  Choose a chat thread from the left panel to message the buyer or seller.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
