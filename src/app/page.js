"use client"
import MeetingFeatures from "./Components/MeetingFeatures"
import MeetingActions from "./Components/MeetingAction"
import Header from "./Components/Header"
import Loader from "./Components/Loader"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const [user, setUser] = useState(null);
  const userId= session?.user?.id;
  

  useEffect(() => {
    if (status === 'authenticated') {
      setIsLoading(false)
      const hasShownWelcome = localStorage.getItem('hasShownWelcome')
      if (!hasShownWelcome) {
        toast.success(`Welcome back, ${session.user?.name}!`)
        localStorage.setItem('hasShownWelcome', 'true')
      }
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [status, session])


  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return; 
      try {
        setIsLoading(true); 
        const response = await axios.get(`/api/user/${userId}`); 
        setUser(response.data); 
      } catch (err) {
         console.error(err)
      } finally {
        setIsLoading(false); 
      }
    };

    fetchUser();
  }, [userId]);

  if (isLoading) {
    return <Loader />
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow p-8 pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Video calls and meetings for everyone
              </h1>
              <p className="text-3xl text-gray-600 dark:text-gray-300 mb-12">
                Connect, collaborate, and celebrate from anywhere with MeetClone
              </p>
              <MeetingActions />
            </div>
            <div className="md:w-1/2">
              <MeetingFeatures />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage