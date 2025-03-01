// pages/user/index.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import axios from "axios";

export default function UserLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Countdown timer for OTP resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setError("");
      const response = await axios.post("http://localhost:3001/auth/create_otp", {
        phoneNumber,
      });
      
      setShowOtpInput(true);
      setCountdown(10); // 10 seconds countdown (adjust as needed)
      
      // In development, you might want to see the OTP
      console.log("OTP:", response.data.otp);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 429) {
        setError(`Please wait ${error.response.data.timeRemaining} seconds before requesting again`);
        setCountdown(error.response.data.timeRemaining);
      } else {
        setError("Failed to send OTP. Please try again later.");
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setError("");
      const response = await axios.post("http://localhost:3001/auth/verify_otp", {
        phoneNumber,
        otp,
      });

      if (response.data.success) {
        // Fetch user data from your API
        const userResponse = await axios.get(`/api/user?phoneNumber=${phoneNumber}`);
        const userData = userResponse.data;
        
        // Store user data in state and localStorage for persistence
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Redirect to user home page
        router.push("/user/home");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to verify OTP. Please try again.");
      } else {
        setError("Failed to verify OTP. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">User Login</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        {!showOtpInput ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-black">Phone Number</label>
              <Input 
                type="tel"
                maxLength={10}
                placeholder="Enter your 10-digit phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleRequestOtp}
              disabled={countdown > 0}
              className="w-full"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Enter OTP</label>
              <Input 
                type="text"
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full"
              />
              {countdown > 0 && (
                <p className="text-sm text-gray-500 mt-2">Resend in {countdown} seconds</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleVerifyOtp}
                className="flex-1"
              >
                Verify OTP
              </Button>
              {countdown === 0 && (
                <Button 
                  onClick={handleRequestOtp}
                  variant="outline"
                  className="flex-1"
                >
                  Resend OTP
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}