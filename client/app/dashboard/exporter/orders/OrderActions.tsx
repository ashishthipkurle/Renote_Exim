"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Package, Truck, Loader2, Plus } from 'lucide-react';
import { authFetch } from '@/lib/api-utils';
import { toast } from 'sonner';
import { CreateShipmentModal } from './CreateShipmentModal';

interface OrderActionsProps {
    orderId: string;
    orderNumber: string;
    currentStatus: string;
    importerCountry?: string;
}

export function OrderActions({ orderId, orderNumber, currentStatus, importerCountry }: OrderActionsProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [showShipmentModal, setShowShipmentModal] = useState(false);
    const router = useRouter();

    const updateStatus = async (newStatus: string) => {
        try {
            setLoading(newStatus);
            const res = await authFetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            }) as Response;

            if (!res.ok) throw new Error('Failed to update status');

            toast.success(`Order status updated to ${newStatus}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update order status');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex flex-wrap gap-3">
            {currentStatus === 'PENDING' && (
                <>
                    <button
                        onClick={() => updateStatus('CONFIRMED')}
                        disabled={!!loading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {loading === 'CONFIRMED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Accept Order
                    </button>
                    <button
                        onClick={() => updateStatus('CANCELLED')}
                        disabled={!!loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {loading === 'CANCELLED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                    </button>
                </>
            )}

            {(currentStatus === 'CONFIRMED' || currentStatus === 'PROCESSING') && (
                <button
                    onClick={() => setShowShipmentModal(true)}
                    disabled={!!loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    <Truck className="w-4 h-4" />
                    Create Shipment
                </button>
            )}

            {currentStatus === 'CONFIRMED' && (
                <button
                    onClick={() => updateStatus('PROCESSING')}
                    disabled={!!loading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-400/20 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    {loading === 'PROCESSING' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                    Mark Processing
                </button>
            )}

            {showShipmentModal && (
                <CreateShipmentModal
                    orderId={orderId}
                    orderNumber={orderNumber}
                    defaultDestination={importerCountry}
                    onClose={() => setShowShipmentModal(false)}
                />
            )}

            {['SHIPPED', 'DELIVERED', 'CANCELLED', 'DISPUTED'].includes(currentStatus) && (
                <p className="text-slate-500 text-sm italic py-2">No further actions available for this status.</p>
            )}
        </div>
    );
}
