"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  SetStateAction,
} from "react";
import { Plan } from "../MemberModal";
// Define the types for the context
interface ModalContextType {
  isSignupModalOpen: boolean;
  isLoginModalOpen: boolean;
  isMemberModalOpen: boolean;
  resendOtp: boolean;
  setIsMemberModalOpen: React.Dispatch<SetStateAction<boolean>>;
  openSignupModal: () => void;
  closeSignupModal: () => void;
  openLoginModal: () => void;
  otpMail: string;
  setOtpMail: React.Dispatch<SetStateAction<string>>;
  isOtpModalOpen: boolean;
  plan: Plan | undefined;
  setPlan: React.Dispatch<SetStateAction<Plan | undefined>>;
  closeLoginModal: () => void;
  setIsSignupModalOpen: React.Dispatch<SetStateAction<boolean>>;
  setIsLoginModalOpen: React.Dispatch<SetStateAction<boolean>>;
  setIsOtpModalOpen: React.Dispatch<SetStateAction<boolean>>;
  setResendOtp: React.Dispatch<SetStateAction<boolean>>;
}

// Create the context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// ModalProvider component to wrap your app
export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const [plan, setPlan] = useState<Plan | undefined>();
  const [resendOtp, setResendOtp] = useState<boolean>(false);
  const [otpMail, setOtpMail] = useState<string>("");

  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeSignupModal = () => setIsSignupModalOpen(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <ModalContext.Provider
      value={{
        plan,
        setPlan,
        isSignupModalOpen,
        isLoginModalOpen,
        openSignupModal,
        closeSignupModal,
        openLoginModal,
        closeLoginModal,
        setIsSignupModalOpen,
        setIsLoginModalOpen,
        isMemberModalOpen,
        setIsMemberModalOpen,
        setIsOtpModalOpen,
        isOtpModalOpen,
        resendOtp,
        setResendOtp,
        otpMail,
        setOtpMail,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use the ModalContext
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
