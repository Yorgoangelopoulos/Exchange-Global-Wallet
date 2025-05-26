"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Nunito } from "next/font/google"
import Image from "next/image"
import {
  Search,
  Star,
  Send,
  ReceiptIcon as ReceiveIcon,
  Clock,
  Settings,
  MoreVertical,
  RefreshCw,
  Plus,
  Download,
} from "lucide-react"

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

const cryptoList = [
  { name: "Tron", symbol: "TRX", balance: "0.000002", color: "bg-red-600", starred: true },
  { name: "Bitcoin", symbol: "BTC", balance: "0", color: "bg-amber-500", starred: true },
  { name: "Ethereum", symbol: "ETH", balance: "0", color: "bg-gray-300", starred: true },
  { name: "Tether USD", symbol: "USDT", balance: "0", color: "bg-teal-500", starred: true },
  { name: "Solana", symbol: "SOL", balance: "0", color: "bg-gradient-to-r from-purple-500 to-blue-500", starred: true },
  { name: "Avalanche", symbol: "AVAX", balance: "0", color: "bg-red-500", starred: true },
  { name: "Monero", symbol: "XMR", balance: "0", color: "bg-orange-500", starred: true },
  { name: "XRP", symbol: "XRP", balance: "0", color: "bg-blue-500", starred: false },
  { name: "BNB", symbol: "BNB", balance: "0", color: "bg-yellow-500", starred: true },
  { name: "USDC", symbol: "USDC", balance: "0", color: "bg-blue-400", starred: false },
  { name: "Dogecoin", symbol: "DOGE", balance: "0", color: "bg-yellow-400", starred: false },
  { name: "Cardano", symbol: "ADA", balance: "0", color: "bg-blue-600", starred: true },
]

const transactions = [
  { type: "sent", date: "May 21, 2025", amount: "1,888.213", amountDisplay: "1,888.213" },
  { type: "received", date: "May 20, 2025", amount: "0.000007", amountDisplay: "+ 0.000007" },
  { type: "received", date: "May 19, 2025", amount: "0.000006", amountDisplay: "+ 0.000006" },
  { type: "received", date: "May 18, 2025", amount: "1,889.313", amountDisplay: "+ 1,889.313" },
]

const navItems = [
  { name: "Portfolio", icon: "/portfolio.svg", active: false },
  { name: "Wallet", icon: "/wallet.svg", active: true },
  { name: "Swap", icon: "/swap.svg", active: false },
]

