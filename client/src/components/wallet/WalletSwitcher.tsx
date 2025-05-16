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
import { apiRequest } from '@/lib/queryClient';
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
    setWallets,
    createWallet, 
    importWallet, 
    setActiveWallet, 
    renameWallet, 
    deleteWallet 
  } = useWallets();
  
  const { toast } = useToast();
  
  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Cüzdan listesi kapandığında düzenleme modundan çık
    if (!newIsOpen) {
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
        title: "Cüzdan Silinemedi",
        description: "En az bir cüzdan bulunmalıdır.",
        variant: "destructive"
      });
      return;
    }
    
    setShowDeleteConfirm(walletId);
  };
  
  const confirmDelete = async (walletId: string) => {
    const walletName = wallets.find(w => w.id === walletId)?.name;
    try {
      const success = await deleteWallet(walletId);
      
      if (success) {
        toast({
          title: "Cüzdan Silindi",
          description: `"${walletName}" cüzdanı başarıyla silindi.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Cüzdan Silinemedi",
          description: "En az bir cüzdan bulunmalıdır.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting wallet:", error);
      toast({
        title: "Silme Hatası",
        description: "Cüzdan silinirken bir hata oluştu.",
        variant: "destructive"
      });
    }
    
    setShowDeleteConfirm(null);
  };
  
  const handleCreateWallet = async (name: string, walletData: any) => {
    try {
      // After CreateWalletPanel creates wallet, we need to refresh wallet list
      setShowCreatePanel(false);
      
      toast({
        title: "Cüzdan Oluşturuldu",
        description: `"${name}" cüzdanı başarıyla oluşturuldu.`,
        variant: "default"
      });
      
      // Yeni cüzdanın bilgilerini direkt olarak ekleyelim
      if (walletData?.wallet) {
        const newWallet: WalletInfo = {
          id: walletData.wallet.id.toString(),
          name: name,
          type: 'local',
          isActive: false,
          dateCreated: new Date().toISOString()
        };
        
        // Mevcut cüzdan listesine ekleyelim
        const updatedWallets = [...wallets, newWallet];
        
        // Aktif olmayan cüzdanlar haline getirelim hepsini
        const deactivatedWallets = updatedWallets.map(w => ({
          ...w,
          isActive: false
        }));
        
        // Yeni cüzdanı aktif hale getirelim
        if (newWallet) {
          // Setwallets ile deactivatedWallets listesini güncelle
          setWallets(deactivatedWallets);
          
          // Yeni cüzdanı aktif yap
          setActiveWallet(newWallet.id);
        }
      }
    } catch (error) {
      console.error("Error handling wallet creation:", error);
      toast({
        title: "Wallet Ekleme Hatası",
        description: `Cüzdan listeye eklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        variant: "destructive"
      });
    }
  };
  
  const handleImportWallet = async (name: string, walletData: any) => {
    try {
      // Panel'i kapat
      setShowImportPanel(false);
      
      toast({
        title: "Cüzdan İçe Aktarıldı",
        description: `"${name}" cüzdanı başarıyla içe aktarıldı.`,
        variant: "default"
      });
      
      // Yeni cüzdanın bilgilerini ekle
      if (walletData?.wallet) {
        const newWallet: WalletInfo = {
          id: walletData.wallet.id.toString(),
          name: name,
          type: 'imported',
          importMethod: walletData.wallet.type === 'imported_mnemonic' ? 'mnemonic' : 'privateKey',
          isActive: false,
          dateCreated: new Date().toISOString()
        };
        
        // Update wallets
        const updatedWallets = [...wallets, newWallet];
        
        // Make all wallets inactive
        const deactivatedWallets = updatedWallets.map(w => ({
          ...w,
          isActive: false
        }));
        
        // Update wallet list and set new wallet as active
        setWallets(deactivatedWallets);
        setActiveWallet(newWallet.id);
      }
    } catch (error) {
      console.error("Error importing wallet:", error);
      toast({
        title: "İçe Aktarma Hatası",
        description: `Cüzdan içe aktarılırken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
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
                              Bu cüzdanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => setShowDeleteConfirm(null)}
                            >
                              İptal
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => confirmDelete(wallet.id)}
                            >
                              Sil
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
                      Yeni Cüzdan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => setShowImportPanel(true)}
                    >
                      <Import className="h-3.5 w-3.5 mr-1.5" />
                      Cüzdan İçe Aktar
                    </Button>
                    {wallets.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs border-gray-700 text-gray-300 hover:bg-gray-800 col-span-2"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Cüzdanları Yönet
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
                      Tamam
                    </Button>
                  </div>
                )}
                
                {showDeleteConfirm && (
                  <div className="border-t border-gray-800 mt-2 pt-2">
                    <div className="bg-red-900/30 p-3 rounded-md mb-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-white mb-1">Cüzdanı Silmek İstediğinize Emin Misiniz?</h4>
                          <p className="text-xs text-gray-300 mb-2">
                            Bu işlem geri alınamaz ve cüzdandaki tüm bilgiler silinecektir.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          İptal
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => confirmDelete(showDeleteConfirm)}
                        >
                          Sil
                        </Button>
                      </div>
                    </div>
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