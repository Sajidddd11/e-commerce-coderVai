"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"

export default function WholesaleLink({ 
    children, 
    className 
}: { 
    children: React.ReactNode, 
    className?: string 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Prevent scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsOpen(true);
    };

    const closeModal = () => setIsOpen(false);

    return (
        <>
            <button onClick={handleClick} className={className}>
                {children}
            </button>

            {mounted && isOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" 
                        onClick={closeModal}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-[#0f0f1e] border border-[#56aebf]/30 shadow-[0_0_40px_rgba(86,174,191,0.2)] rounded-3xl p-8 md:p-10 max-w-md w-full text-center animate-modal-pop overflow-hidden">
                        
                        <style dangerouslySetInnerHTML={{__html: `
                            @keyframes modal-pop {
                                0% { opacity: 0; transform: scale(0.95) translateY(20px); }
                                100% { opacity: 1; transform: scale(1) translateY(0); }
                            }
                            .animate-modal-pop {
                                animation: modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                            }
                        `}} />

                        {/* Top Accent Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#56aebf] to-transparent shadow-[0_0_20px_rgba(86,174,191,0.8)]"></div>

                        {/* Close Button */}
                        <button 
                            onClick={closeModal}
                            className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors hover:rotate-90 duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-[#56aebf]/10 flex items-center justify-center mb-6 border border-[#56aebf]/30 shadow-[0_0_30px_rgba(86,174,191,0.2)] relative group">
                            <div className="absolute inset-0 bg-[#56aebf]/20 blur-xl rounded-full"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-[#56aebf] relative z-10">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </div>

                        {/* Text */}
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Coming <span className="text-[#56aebf]">Soon!</span>
                        </h3>
                        <p className="text-white/70 font-light leading-relaxed mb-8">
                            We are upgrading our wholesale platform. For bulk orders and collaboration details, please reach out to our team directly.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row justify-center">
                            <a 
                                href="/contact" 
                                className="bg-[#56aebf] hover:bg-[#458f9e] text-black font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(86,174,191,0.3)] hover:shadow-[0_0_30px_rgba(86,174,191,0.5)] hover:-translate-y-0.5"
                                onClick={closeModal}
                            >
                                Contact Us
                            </a>
                            <button 
                                onClick={closeModal}
                                className="border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300"
                            >
                                Back to Exploring
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
