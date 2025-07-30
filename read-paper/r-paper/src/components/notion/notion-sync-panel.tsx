"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  Upload,
  CheckCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  FileText,
  Brain,
  Target,
  Plus,
  FolderPlus,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"



import type { HighlightType } from "@/components/context/globalcontext";
import { createDb, createPageWorkspace, getAllHightlightsStatus, getWorkspaces, uploadHighlights } from "@/actions/notion";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { fetchNotionData, updateNotionState } from "../../../redux/notionSlice";
import { updateHState } from "../../../redux/highlightSlice";

interface NotionSyncPanelProps {
  userId: string;
  highlights: HighlightType[];
  pdfTitle: string;
  pdfUrl: string;
  isConnected: boolean;
}

export function NotionSyncPanel({
  userId,
  highlights,
  pdfTitle,
  pdfUrl,
  isConnected,
}: NotionSyncPanelProps) {


  const dispatch = useAppDispatch()
  const {databaseUrl,databaseId,availablePages,selectedParentPage,syncResults,notionData,highlightStatus} = useAppSelector((state) => state.notion)
  const { pdfid} = useAppSelector((state) => state.pdfsetting)
  

  const [isCreatingDatabase, setIsCreatingDatabase] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "completed" | "error"
  >("idle");

    const [databaseTitle, setDatabaseTitle] = useState<string>("")
  const [isCreatingParent, setIsCreatingParent] = useState(false)
  const [showCreateParentDialog, setShowCreateParentDialog] = useState(false)
  const [newParentTitle, setNewParentTitle] = useState("")
  const [newParentDescription, setNewParentDescription] = useState("")


  useEffect(() => {
    if (isConnected && userId && availablePages.length ===0) {
      fetchAvailablePages();
    }
    if(pdfid && userId && highlightStatus.length ==0){
      const getAllStatus = async ()=> {
           const result = await getAllHightlightsStatus(userId,pdfid)
           if(result){
              dispatch(updateNotionState({highlightStatus:result}  ))
           }
     
      }
      getAllStatus()
    }
    
  }, [isConnected, userId,pdfid]);


   // Set default database title based on PDF
  useEffect(() => {
    if (pdfTitle && !databaseTitle) {
      
      setDatabaseTitle(`📚 ${pdfTitle}`)
    } 
  }, [pdfTitle, databaseTitle])




  const createParentPage = async () => {
    if (!newParentTitle.trim()) {
      alert("Please enter a title for the new page")
      return
    }

    setIsCreatingParent(true)

    try {
      const data = await createPageWorkspace( {userId,title:newParentTitle,description:newParentDescription})



      if (data?.success) {
        // Add the new page to available pages
        const newPage = {
          id: data.pageId,
          title: newParentTitle,
          url: data.pageUrl,
        }
        const newPagesArray = [newPage, ...availablePages];
        dispatch(updateNotionState({availablePages:newPagesArray}))
        dispatch(updateNotionState({selectedParentPage:data.pageId}))
        setShowCreateParentDialog(false)
        setNewParentTitle("")
        setNewParentDescription("")
      } else {
        alert("Failed to create page: " + data.error)
      }
    } catch (error) {
      console.error("Error creating parent page:", error)
      alert("Failed to create page")
    } finally {
      setIsCreatingParent(false)
    }
  }
  const fetchAvailablePages = async () => {
    try {
      const data = await getWorkspaces(userId);

      if (data?.success) {
        const pages = data.pages
          .map((p: any) => {
            if (p.title.toLowerCase() !== "untitled") {
              return p;
            }
          })
          .filter(Boolean);
                dispatch(updateNotionState({availablePages:pages}))
        if (data.pages.length > 0) {
                  dispatch(updateNotionState({selectedParentPage:data.pages[0].id}))
       
        }
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const createDatabase = async () => {
    if (!selectedParentPage) {
      toast.error("Please select a parent page");
      return;
    }

    if (!databaseTitle.trim()) {
       toast.error("Please enter a database title")
      return
    }
    setIsCreatingDatabase(true);

    try {
      const data = await createDb({
        userId,
        pdfTitle: databaseTitle,
        pdfUrl,
        parentPageId: selectedParentPage,
        integrationId:notionData.integrationId
      });

      if (data?.success) {
         dispatch(updateNotionState({databaseId:data.databaseId}))
         dispatch(updateNotionState({databaseUrl:data.databaseUrl}))

      } else {
        toast.error("Failed to create database: " + data.error);
      }
    } catch (error) {
      console.error("Error creating database:", error);
      toast.error("Failed to create database");
    } finally {
      setIsCreatingDatabase(false);
    }
  };

  const syncHighlights = async () => {
    if (!databaseId) {
      toast.error("Please create a database first");
      return;
    }

    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const data = await uploadHighlights({
        userId,
        highlights,
        pdfId:pdfid,
        databaseId,
        pdfTitle
      });

      clearInterval(progressInterval);
      setSyncProgress(100);

      if (data.success) {
        setSyncStatus("completed");
          dispatch(updateNotionState({syncResults:data}));
          dispatch(updateNotionState({highlightStatus:[]}));
          dispatch(updateNotionState({highlightStatus:data.highlightStatus}));

      } else {
        setSyncStatus("error");
        toast.error("Failed to sync highlights: " + data.error);
      }
    } catch (error) {
      console.error("Error syncing highlights:", error);
      setSyncStatus("error");
      toast.error("Failed to sync highlights");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connect to Notion First
          </h3>
          <p className="text-gray-600">
            Connect your Notion account to sync highlights and create databases.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSelect = (value: string) => {
    dispatch(updateNotionState({selectedParentPage:value}))

  }
 return (
    <div className="space-y-4">
      {/* Database Creation */}
      <Card className={databaseId ? "border-green-200 bg-green-50" : "border-blue-200"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {databaseId ? "Database Created" : "Create Notion Database"}
          </CardTitle>
          <CardDescription>
            {databaseId
              ? "Your PDF analysis database is ready in Notion"
              : "Create a new database in Notion to organize your highlights"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!databaseId ? (
            <div className="space-y-4">
              {/* Database Title Input */}
              <div>
                <Label htmlFor="database-title" className="text-sm font-medium mb-2 block">
                  Database Title
                </Label>
                <Input
                  id="database-title"
                  placeholder="Enter database title..."
                  value={databaseTitle}
                  onChange={(e) => setDatabaseTitle(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">This will be the name of your database in Notion</p>
              </div>

              {/* Parent Page Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Parent Page</Label>
                <div className="flex gap-2">
                  <Select value={selectedParentPage} onValueChange={handleSelect}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose where to create the database" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePages.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Create New Parent Page Button */}
                  <Dialog open={showCreateParentDialog} onOpenChange={setShowCreateParentDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" title="Create new page">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FolderPlus className="h-5 w-5" />
                          Create New Parent Page
                        </DialogTitle>
                        <DialogDescription>
                          Create a new page in your Notion workspace to organize your PDF databases.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="parent-title">Page Title</Label>
                          <Input
                            id="parent-title"
                            placeholder="e.g., Research Papers, Study Materials..."
                            value={newParentTitle}
                            onChange={(e) => setNewParentTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parent-description">Description (Optional)</Label>
                          <Textarea
                            id="parent-description"
                            placeholder="Brief description of what this page will contain..."
                            value={newParentDescription}
                            onChange={(e) => setNewParentDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateParentDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createParentPage} disabled={isCreatingParent || !newParentTitle.trim()}>
                          {isCreatingParent ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <FolderPlus className="h-4 w-4 mr-2" />
                              Create Page
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select an existing page or create a new one to contain your database
                </p>
              </div>

              <Button
                onClick={createDatabase}
                disabled={isCreatingDatabase || !selectedParentPage || !databaseTitle.trim()}
                className="w-full"
              >
                {isCreatingDatabase ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Database...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Create Database
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Database "{databaseTitle}" created successfully!</span>
              </div>
              <Button variant="outline" onClick={() => window.open(databaseUrl, "_blank")} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Notion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Highlights Sync */}
      <Card className={syncStatus === "completed" ? "border-green-200 bg-green-50" : "border-purple-200"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Powered Highlight Sync
          </CardTitle>
          <CardDescription>Sync {highlights.length} highlights with AI categorization and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* AI Features Preview */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3 text-purple-500" />
                <span>AI Categorization</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-blue-500" />
                <span>Smart Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-green-500" />
                <span>Auto Summary</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-orange-500" />
                <span>Context Analysis</span>
              </div>
            </div>

            {/* Sync Progress */}
            {isSyncing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Syncing highlights...</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="h-2" />
              </div>
            )}

            {/* Sync Results */}
            {syncStatus === "completed" && syncResults  && (
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Sync Completed!</span>
                </div>
                <p className="text-sm text-green-700">
                  Successfully synced {syncResults.syncedCount} of {syncResults.totalCount} highlights to "
                  {databaseTitle}"
                </p>
              </div>
            )}

            {/* Sync Button */}
            <Button
              onClick={syncHighlights}
              disabled={!databaseId || isSyncing || highlights.length === 0}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing with AI...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Sync {highlights.length} Highlights
                </>
              )}
            </Button>

            {highlights.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                No highlights to sync. Start highlighting text in your PDF!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      {syncStatus !== "idle" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sync Status</span>
              <Badge
                variant={
                  syncStatus === "completed" ? "default" : syncStatus === "syncing" ? "secondary" : "destructive"
                }
              >
                {syncStatus === "completed"
                  ? "Completed"
                  : syncStatus === "syncing"
                    ? "In Progress"
                    : syncStatus === "error"
                      ? "Error"
                      : "Idle"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}