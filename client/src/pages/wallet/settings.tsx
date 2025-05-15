import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Shield, 
  Key, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Save, 
  Moon, 
  Sun, 
  AlertTriangle,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Background from '@/components/wallet/Background';
import NavigationBar from '@/components/wallet/NavigationBar';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState('5');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const { toast } = useToast();
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real application, we would verify the current password
    // and update to the new password here.
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
      variant: "default"
    });
    
    // Clear form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };
  
  const handleRevealSeedPhrase = () => {
    // In a real app, this would fetch the encrypted seed phrase
    // and decrypt it after user authentication
    setSeedPhrase('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12');
    setShowSeedPhrase(true);
    
    // Security warning
    toast({
      title: "Security Warning",
      description: "Never share your seed phrase with anyone. Keep it in a safe place.",
      variant: "destructive"
    });
  };
  
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    
    toast({
      title: `${!isDarkMode ? 'Dark' : 'Light'} Mode Enabled`,
      description: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode.`,
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <Background />
      
      <div className="relative z-10">
        <NavigationBar />
        
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href="/wallet">
              <Button variant="ghost" className="text-gray-300 hover:text-white -ml-2">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white ml-2">Settings</h1>
          </div>
          
          <Tabs defaultValue="security" className="w-full">
            <div className="mb-6">
              <TabsList className="bg-gray-800/60 border border-gray-700 w-full sm:w-auto">
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="backup" className="gap-2">
                  <Key className="w-4 h-4" />
                  <span>Backup</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Preferences</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="security">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-400" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <Label htmlFor="current-password" className="text-gray-300">Current Password</Label>
                        <div className="relative mt-1.5">
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="new-password" className="text-gray-300">New Password</Label>
                        <div className="relative mt-1.5">
                          <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="confirm-password" className="text-gray-300">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white mt-1.5"
                        />
                      </div>
                      
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white mt-2 w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-white">Auto-Lock Wallet</h3>
                          <p className="text-sm text-gray-400">Lock wallet after inactivity</p>
                        </div>
                        <Switch checked={true} />
                      </div>
                      
                      <div>
                        <Label htmlFor="auto-lock-time" className="text-gray-300">Auto-Lock After (minutes)</Label>
                        <Input
                          id="auto-lock-time"
                          type="number"
                          min="1"
                          max="60"
                          value={autoLockTime}
                          onChange={(e) => setAutoLockTime(e.target.value)}
                          className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white mt-1.5"
                        />
                      </div>
                    </div>
                    
                    <Separator className="bg-gray-700" />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-white">Biometric Authentication</h3>
                          <p className="text-sm text-gray-400">Use fingerprint or face ID to unlock</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-white">Sign-In Notification</h3>
                          <p className="text-sm text-gray-400">Get notified of login attempts</p>
                        </div>
                        <Switch checked={true} />
                      </div>
                    </div>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save Security Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="backup">
              <motion.div 
                className="grid grid-cols-1 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-400" />
                      Recovery Seed Phrase
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-semibold text-red-400">Security Warning</h3>
                          <p className="text-sm text-gray-300 mt-1">
                            Your seed phrase is the only way to recover your wallet if you lose access.
                            Write it down and store it in a secure location. Never share it with anyone.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {!showSeedPhrase ? (
                      <Button
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={handleRevealSeedPhrase}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Reveal Seed Phrase
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <div className="grid grid-cols-3 gap-2">
                            {seedPhrase.split(' ').map((word, index) => (
                              <div key={index} className="bg-gray-700 rounded p-2 text-center">
                                <span className="text-xs text-gray-400">{index + 1}.</span>
                                <span className="ml-1 text-sm text-white font-mono">{word}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                            onClick={() => setShowSeedPhrase(false)}
                          >
                            <EyeOff className="w-4 h-4 mr-2" />
                            Hide Phrase
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(seedPhrase);
                              toast({
                                title: "Copied to Clipboard",
                                description: "Seed phrase has been copied to clipboard.",
                                variant: "default"
                              });
                            }}
                          >
                            Copy Phrase
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-blue-400" />
                      Backup & Restore
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-white">Create Wallet Backup</h3>
                      <p className="text-sm text-gray-400">
                        Export an encrypted backup file of your wallet. This file will be password protected.
                      </p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                        Create Backup File
                      </Button>
                    </div>
                    
                    <Separator className="bg-gray-700" />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-white">Restore from Backup</h3>
                      <p className="text-sm text-gray-400">
                        Restore your wallet from a backup file or by entering your seed phrase.
                      </p>
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-2">
                        Restore Wallet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="preferences">
              <motion.div 
                className="grid grid-cols-1 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900/60 backdrop-blur-md border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      Appearance & Language
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">Dark Mode</h3>
                        <p className="text-sm text-gray-400">Toggle between light and dark theme</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className={`w-4 h-4 ${!isDarkMode ? 'text-yellow-400' : 'text-gray-500'}`} />
                        <Switch 
                          checked={isDarkMode} 
                          onCheckedChange={handleToggleDarkMode}
                        />
                        <Moon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-gray-500'}`} />
                      </div>
                    </div>
                    
                    <Separator className="bg-gray-700" />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-white">Currency Display</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Show Fiat Values</p>
                        </div>
                        <Switch checked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Primary Currency</p>
                        </div>
                        <select className="bg-gray-800 border-gray-700 text-white rounded py-1 px-2">
                          <option value="usd">USD</option>
                          <option value="eur">EUR</option>
                          <option value="gbp">GBP</option>
                          <option value="jpy">JPY</option>
                        </select>
                      </div>
                    </div>
                    
                    <Separator className="bg-gray-700" />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-white">Language</h3>
                      <select className="bg-gray-800 border-gray-700 text-white rounded py-2 px-3 w-full">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="tr">Türkçe</option>
                      </select>
                    </div>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
