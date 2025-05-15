import { motion } from 'framer-motion';

interface WalletLogoProps {
  size?: number;
}

const WalletLogo = ({ size = 60 }: WalletLogoProps) => {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.6
      }}
    >
      {/* Hexagonal background */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 0L56.6025 15V45L30 60L3.39746 45V15L30 0Z"
          fill="url(#paint0_linear)"
        />
        <path
          d="M30 10L46.6025 20V40L30 50L13.3975 40V20L30 10Z"
          fill="url(#paint1_linear)"
          fillOpacity="0.6"
        />
        <path
          d="M30 20L38.6025 25V35L30 40L21.3975 35V25L30 20Z"
          fill="url(#paint2_linear)"
          fillOpacity="0.8"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="30"
            y1="0"
            x2="30"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient
            id="paint1_linear"
            x1="30"
            y1="10"
            x2="30"
            y2="50"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient
            id="paint2_linear"
            x1="30"
            y1="20"
            x2="30"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#A855F7" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Security badge circle - positioned at bottom right */}
      <motion.div
        className="absolute"
        style={{
          bottom: size * 0.05,
          right: size * 0.05,
          width: size * 0.3,
          height: size * 0.3,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="12" fill="#10B981" />
          <path
            d="M7 12L10 15L17 8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default WalletLogo;
