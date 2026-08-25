import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { WorkspaceHeader } from '../../components/layout/WorkspaceHeader'
import { ConversationList } from '../../components/messaging/ConversationList'
import { ChatWindow } from '../../components/messaging/ChatWindow'
import * as convService from '../../services/conversation.service'
import type { ConversationItem } from '../../types/conversation'
import { MessageSquare, Loader2 } from 'lucide-react'

export default function MessagesPage() {
  const { user } = useAuthContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeConversationId = searchParams.get('conversationId')

  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null)
  const [isLoadingConv, setIsLoadingConv] = useState(false)

  // When activeConversationId changes in URL, fetch or update the active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setActiveConversation(null)
      return
    }

    if (activeConversation && activeConversation.id === activeConversationId) {
      return
    }

    let isCancelled = false
    setIsLoadingConv(true)

    convService
      .getConversationById(activeConversationId)
      .then((conv) => {
        if (!isCancelled) {
          setActiveConversation(conv)
          setIsLoadingConv(false)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIsLoadingConv(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [activeConversationId, activeConversation])

  const handleSelectConversation = (conv: ConversationItem) => {
    setActiveConversation(conv)
    setSearchParams({ conversationId: conv.id })
  }

  const handleBackToList = () => {
    setActiveConversation(null)
    setSearchParams({})
  }

  return (
    <div className="h-screen flex flex-col bg-stone-100 text-stone-900 overflow-hidden select-text">
      {/* Dedicated Workspace Header */}
      <WorkspaceHeader
        title="Messages"
        subtitle="Buyer & Seller Communications"
        backUrl="/marketplace"
        backLabel="Marketplace"
      />

      {/* Main Messaging Viewport */}
      <main className="flex-1 min-h-0 p-2 sm:p-4 max-w-7xl w-full mx-auto flex flex-col">
        <div className="flex-1 bg-white border border-stone-200 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Panel: Conversation List (4 cols on desktop) */}
          <div
            className={`md:col-span-4 lg:col-span-4 border-r border-stone-200 flex flex-col min-h-0 ${
              activeConversationId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <ConversationList
              currentUserId={user?.id || ''}
              activeConversationId={activeConversationId}
              onSelect={handleSelectConversation}
            />
          </div>

          {/* Right Panel: Active Chat Window (8 cols on desktop) */}
          <div
            className={`md:col-span-8 lg:col-span-8 flex flex-col min-h-0 ${
              !activeConversationId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {isLoadingConv ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
              </div>
            ) : activeConversation ? (
              <ChatWindow
                conversation={activeConversation}
                currentUserId={user?.id || ''}
                onBack={handleBackToList}
              />
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
    </div>
  )
}
