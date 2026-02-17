import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '../lib/supabase'
import { MessageSquare, ThumbsUp, Clock, User, ChevronDown, ChevronRight, Plus, Eye } from 'lucide-react'

const CATEGORIES = [
  { id: 'general', name: 'GENERAL', desc: 'GENERAL_DISCUSSION' },
  { id: 'bounties', name: 'BOUNTIES', desc: 'BOUNTY_TALK' },
  { id: 'agents', name: 'AGENTS', desc: 'AGENT_SHOWCASE' },
  { id: 'bugs', name: 'BUGS', desc: 'BUG_REPORTS' },
]

interface Post {
  id: string
  category: string
  title: string | null
  content: string
  author_wallet: string
  author_name: string | null
  parent_id: string | null
  is_thread: boolean
  upvotes: number
  created_at: string
  replies?: Post[]
}

export default function Forum() {
  const { publicKey, connected } = useWallet()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('general')
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())
  const [showNewThread, setShowNewThread] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [activeCategory])

  async function fetchPosts() {
    setLoading(true)
    try {
      // Fetch threads (posts without parent) - team posts first, then by date
      const { data: threads, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('category', activeCategory)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch all replies
      const { data: replies } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('category', activeCategory)
        .not('parent_id', 'is', null)
        .order('created_at', { ascending: true })

      // Group replies by parent
      const replyMap: Record<string, Post[]> = {}
      replies?.forEach(reply => {
        if (!replyMap[reply.parent_id]) replyMap[reply.parent_id] = []
        replyMap[reply.parent_id].push(reply)
      })

      // Attach replies to threads
      const threadsWithReplies = threads?.map(thread => ({
        ...thread,
        replies: replyMap[thread.id] || []
      })) || []

      setPosts(threadsWithReplies)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setPosts([])
    }
    setLoading(false)
  }

  async function createThread() {
    if (!connected || !publicKey || !newTitle.trim() || !newContent.trim()) return

    try {
      const { error } = await supabase.from('forum_posts').insert({
        category: activeCategory,
        title: newTitle.trim(),
        content: newContent.trim(),
        author_wallet: publicKey.toBase58(),
        author_name: `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
        is_thread: true,
      })

      if (error) throw error

      setNewTitle('')
      setNewContent('')
      setShowNewThread(false)
      fetchPosts()
    } catch (err) {
      console.error('Error creating thread:', err)
    }
  }

  async function createReply(parentId: string) {
    if (!connected || !publicKey || !replyContent.trim()) return

    try {
      const { error } = await supabase.from('forum_posts').insert({
        category: activeCategory,
        content: replyContent.trim(),
        author_wallet: publicKey.toBase58(),
        author_name: `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
        parent_id: parentId,
        is_thread: false,
      })

      if (error) throw error

      setReplyContent('')
      setReplyTo(null)
      fetchPosts()
    } catch (err) {
      console.error('Error creating reply:', err)
    }
  }

  function toggleThread(threadId: string) {
    const newExpanded = new Set(expandedThreads)
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId)
    } else {
      newExpanded.add(threadId)
    }
    setExpandedThreads(newExpanded)
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">FORUM</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide">COMMUNITY_DISCUSSIONS</p>
        </div>
        {connected && (
          <button
            onClick={() => setShowNewThread(true)}
            className="claw-btn claw-btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            NEW THREAD
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`p-3 border text-left transition-colors ${
              activeCategory === cat.id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="font-medium text-sm">{cat.name}</div>
            <div className="text-xs text-gray-500 hidden sm:block">{cat.desc}</div>
          </button>
        ))}
      </div>

      {/* New Thread Form */}
      {showNewThread && connected && (
        <div className="claw-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">NEW THREAD in {CATEGORIES.find(c => c.id === activeCategory)?.name}</h3>
            <button onClick={() => setShowNewThread(false)} className="text-gray-500 hover:text-black">✕</button>
          </div>
          <input
            type="text"
            placeholder="Thread title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="What's on your mind?"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 px-3 py-2 text-sm resize-none"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNewThread(false)} className="claw-btn">CANCEL</button>
            <button onClick={createThread} className="claw-btn claw-btn-primary">POST</button>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="claw-card text-center py-8 text-gray-500 uppercase text-xs">LOADING_THREADS...</div>
      ) : posts.length === 0 ? (
        <div className="claw-card text-center py-8 text-gray-500 uppercase text-xs">
          NO_THREADS_FOUND
          {connected && <p className="mt-2">BE_THE_FIRST_TO_POST</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {posts
            .sort((a, b) => {
              // Team posts first
              if (a.author_name === 'CLAW99_TEAM' && b.author_name !== 'CLAW99_TEAM') return -1
              if (b.author_name === 'CLAW99_TEAM' && a.author_name !== 'CLAW99_TEAM') return 1
              return 0
            })
            .map((thread) => (
            <div key={thread.id} className={`claw-card ${thread.author_name === 'CLAW99_TEAM' ? 'border-2 border-black bg-gray-50' : ''}`}>
              {/* Thread Header */}
              <div 
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => toggleThread(thread.id)}
              >
                <div className="mt-1">
                  {expandedThreads.has(thread.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium flex items-center gap-2">
                    {thread.author_name === 'CLAW99_TEAM' && <span className="text-xs bg-black text-white px-2 py-0.5">📌 PINNED</span>}
                    {thread.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{thread.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {thread.author_name || thread.author_wallet.slice(0, 8)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(thread.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {thread.replies?.length || 0} replies
                    </span>
                    <span className="flex items-center gap-1">
                      {thread.author_name === 'CLAW99_TEAM' ? (
                        <><Eye className="w-3 h-3" /> {thread.upvotes} views</>
                      ) : (
                        <><ThumbsUp className="w-3 h-3" /> {thread.upvotes}</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Thread */}
              {expandedThreads.has(thread.id) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {/* Replies */}
                  {thread.replies && thread.replies.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {thread.replies.map((reply) => (
                        <div key={reply.id} className="pl-6 border-l-2 border-gray-200">
                          <p className="text-sm">{reply.content}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>{reply.author_name || reply.author_wallet.slice(0, 8)}</span>
                            <span>{formatTime(reply.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {connected ? (
                    replyTo === thread.id ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 px-3 py-2 text-sm resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setReplyTo(null)} className="claw-btn text-xs">CANCEL</button>
                          <button onClick={() => createReply(thread.id)} className="claw-btn claw-btn-primary text-xs">REPLY</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyTo(thread.id)}
                        className="text-xs text-gray-500 hover:text-black uppercase"
                      >
                        + ADD_REPLY
                      </button>
                    )
                  ) : (
                    <p className="text-xs text-gray-500 uppercase">CONNECT_WALLET_TO_REPLY</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
