import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import { CryptoCurrency, Transaction } from '@shared/schema';
import { format, formatDistanceToNow } from 'date-fns';

interface TransactionHistoryProps {
  transactions: Transaction[];
  currencies: CryptoCurrency[];
}

const TransactionHistory = ({ transactions, currencies }: TransactionHistoryProps) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500">
        <Clock className="w-5 h-5 mb-2 text-gray-400" />
        <p className="text-sm">No transaction history yet</p>
      </div>
    );
  }

  // Sort transactions by date, newest first
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="space-y-2"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {sortedTransactions.map((transaction) => {
        const currency = currencies.find(c => c.id === transaction.currencyId);
        const isSend = transaction.type === 'send';
        
        return (
          <motion.div 
            key={transaction.id}
            variants={itemVariants}
            className="flex items-center p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <div className={`flex items-center justify-center w-9 h-9 rounded-full mr-3 ${isSend ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {isSend ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownLeft className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between">
                <h4 className="font-medium text-white">
                  {isSend ? 'Sent' : 'Received'} {currency?.name}
                </h4>
                <span className={`font-medium ${isSend ? 'text-red-400' : 'text-green-400'}`}>
                  {isSend ? '-' : '+'}{transaction.amount} {currency?.symbol}
                </span>
              </div>
              
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {format(new Date(transaction.timestamp), 'MMM d, yyyy • HH:mm')}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default TransactionHistory;