export default function Dashboard() {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoList[0])
  const [activeTab, setActiveTab] = useState("activity")

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.2 + i * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <div
      className={cn("relative min-h-screen w-full flex overflow-hidden bg-[#030303]", nunito.variable, "font-nunito")}
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

      {/* Main Dashboard Container */}
      <div className="relative z-10 flex flex-col w-full h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between px-4 py-3 border-b border-white/10"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="relative w-8 h-8">
                <Image src="/logo.svg" alt="Logo" fill className="object-contain" />
              </div>
              {/* Dolar gösterimini kaldırıyorum */}
            </div>
          </div>

          {/* Navigation Icons in Header - Square Shape */}
          <div className="flex space-x-3">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className={cn(
                  "flex flex-col items-center cursor-pointer group",
                  item.active ? "text-white" : "text-white/40 hover:text-white/60",
                )}
              >
                <div
                  className={cn(
                    "w-14 h-14 flex items-center justify-center rounded-md",
                    item.active ? "bg-white/10" : "bg-transparent group-hover:bg-white/5",
                  )}
                >
                  <div className="relative w-7 h-7">
                    <Image
                      src={item.icon || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className={cn(
                        "object-contain transition-opacity",
                        item.active ? "opacity-100" : "opacity-60 group-hover:opacity-80",
                      )}
                    />
                  </div>
                </div>
                {item.active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1 h-1 bg-white rounded-full mt-1"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3">
              <button className="p-2 rounded-full hover:bg-white/5">
                <RefreshCw className="w-5 h-5 text-white/60" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/5">
                <Clock className="w-5 h-5 text-white/60" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/5">
                <Settings className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-64 border-r border-white/10 overflow-hidden"
          >
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-10 pr-4 text-white/80 placeholder:text-white/40 focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            <div className="px-2 h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
              {cryptoList.map((crypto, index) => (
                <motion.div
                  key={crypto.symbol}
                  custom={index}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setSelectedCrypto(crypto)}
                  className={cn(
                    "flex items-center p-3 rounded-md cursor-pointer",
                    selectedCrypto.symbol === crypto.symbol ? "bg-white/10" : "hover:bg-white/5",
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", crypto.color)}>
                    <span className="text-xs font-bold text-white">{crypto.symbol.charAt(0)}</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="text-white">{crypto.name}</span>
                      {crypto.starred && <Star className="w-3 h-3 ml-1 text-amber-400 fill-amber-400" />}
                    </div>
                    <div className="text-sm text-white/60">
                      {crypto.balance} {crypto.symbol}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Center Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 overflow-hidden relative flex flex-col"
          >
            <div className="flex justify-between items-center p-4">
              <div></div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <MoreVertical className="w-5 h-5 text-white/60" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="flex flex-col items-center justify-center px-4 py-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="w-20 h-20 rounded-xl bg-red-600 flex items-center justify-center mb-6"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
                  </svg>
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-5xl font-light text-red-500 mb-2"
                >
                  0.000002<span className="text-3xl">TRX</span>
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-xl text-white/60 mb-8"
                >
                  $0.00
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="flex space-x-4 mb-12"
                >
                  <button className="px-12 py-3 bg-transparent border border-red-500 text-red-500 rounded-full hover:bg-red-500/10 transition-colors">
                    Send
                  </button>
                  <button className="px-12 py-3 bg-transparent border border-red-500 text-red-500 rounded-full hover:bg-red-500/10 transition-colors">
                    Receive
                  </button>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="w-full"
                >
                  <div className="flex border-b border-white/10 mb-4">
                    <button
                      onClick={() => setActiveTab("activity")}
                      className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors",
                        activeTab === "activity"
                          ? "text-white border-b-2 border-red-500"
                          : "text-white/60 hover:text-white",
                      )}
                    >
                      ACTIVITY
                    </button>
                    <button
                      onClick={() => setActiveTab("about")}
                      className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors",
                        activeTab === "about"
                          ? "text-white border-b-2 border-red-500"
                          : "text-white/60 hover:text-white",
                      )}
                    >
                      ABOUT
                    </button>
                  </div>

                  {activeTab === "activity" && (
                    <div className="space-y-4">
                      <div className="text-sm text-white/40 px-4">May 21, 2025</div>
                      {transactions.map((tx, index) => (
                        <motion.div
                          key={index}
                          custom={index}
                          variants={fadeUpVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex items-center justify-between p-4 hover:bg-white/5 rounded-md"
                        >
                          <div className="flex items-center">
                            {tx.type === "sent" ? (
                              <Send className="w-4 h-4 text-white/60 mr-3" />
                            ) : (
                              <ReceiveIcon className="w-4 h-4 text-white/60 mr-3" />
                            )}
                            <div>
                              <div className="text-white capitalize">{tx.type}</div>
                              <div className="text-sm text-white/60">{tx.date}</div>
                            </div>
                          </div>
                          <div className={cn("text-right", tx.type === "sent" ? "text-white/80" : "text-green-500")}>
                            {tx.amountDisplay}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === "about" && (
                    <div className="p-4 text-white/70">
                      <p>
                        Tron (TRX) is a blockchain-based decentralized platform that aims to build a free, global
                        digital content entertainment system with distributed storage technology.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar - Created Wallets */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-72 border-l border-white/10 overflow-hidden"
          >
            <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
              <h2 className="text-xl font-medium text-white mb-6 text-center">Created Wallets</h2>

              <div className="flex space-x-3">
                <button className="flex-1 flex items-center justify-center p-3 bg-transparent border border-white/20 text-white rounded-md hover:bg-white/5 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="whitespace-nowrap text-sm">New Wallet</span>
                </button>
                <button className="flex-1 flex items-center justify-center p-3 bg-transparent border border-white/20 text-white rounded-md hover:bg-white/5 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="whitespace-nowrap text-sm">Import</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
