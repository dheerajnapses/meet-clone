"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Video, Info, Moon, Sun, X, Plus, LogOut } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

const Header = () => {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  const formatDate = () => {
    const now = new Date()
    return now.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/user-auth" })
  }

  const userPlaceholder = session?.user?.name
    ?.split(" ")
    .map((name) => name[0])
    .join("")

  return (
    <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          <Video className="w-8 h-8 text-blue-500" />
          <span className=" hidden md:block text-xl font-semibold text-gray-800 dark:text-white">
            Google Meet
          </span>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {formatDate()}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-orange-500" />
          ) : (
            <Moon className="w-5 h-5 text-blue-500" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:block">
          <Info className="w-5 h-5" />
        </Button>
        <DropdownMenu open={open} onOpenChange={setOpen} >
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name || ""} />
              ) : (
                <AvatarFallback className="text-4xl dark:bg-gray-300">
                  {userPlaceholder}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-800 dark:text-white">
                {session?.user?.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="p-4 rounded-full"
                onClick={() => setOpen(false)} 
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-20 w-20 mb-2">
                {session?.user?.image ? (
                  <AvatarImage src={session.user.image} alt={session.user.name || ""} />
                ) : (
                  <AvatarFallback className="text-4xl">{userPlaceholder}</AvatarFallback>
                )}
              </Avatar>
              <h2 className="text-xl font-semibold mt-2">
                Hi, {session?.user?.name}!
              </h2>
            </div>
            <div className="flex mb-4">
              <Button variant="outline" className="w-1/2 h-14 rounded-l-full">
                <Plus className="h-4 w-4 mr-2" />
                Add account
              </Button>
              <Button variant="outline" className="w-1/2 h-14 rounded-r-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
            <div className="text-center text-sm text-gray-500">
              <Link href="#" className="hover:underline">
                Privacy Policy
              </Link>
              {" • "}
              <Link href="#" className="hover:underline">
                Terms of Service
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header