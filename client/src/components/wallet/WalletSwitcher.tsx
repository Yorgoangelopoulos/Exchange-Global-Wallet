import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronDown, 
  Plus, 
  Import, 
  Check, 
  Pencil, 
  Trash2, 
  Wallet, 
  AlertTriangle 
} from 'lucide-react';
import { useWallets, WalletInfo } from '@/hooks/use-wallets';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import CreateWalletPanel from './CreateWalletPanel';
import ImportWalletPanel from './ImportWalletPanel';

const WalletSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const { 
    wallets, 
    activeWallet, 
    createWallet, 
    importWallet, 
    setActiveWallet, 
    renameWallet, 
    deleteWallet 
  } = useWallets();
  
  const { toast } = useToast();
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsEditing(false);
      setEditingWalletId(null);
      setShowDeleteConfirm(null);
    }
  };
  
  const handleSelectWallet = (walletId: string) => {
    if (isEditing) return;
    
    setActiveWallet(walletId);
    setIsOpen(false);
    
    toast({
      title: "Wallet Switched",
      description: `Switched to wallet "${wallets.find(w => w.id === walletId)?.name}".`,
      variant: "default"
    });
  };
  
  const handleStartEdit = (wallet: WalletInfo) => {
    setIsEditing(true);
    setEditingWalletId(wallet.id);
    setNewName(wallet.name);
  };
  
  const handleSaveEdit = () => {
    if (editingWalletId && newName.trim()) {
      renameWallet(editingWalletId, newName);
      setIsEditing(false);
      setEditingWalletId(null);
      
      toast({
        title: "Wallet Renamed",
        description: `Wallet has been renamed to "${newName}".`,
        variant: "default"
      });
    }
  };
  
  const handleDelete = (walletId: string) => {
    if (wallets.length <= 1) {
      toast({
        title: "Cannot Delete Wallet",
        description: "You must have at least one wallet.",
        variant: "destructive"
      });
      return;
    }
    
    setShowDeleteConfirm(walletId);
  };
  
  const confirmDelete = (walletId: string) => {
    const walletName = wallets.find(w => w.id === walletId)?.name;
    const success = deleteWallet(walletId);
    
    if (success) {
      toast({
        title: "Wallet Deleted",
        description: `Wallet "${walletName}" has been deleted.`,
        variant: "default"
      });
    } else {
      toast({
        title: "Cannot Delete Wallet",
        description: "You must have at least one wallet.",
        variant: "destructive"
      });
    }
    
    setShowDeleteConfirm(null);
  };
  
  const handleCreateWallet = async (name: string) => {
    try {
      // In the createWallet function, we now need to pass the mnemonic
      // But it's already generated in the CreateWalletPanel component
      // We're just passing the name here, and the panel handles the full creation
      setShowCreatePanel(false);
      
      toast({
        title: "Creating Wallet",
        description: "Your wallet is being created and addresses are being generated...",
        variant: "default"
      });
      
      // We'll handle the actual wallet creation in the CreateWalletPanel
      // And update the active wallet after the backend confirms creation
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Wallet Creation Error",
        description: `There was an error creating the wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };
  
  const handleImportWallet = async (name: string) => {
    try {
      setShowImportPanel(false);
      
      toast({
        title: "Importing Wallet",
        description: "Your wallet is being imported and addresses are being derived...",
        variant: "default"
      });
      
      // We'll handle the actual wallet import in the ImportWalletPanel
      // And update the active wallet after the backend confirms import
    } catch (error) {
      console.error("Error importing wallet:", error);
      toast({
        title: "Wallet Import Error",
        description: `There was an error importing the wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };
  
  const getWalletTypeIcon = (wallet: WalletInfo) => {
    if (wallet.type === 'imported') {
      return <Import className="h-4 w-4 text-amber-500" />;
    }
    return <Wallet className="h-4 w-4 text-blue-500" />;
  };
  
  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 h-auto border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white text-gray-300"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="font-medium">
              {activeWallet?.name || 'My Wallet'}
            </span>
          </div>
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </Button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-72 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-20"
            >
              <div className="p-2 max-h-80 overflow-auto">
                <div className="space-y-1">
                  {wallets.map((wallet) => (
                    <div key={wallet.id} className="relative">
                      {showDeleteConfirm === wallet.id ? (
                        <div className="p-2 bg-red-900/20 rounded-lg border border-red-900/30">
                          <div className="flex items-start mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-gray-300">
                              Are you sure you want to delete this wallet? This action cannot be undone.
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => setShowDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => confirmDelete(wallet.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            wallet.isActive && !isEditing
                              ? 'bg-blue-600'
                              : 'hover:bg-gray-800 cursor-pointer'
                          }`}
                          onClick={() => handleSelectWallet(wallet.id)}
                        >
                          <div className="flex items-center gap-2">
                            {getWalletTypeIcon(wallet)}
                            
                            {editingWalletId === wallet.id ? (
                              <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white w-32"
                                autoFocus
                              />
                            ) : (
                              <span className={`text-sm ${wallet.isActive && !isEditing ? 'font-medium text-white' : 'text-gray-300'}`}>
                                {wallet.name}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {wallet.isActive && !isEditing && !showDeleteConfirm && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                            
                            {isEditing && editingWalletId === wallet.id ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEdit();
                                }}
                              >
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              </Button>
                            ) : isEditing && !showDeleteConfirm ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(wallet);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5 text-gray-400" />
                                </Button>
                                {wallets.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(wallet.id);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                  </Button>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>
                      )}
                      
                      {wallet.type === 'imported' && !isEditing && !showDeleteConfirm && (
                        <div className="pl-8 mt-0.5 mb-1">
                          <span className="text-xs text-gray-500">
                            Imported via {wallet.importMethod === 'mnemonic' ? 'recovery phrase' : 'private key'} • {
                              formatDistanceToNow(new Date(wallet.dateCreated), { addSuffix: true })
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {!isEditing && !showDeleteConfirm && (
                  <div className="border-t border-gray-800 mt-2 pt-2 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => setShowCreatePanel(true)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      New Wallet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => setShowImportPanel(true)}
                    >
                      <Import className="h-3.5 w-3.5 mr-1.5" />
                      Import Wallet
                    </Button>
                    {!isEditing && wallets.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs border-gray-700 text-gray-300 hover:bg-gray-800 col-span-2"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Manage Wallets
                      </Button>
                    )}
                  </div>
                )}
                
                {isEditing && !showDeleteConfirm && (
                  <div className="border-t border-gray-800 mt-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center text-xs"
                      onClick={() => setIsEditing(false)}
                    >
                      Done
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {showCreatePanel && (
          <CreateWalletPanel 
            onClose={() => setShowCreatePanel(false)} 
            onWalletCreated={handleCreateWallet}
          />
        )}
        
        {showImportPanel && (
          <ImportWalletPanel 
            onClose={() => setShowImportPanel(false)} 
            onWalletImported={handleImportWallet}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default WalletSwitcher;