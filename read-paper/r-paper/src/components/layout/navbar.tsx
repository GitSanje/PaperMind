"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BrainCircuit, Menu, User, X } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { toast } from "sonner"

import Link from "next/link"
import { Session } from "next-auth"
import { useRouter } from "next/navigation"
import { handleServerSignOut } from "@/actions/user"

export default function Navbar({session} : {
    session: Session
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)


  const navigate = useRouter()


  const handleLogout = async () => {
    try {
        await handleServerSignOut()
    setTimeout(() => {
             
          toast.success("Logged out successfully!")
          navigate.push("/")
        },2000)
    } catch (err) {
      console.error("Logout failed", err)
    }
  }



  return (
    <header className="w-full border-b bg-white">
      <div className=" flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-indigo-700">
          <BrainCircuit className="h-6 w-6" />
          <span className="text-lg font-bold ">PaperMind</span>
        </Link>
        <nav className="ml-auto hidden gap-6 md:flex">
          <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4">
            Contact
          </Link>
        </nav>
        <div className="ml-auto md:ml-4 flex gap-2">
          {session ? (
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{session?.user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate.push("/dashboard")}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate.push("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate.push("/settings")}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button asChild variant="outline" className="hidden md:flex">
                <Link href="/signin">Log In</Link>
              </Button>
              <Button asChild className="hidden md:flex bg-black text-white hover:bg-gray-800">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            <Link
              href="/features"
              className="text-sm font-medium hover:underline underline-offset-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium hover:underline underline-offset-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:underline underline-offset-4"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium hover:underline underline-offset-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            {session ? (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{session?.user.username}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/dashboard" className="text-sm hover:underline" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/profile" className="text-sm hover:underline" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link href="/settings" className="text-sm hover:underline" onClick={() => setIsMenuOpen(false)}>
                    Settings
                  </Link>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

function ListTodoIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  )
}