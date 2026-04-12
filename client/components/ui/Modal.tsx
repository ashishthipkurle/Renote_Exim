"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 children: React.ReactNode;
 maxWidth?: string;
}

export default function Modal({
 isOpen,
 onClose,
 title,
 children,
 maxWidth = "max-w-2xl",
}: ModalProps) {
 const modalRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleEscape = (e: KeyboardEvent) => {
 if (e.key === "Escape") onClose();
 };

 if (isOpen) {
 document.body.style.overflow = "hidden";
 window.addEventListener("keydown", handleEscape);
 }

 return () => {
 document.body.style.overflow = "unset";
 window.removeEventListener("keydown", handleEscape);
 };
 }, [isOpen, onClose]);

 if (!isOpen) return null;

 return createPortal(
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
 onClick={onClose}
 />

 {/* Modal Content */}
 <div
 ref={modalRef}
 className={`relative w-full ${maxWidth} bg-black border border-white/10 shadow-2xl rounded-lg overflow-hidden animate-in zoom-in-95 fade-in duration-300`}
 >
 <div className="flex items-center justify-between p-6 border-b border-white/5">
 <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
 <button
 onClick={onClose}
 className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground/60 hover:text-white transition-all active:scale-90"
 >
 <span className="sr-only">Close</span>
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
 {children}
 </div>
 </div>
 </div>,
 document.body
 );
}
