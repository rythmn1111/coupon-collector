// components/OtpVerification.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { z } from "zod";

type UserData = {
    name: string;
    email?: string;
    phoneNumber: string;
    gstNumber?: string;
    aadharCard?: string;
    panCard?: string;
};

interface OtpVerificationProps {
    phoneNumber: string;
    userData: UserData;
    onSuccess: () => void;
}

export default function OtpVerification({ phoneNumber, userData, onSuccess }: OtpVerificationProps) {
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    async function verifyOtp() {
        if (otp.length !== 4) {
            setError("Please enter a valid 4-digit OTP");
            return;
        }
        
        setIsVerifying(true);
        setError(null);
        
        try {
            // Verify OTP
            const verifyResponse = await fetch('http://localhost:3001/auth/verify_otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    phoneNumber, 
                    otp 
                }),
            });
            
            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok) {
                throw new Error(verifyData.message || 'OTP verification failed');
            }
            
            // If OTP is verified, save user data to database
            const saveResponse = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber,
                    gstNumber: userData.gstNumber || null,
                    aadharCard: userData.aadharCard || null,
                    panCard: userData.panCard || null
                }),
            });
            
            const saveData = await saveResponse.json();
            
            if (!saveResponse.ok) {
                throw new Error(saveData.message || 'Failed to save user data');
            }
            
            // Call the success callback
            onSuccess();
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsVerifying(false);
        }
    }
    
    return (
        <div className="min-h-screen bg-black">
            <div className="h-20 bg-orange-600 flex justify-center items-center">
                <h1 className="text-white font-bold font-mono text-5xl">OTP Verification</h1>
            </div>
            
            <div className="mt-4 flex justify-center items-center flex-col gap-5">
                <div className="w-96 bg-white p-6 rounded-lg">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
                    
                    <div className="text-center mb-6">
                        <p className="text-gray-700">
                            We have sent a verification code to
                        </p>
                        <p className="font-bold text-black">+91 {phoneNumber}</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enter OTP
                            </label>
                            <Input
                                className="text-center text-2xl tracking-widest"
                                maxLength={4}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="• • • •"
                            />
                        </div>
                        
                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            onClick={verifyOtp}
                            disabled={isVerifying}
                        >
                            <p className="text-2xl text-white font-mono">
                                {isVerifying ? "Verifying..." : "Verify OTP"}
                            </p>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}