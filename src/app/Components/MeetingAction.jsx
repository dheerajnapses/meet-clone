"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Video, LinkIcon, Link2, Plus, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { v4 as uuidv4 } from "uuid"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from 'react-toastify'
import Loader from "./Loader"


const MeetingActions = () => {
  const [meetingLink, setMeetingLink] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [generatedMeetingLink, setGeneratedMeetingLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleJoinMeeting = () => {
    if (meetingLink) {
      setIsLoading(true)
      const formattedLink = meetingLink.includes("https")
        ? meetingLink
        : `/video-meeting/${meetingLink}`
      router.push(formattedLink)
      toast.info("Joining meeting...")
    } else {
      toast.error("Please enter a valid meeting link or code.")
    }
  }

  const handleStartMeeting = () => {
    setIsLoading(true)
    const roomId = uuidv4()
    router.push(`/video-meeting/${roomId}?meetings=${session?.user?.id}`)
    toast.info("Starting a new meeting...")
  }

  const handleCreateMeetingForLater = () => {
    const roomId = uuidv4()
    const link = `${process.env.NEXTAUTH_URL}/${roomId}?meetings=${session?.user?.id}`
    setGeneratedMeetingLink(link)
    setIsDialogOpen(true)
    toast.success("Meeting link created successfully!")
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMeetingLink)
    toast.success("Meeting link copied to clipboard!")
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full sm:w-auto" size="lg">
              <Video className="w-5 h-5 mr-2" />
              New meeting
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleCreateMeetingForLater}>
              <Link2 className="w-4 h-4 mr-2" />
              Create a meeting for later
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleStartMeeting}>
              <Plus className="w-4 h-4 mr-2" />
              Start an instant meeting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex w-full sm:w-auto relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <LinkIcon className="w-4 h-4 text-gray-400" />
          </span>
          <Input
            placeholder="Enter a code or link"
            className="pl-8 rounded-r-none pr-10"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
          />
          <Button
            variant="secondary"
            className="rounded-l-none"
            onClick={handleJoinMeeting}
          >
            Join
          </Button>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-normal">Here your joining information</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Send this to people that you want to meet with. Make sure that you save it so that you can use it later, too.
            </p>
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <span className="text-gray-700 dark:text-gray-200 break-all">
                {generatedMeetingLink.slice(0, 30)}...
              </span>
              <Button variant="ghost" className="hover:bg-gray-200" onClick={copyToClipboard}>
                <Copy className="w-5 h-5 text-orange-300" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MeetingActions