"use client";

import React, { useRef, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { X, Crop as CropIcon, Check, Loader2, RotateCcw, Plus } from "lucide-react";
import { createPortal } from "react-dom";
import { useImageCrop, InteractiveImage } from "@/hooks/useImageCrop";

interface CropModalProps {
    images: InteractiveImage[];
    onComplete: (croppedImages: InteractiveImage[]) => void;
    onCancel: () => void;
}

export default function CropModal({ images: initialImages, onComplete, onCancel }: CropModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        images,
        activeImage,
        activeIndex,
        crop,
        zoom,
        isConverting,
        isCropping,
        
        setCrop,
        setZoom,
        setCroppedAreaPixels,
        setIsCropping,
        setActiveImageIndex,
        
        handleRotate,
        applyCurrentCrop,
        addImages,
    } = useImageCrop(initialImages, 800);

    const handleSaveAll = () => {
        onComplete(images);
    };

    const handleAddNewClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        
        const newFiles = Array.from(e.target.files);
        const success = addImages(newFiles);
        
        if (!success) {
            alert("Invalid file type or size. Please ensure images are JPG, PNG, or WEBP and under 5MB.");
        }

        e.target.value = "";
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    if (!mounted) return null;

    if (!activeImage) return null; // Safety check

    return createPortal(
        <div className="fixed inset-0 z-[9999] font-sans text-gray-900 h-screen w-screen flex flex-col bg-white animate-in fade-in duration-200">
            <div className="w-full h-full flex flex-col overflow-hidden">
                
                {/* Header Navigation */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm z-10 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div 
                            onClick={onCancel}
                            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-500" />
                        </div>
                        <h1 className="text-lg font-semibold text-gray-800">Edit Assets</h1>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-gray-500">
                        <button 
                            onClick={() => setIsCropping(!isCropping)}
                            className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center ${isCropping ? "bg-[#0047AB] text-white hover:bg-[#003380]" : ""}`}
                            title="Toggle Crop Mode"
                        >
                            <CropIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={handleSaveAll}
                            disabled={isConverting}
                            className="bg-[#0047AB] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#003380] transition-colors shadow-lg shadow-blue-100 flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Batch ({images.length})</span>}
                        </button>
                    </div>
                </header>

                {/* Canvas Preview Area */}
                <div className="flex-grow bg-[#F3F4F6] flex flex-col items-center justify-center p-8 relative overflow-hidden min-h-0">
                    <div className="relative w-full max-w-4xl flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 p-4">
                        
                        {isCropping ? (
                            <div className="relative w-full h-[60vh] md:h-[65vh] rounded-md overflow-hidden bg-black/5">
                                <Cropper
                                    image={activeImage.currentUrl}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                                    onZoomChange={setZoom}
                                    showGrid={true}
                                    restrictPosition={false}
                                    minZoom={0.1}
                                />
                            </div>
                        ) : (
                            <img 
                                src={activeImage.currentUrl} 
                                alt="Original Image" 
                                className="max-w-full max-h-[60vh] md:max-h-[65vh] object-contain block mx-auto rounded-md"
                            />
                        )}

                        {/* Zoom Slider */}
                        {isCropping && (
                            <div className="flex flex-col items-center mt-6 w-full px-4 mb-2 z-10 relative">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Zoom Image</label>
                                <input 
                                    type="range"
                                    min={0.1}
                                    max={3}
                                    step={0.01}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full max-w-sm h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0047AB]"
                                />
                            </div>
                        )}

                    </div>

                    <div className="absolute bottom-6 right-8 flex gap-3">
                        {isCropping && (
                            <button 
                                onClick={applyCurrentCrop}
                                disabled={isConverting}
                                title="Apply Crop to this layer"
                                className="bg-[#0047AB] text-white p-3 rounded-full shadow-lg border border-[#003380] hover:bg-[#003380] hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {isConverting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Check className="h-6 w-6" />}
                            </button>
                        )}
                        <button 
                            onClick={handleRotate}
                            disabled={isConverting}
                            title="Rotate Image 90deg"
                            className={`bg-white p-3 rounded-full shadow-lg border border-gray-100 hover:shadow-xl transition-all text-gray-700 hover:text-[#0047AB] disabled:opacity-50`}
                        >
                            {isConverting ? <Loader2 className="h-6 w-6 animate-spin" /> : <RotateCcw className="h-6 w-6" />}
                        </button>
                        <button 
                            onClick={() => setIsCropping(!isCropping)}
                            title={isCropping ? "Cancel Cropping" : "Start Cropping"}
                            className={`bg-white p-3 rounded-full shadow-lg border border-gray-100 hover:shadow-xl transition-all ${isCropping ? "text-[#0047AB]" : "text-gray-700 hover:text-[#0047AB]"}`}
                        >
                            <CropIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Thumbnail Gallery (Bottom) */}
                <footer className="bg-white border-t border-gray-100 p-6 z-10 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Project Assets ({images.length} Active)</h3>
                    </div>
                    
                    <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        
                        {images.map((img, index) => (
                            <div 
                                key={img.id}
                                onClick={() => {
                                    setActiveImageIndex(index);
                                }}
                                className={`flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden cursor-pointer relative group transition-colors ${activeIndex === index ? "border-[3px] border-[#0047AB]" : "border border-gray-200 hover:border-[#0047AB]"}`}
                            >
                                <img alt={`Upload ${index}`} className="w-full h-full object-cover" src={img.currentUrl} />
                                
                                {img.isCropped && (
                                    <div className="absolute top-1 left-1 bg-[#0047AB] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                        CROPPED
                                    </div>
                                )}
                                
                                {activeIndex === index && (
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                        <span className="text-white text-[10px] font-bold drop-shadow-md">ACTIVE</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add New Button */}
                        <div 
                            onClick={handleAddNewClick}
                            className="flex-shrink-0 w-28 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#0047AB] hover:bg-[#E6F0FF] transition-all text-gray-400 hover:text-[#0047AB]"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg, image/png, image/webp"
                                multiple
                                className="hidden"
                            />
                            <div className="text-center">
                                <Plus className="h-6 w-6 mx-auto" />
                                <span className="text-[10px] font-bold uppercase mt-1 block">Add New</span>
                            </div>
                        </div>
                    </div>
                </footer>

            </div>
        </div>,
        document.body
    );
}
