"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Loader2, FileText, ArrowRight } from "lucide-react"
import { updateNotionState} from "../../../redux/notionSlice"
import { useAppDispatch, useAppSelector } from "../../../redux/hooks"

interface NotionConnectButtonProps {
  userId?: string
  className?: string
}

export function NotionConnectButton({ userId, className }: NotionConnectButtonProps) {

  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)


  const dispatch = useAppDispatch()
  const {isConnected,notionData}  = useAppSelector((state) =>state.notion )

  // Check connection status on component mount
  useEffect(() => {
    if(!notionData && !isConnected){
       checkConnectionStatus()
    }
   
  }, [userId])

  const checkConnectionStatus = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }
setIsLoading(true)
    try {
      const response = await fetch(`/api/notion/status?userId=${userId}`)
      const data = await response.json()

      if (data.connected) {
          dispatch(updateNotionState({isConnected:true}))
         dispatch(updateNotionState({notionData:data.notionData}))
      }
     
       setIsLoading(false)
    } catch (error) {
      console.error("Error checking Notion connection:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = () => {
    setIsConnecting(true)

    const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/notion/callback`)

    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}`

    // Open Notion OAuth in a popup window
    const popup = window.open(notionAuthUrl, "notion-auth", "width=600,height=700,scrollbars=yes,resizable=yes")

    // Listen for the popup to close (indicating completion)
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        setIsConnecting(false)
        // Recheck connection status after popup closes
        setTimeout(() => {
          checkConnectionStatus()
        }, 1000)
      }
    }, 1000)
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/notion/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        dispatch(updateNotionState({isConnected:false}))
         dispatch(updateNotionState({notionData:null}))
         dispatch( updateNotionState({availablePages:[]}))
      }
    } catch (error) {
      console.error("Error disconnecting from Notion:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Checking Notion connection...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isConnected && notionData) {
    return (
      <Card className={`${className} border-green-200 bg-green-50`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg text-green-800">Notion Connected</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Active
            </Badge>
          </div>
          <CardDescription className="text-green-700">
            Your PDF highlights and notes will be synced to Notion
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <FileText className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{notionData.workspace_name || "Notion Workspace"}</p>
                <p className="text-xs text-gray-600">Connected as {notionData.owner?.user?.name || "User"}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://notion.so", "_blank")}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Notion
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} border-blue-200 hover:border-blue-300 transition-colors`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          Connect to Notion
        </CardTitle>
        <CardDescription>Sync your PDF highlights and notes directly to your Notion workspace</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Auto-sync highlights</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Export notes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">AI summaries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Citation tracking</span>
            </div>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect to Notion
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">We'll redirect you to Notion to authorize the connection</p>
        </div>
      </CardContent>
    </Card>
  )
}
