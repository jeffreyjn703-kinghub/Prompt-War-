import React, { createContext, useContext, useState } from 'react';
import { SkillDetailPanel } from '../components/SkillDetailPanel';

interface SkillModalContextType {
  openSkillDetail: (skillId: string) => void;
  closeSkillDetail: () => void;
  selectedSkillId: string | null;
}

const SkillModalContext = createContext<SkillModalContextType>({
  openSkillDetail: () => {},
  closeSkillDetail: () => {},
  selectedSkillId: null,
});

export const SkillModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const openSkillDetail = (skillId: string) => {
    setSelectedSkillId(skillId);
  };

  const closeSkillDetail = () => {
    setSelectedSkillId(null);
  };

  return (
    <SkillModalContext.Provider value={{ openSkillDetail, closeSkillDetail, selectedSkillId }}>
      {children}
      <SkillDetailPanel skillId={selectedSkillId} onClose={closeSkillDetail} />
    </SkillModalContext.Provider>
  );
};

export const useSkillModal = () => useContext(SkillModalContext);
