"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, X, Loader2, Calendar, MapPin, Building2 } from 'lucide-react';
import { authFetch } from '@/lib/api-utils';
import { toast } from 'sonner';

interface CreateShipmentModalProps {
    orderId: string;
    orderNumber: string;
    defaultOrigin?: string;
    defaultDestination?: string;
    onClose: () => void;
}

export function CreateShipmentModal({
    orderId,
    orderNumber,
    defaultOrigin = '',
    defaultDestination = '',
    onClose
}: CreateShipmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        carrier: '',
        origin: defaultOrigin,
        destination: defaultDestination,
        estimatedDelivery: '',
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await authFetch('/api/shipments', {
                method: 'POST',
                body: JSON.stringify({
                    orderId,
                    ...formData,
                    estimatedDelivery: new Date(formData.estimatedDelivery).toISOString(),
                }),
            }) as Response;

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create shipment');
            }

            toast.success('Shipment created successfully');
            router.refresh();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-[#151c2a] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl text-primary">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Create Shipment</h3>
                            <p className="text-[10px] text-slate-500 font-mono tracking-wider">ORDER: {orderNumber}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" />
                            Carrier Name
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. FedEx, DHL, Maersk"
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all text-white placeholder:text-slate-600"
                            value={formData.carrier}
                            onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                Origin
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="City, Country"
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all text-white placeholder:text-slate-600"
                                value={formData.origin}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                Destination
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="City, Country"
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all text-white placeholder:text-slate-600"
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Estimated Delivery
                        </label>
                        <input
                            required
                            type="date"
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all text-white [color-scheme:dark]"
                            value={formData.estimatedDelivery}
                            onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                            Create Shipment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
