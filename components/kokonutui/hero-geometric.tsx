"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Eye, EyeOff, HelpCircle, RotateCcw, LogOut } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Nunito } from "next/font/google"
import Image from "next/image"
import { useRouter } from "next/navigation"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
})

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

export default function HeroGeometric() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const correctPassword = "d$QI*^1%wiqGg2*v6XY5"
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === correctPassword) {
      setError(false)
      setIsLoading(true)
      // Simulate loading
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } else {
      setError(true)
    }
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <div
      className={cn(
        "relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]",
        nunito.variable,
        "font-nunito",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto text-center">
          <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible" className="mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-3 border border-white/10">
                <div className="relative w-14 h-14">
                  <Image src="/logo.svg" alt="Logo" fill className="object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-3xl font-light mb-3 tracking-tight text-white">Unlock to Continue</h1>
            <p className="text-white/40 text-sm mb-8">Your wallet is secured</p>
          </motion.div>

          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <div className="relative mb-12">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Eye className="w-5 h-5 text-white/30" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError(false)
                }}
                placeholder="Type your password..."
                className={cn(
                  "w-full bg-white/[0.03] border-b px-12 py-4 text-white placeholder:text-white/30 focus:outline-none transition-colors",
                  error ? "border-red-500" : "border-white/20 focus:border-white/40",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {error && <p className="text-red-500 text-sm mt-2 text-left">Incorrect password. Please try again.</p>}
            </div>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-between items-center"
          >
            <button
              type="button"
              className="flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors group"
            >
              <div className="p-3 rounded-full border border-white/10 group-hover:border-white/20 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-sm">Help</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors group"
            >
              <div
                className={cn(
                  "p-3 rounded-full border transition-colors",
                  isLoading ? "border-green-500/50 bg-green-500/10" : "border-white/10 group-hover:border-white/20",
                )}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
              </div>
              <span className="text-sm">{isLoading ? "Loading..." : "Restore"}</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors group"
            >
              <div className="p-3 rounded-full border border-white/10 group-hover:border-white/20 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm">Quit</span>
            </button>
          </motion.div>
        </form>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  )
}
