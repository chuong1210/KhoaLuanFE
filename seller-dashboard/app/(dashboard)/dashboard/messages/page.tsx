"use client"
import { useState } from "react"
import type React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { chatService } from "@/services/chat-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function MessagesPage() {
  const queryClient = useQueryClient()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")

  const {
    data: conversations,
    isLoading: isLoadingConversations,
    error: errorConversations,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: chatService.getConversations,
  })

  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: errorMessages,
  } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: () => chatService.getMessages(selectedConversation!),
    enabled: !!selectedConversation,
  })

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      chatService.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      setMessageInput("")
    },
    onError: () => {
      toast.error("Không thể gửi tin nhắn")
    },
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConversation || !messageInput.trim()) return
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageInput,
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tin nhắn</h2>
        <p className="text-muted-foreground">Trò chuyện với khách hàng</p>
      </div>

      <div className="grid h-[calc(100vh-12rem)] gap-4 md:grid-cols-3">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Cuộc trò chuyện
            </CardTitle>
            <CardDescription>{conversations?.length || 0} cuộc trò chuyện</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingConversations ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : errorConversations ? (
              <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>Không thể tải danh sách cuộc trò chuyện</AlertDescription>
              </Alert>
            ) : conversations && conversations.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-18rem)]">
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent ${
                        selectedConversation === conversation.id ? "bg-accent" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={conversation.userAvatar || "/placeholder.svg"} alt={conversation.userName} />
                        <AvatarFallback>{conversation.userName[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{conversation.userName}</p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">{conversation.lastMessage}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(conversation.lastMessageTime)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Chưa có cuộc trò chuyện nào</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedConversation
                ? conversations?.find((c) => c.id === selectedConversation)?.userName
                : "Chọn cuộc trò chuyện"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-[calc(100vh-20rem)] flex-col">
            {!selectedConversation ? (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                Chọn một cuộc trò chuyện để bắt đầu
              </div>
            ) : isLoadingMessages ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : errorMessages ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>Không thể tải tin nhắn</AlertDescription>
              </Alert>
            ) : (
              <>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === "shop" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderType === "shop"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="mt-1 text-xs opacity-70">{formatTime(message.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button type="submit" disabled={sendMessageMutation.isPending || !messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
