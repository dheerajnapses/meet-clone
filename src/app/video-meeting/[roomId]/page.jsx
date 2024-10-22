'use client'

import { useEffect, useRef, useState } from 'react' // Import necessary hooks
import { useSession } from 'next-auth/react' // Import NextAuth hook for session management
import { useParams, useRouter } from 'next/navigation' // Import Next.js hooks for routing and getting params
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt' // Zego UIKit for video meetings
import Image from 'next/image' // Next.js optimized image component
import { Button } from "@/components/ui/button" // Import custom Button component
import { toast } from 'react-toastify' // Import toast for notifications

const VideoMeeting = () => {
  const params = useParams() // Get the roomId from the URL parameters
  const roomID = params.roomId // Store room ID from the parameters
  const { data: session, status } = useSession() // Get the session (user authentication) and its status
  const router = useRouter() // Next.js router for navigation
  const containerRef = useRef(null) // Ref for the video container element
  const [zp, setZp] = useState(null) // State for storing the Zego instance
  const [isInMeeting, setIsInMeeting] = useState(false) // State to track if the user is in a meeting

  // Effect to handle joining the meeting once the session is authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name && containerRef.current) {
      console.log('Session is authenticated. Joining meeting...')
      joinMeeting(containerRef.current) // Call the joinMeeting function when authenticated
    } else {
      console.log('Waiting for session to be authenticated...')
    }
  }, [session, status]) // Dependency array to rerun when session or status changes

 
  // Clean up the Zego instance when the component is unmounted
  useEffect(() => {
    return () => {
      if (zp) {
        console.log('Destroying Zego instance...')
        zp.destroy() // Destroy Zego instance to clean up resources
      }
    }
  }, [zp]) // Rerun cleanup if zp (Zego instance) changes

  // Function to handle joining the meeting using ZegoUIKit
  const joinMeeting = (element) => {
    const appID = Number(process.env.NEXT_PUBLIC_ZEGOAPP_ID) // Zego app ID from environment variables
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET // Zego server secret from environment variables

    // Generate a Zego meeting token using appID, serverSecret, roomID, and user details
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      session?.user?.id || Date.now().toString(), // If no user ID, use timestamp as fallback
      session?.user?.name || 'Guest' // If no user name, use 'Guest'
    )
    const zpInstance = ZegoUIKitPrebuilt.create(kitToken) // Create a new Zego instance with the kit token
    setZp(zpInstance) // Store the Zego instance in state

    // Join the Zego room with specific options
    zpInstance.joinRoom({
      container: element, // The DOM element to render the video call
      sharedLinks: [
        {
          name: 'Join via this link',
          url: `${window.location.origin}/video-meeting/${roomID}`, // The meeting link for others to join
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // Set scenario to one-on-one video call
      },
      showScreenSharingButton: true, // Show the screen sharing button in the UI
      showTurnOffRemoteCameraButton: true, // Allow turning off other participants' cameras
      showTurnOffRemoteMicrophoneButton: true, // Allow turning off other participants' microphones
      showRemoveUserButton: true, // Allow removing users from the meeting
      onJoinRoom: () => {
        toast.success('Meeting Joined successfully') // Display success message when the user joins the meeting
        setIsInMeeting(true) // Set state to indicate the user is in the meeting
      },
      onLeaveRoom: () => {
        endMeeting() // Call endMeeting function when the user leaves the room
      },
    })
  }

  // Function to end the meeting and clean up
  const endMeeting = () => {
    if (zp) {
      zp.destroy() // Destroy the Zego instance
    }
    toast.success('Meeting ended successfully') // Show success toast for ending the meeting
    setZp(null) // Clear the Zego instance state
    setIsInMeeting(false) // Update state to indicate the user left the meeting
    router.push('/') // Navigate the user back to the home page
  }

  // Return the JSX structure for rendering the meeting page
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900"> 
      {/* Main container with dark and light mode background */}
      
      <div className={`flex-grow flex flex-col md:flex-row relative ${isInMeeting ? 'h-screen' : ''}`}>
        {/* Conditional flex layout depending on whether user is in the meeting */}
        
        <div
          ref={containerRef}
          className="video-container flex-grow"
          style={{ height: isInMeeting ? '100%' : 'calc(100vh - 4rem)' }}
        >
          {/* This div will render the video meeting UI */}
        </div>
      </div>
      
      {/* Render additional meeting info and controls only if the user is not in the meeting */}
      {!isInMeeting && (
        <div className='flex flex-col'>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Meeting Info</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Participant - {session?.user?.name || 'You'}</p>
            <Button
              onClick={endMeeting}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              End Meeting
            </Button>
          </div>

          {/* Feature descriptions like HD video quality, screen sharing, and secure meetings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-200 dark:bg-gray-700">
            <div className="text-center">
              <Image src="/images/videoQuality.jpg" alt="Feature 1" width={150} height={150} className="mx-auto mb-2 rounded-full" />
              <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">HD Video Quality</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Experience crystal clear video calls</p>
            </div>
            <div className="text-center">
              <Image src="/images/screenShare.jpg" alt="Feature 2" width={150} height={150} className="mx-auto mb-2 rounded-full" />
              <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">Screen Sharing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Easily share your screen with participants</p>
            </div>
            <div className="text-center">
              <Image src="/images/videoSecure.jpg" alt="Feature 3" width={150} height={150} className="mx-auto mb-2 rounded-full" />
              <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">Secure Meetings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Your meetings are protected and private</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoMeeting
