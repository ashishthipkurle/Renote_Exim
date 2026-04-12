"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CheckoutFormProps {
 amount: number;
 orderId: string;
}

export default function CheckoutForm({ amount, orderId }: CheckoutFormProps) {
 const stripe = useStripe();
 const elements = useElements();
 const [isProcessing, setIsProcessing] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 if (!stripe || !elements) {
 return;
 }

 setIsProcessing(true);

 const { error } = await stripe.confirmPayment({
 elements,
 confirmParams: {
 return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
 },
 });

 if (error) {
 toast.error(error.message ?? "An error occurred with your payment.");
 } else {
 // Payment successful - redirected to return_url
 }

 setIsProcessing(false);
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <PaymentElement />
 <Button 
 type="submit" 
 disabled={!stripe || isProcessing} 
 className="w-full h-12 text-lg font-bold"
 >
 {isProcessing ? "Processing..." : `Pay $${amount}`}
 </Button>
 </form>
 );
}
