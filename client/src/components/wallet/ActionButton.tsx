import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const ActionButton = ({ 
  label, 
  icon: Icon, 
  onClick, 
  variant = 'primary' 
}: ActionButtonProps) => {
  let buttonClasses = '';
  
  switch (variant) {
    case 'primary':
      buttonClasses = 'bg-blue-600 hover:bg-blue-700 text-white';
      break;
    case 'secondary':
      buttonClasses = 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700';
      break;
    case 'ghost':
      buttonClasses = 'bg-transparent hover:bg-gray-800 text-gray-300';
      break;
  }
  
  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        className={`flex items-center justify-center px-5 py-2 rounded-lg ${buttonClasses}`}
        onClick={onClick}
      >
        <Icon className="w-5 h-5 mr-2" />
        <span>{label}</span>
      </Button>
    </motion.div>
  );
};

export default ActionButton;
