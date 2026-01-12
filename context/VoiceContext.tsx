import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TicketContextData {
  id: string;
  title: string;
  description: string;
  onReply: (text: string) => void;
}

interface VoiceContextType {
  isOpen: boolean;
  openVoice: () => void;
  closeVoice: () => void;
  toggleVoice: () => void;
  setTicketContext: (data: TicketContextData) => void;
  clearTicketContext: () => void;
  ticketData: TicketContextData | null;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketData, setTicketData] = useState<TicketContextData | null>(null);

  const openVoice = () => setIsOpen(true);
  const closeVoice = () => setIsOpen(false);
  const toggleVoice = () => setIsOpen(prev => !prev);

  const setTicketContext = (data: TicketContextData) => {
    setTicketData(data);
  };

  const clearTicketContext = () => {
    setTicketData(null);
  };

  return (
    <VoiceContext.Provider value={{ 
      isOpen, 
      openVoice, 
      closeVoice, 
      toggleVoice,
      setTicketContext, 
      clearTicketContext, 
      ticketData 
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};