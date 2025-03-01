// pages/sudo-login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function SudoLoginPage() {
  const router = useRouter();
  
  // State for credential login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // State for OTP login
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Hardcoded phone number for OTP
  const phoneNumber = "7096672611";
  
  // Handle credential login
  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check hardcoded credentials
    if (username === "admin" && password === "1234") {
      toast.success("Login Successful", {
        description: "Redirecting to dashboard...",
      });
      
      // Redirect to home page
      router.push("http://localhost:3000");
    } else {
      toast.error("Login Failed", {
        description: "Invalid username or password",
      });
    }
    
    setIsLoading(false);
  };
  
  // Handle OTP request
  const handleRequestOTP = async () => {
    setOtpLoading(true);
    
    try {
      const response = await fetch("http://localhost:3001/auth/create_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOtpSent(true);
        toast.success("OTP Sent", {
          description: `OTP sent to +91${phoneNumber} via WhatsApp`,
        });
        
        // If there's a time remaining constraint from the server
        if (data.timeRemaining) {
          setTimeRemaining(data.timeRemaining);
          
          // Count down timer
          const timer = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        // Handle rate limiting or other errors
        if (response.status === 429 && data.timeRemaining) {
          setTimeRemaining(data.timeRemaining);
          
          // Count down timer
          const timer = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        
        toast.error("Error", {
          description: data.message || "Failed to send OTP",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Error", {
        description: "Failed to connect to OTP server",
      });
    } finally {
      setOtpLoading(false);
    }
  };
  
  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    
    try {
      const response = await fetch("http://localhost:3001/auth/verify_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success("OTP Verified", {
          description: "Login successful, redirecting...",
        });
        
        // Redirect to home page
        router.push("http://localhost:3000");
      } else {
        toast.error("Verification Failed", {
          description: data.message || "Invalid OTP",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error", {
        description: "Failed to verify OTP",
      });
    } finally {
      setOtpLoading(false);
    }
  };
  
  return (
    <>
      <div className="h-20 bg-orange-600 flex justify-center items-center">
        <h1 className="text-white font-bold font-mono text-5xl">Admin Login</h1>
      </div>
      
      <div className="min-h-screen bg-black flex justify-center items-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-mono">Admin Access</CardTitle>
            <CardDescription className="text-center">
              Login to access the admin dashboard
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="credentials" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credentials">Username & Password</TabsTrigger>
              <TabsTrigger value="otp">Login with OTP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credentials">
              <CardContent className="pt-6">
                <form onSubmit={handleCredentialLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Input
                        id="username"
                        placeholder="Username"
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Input
                        id="password"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="otp">
              <CardContent className="pt-6">
                {otpSent ? (
                  <form onSubmit={handleVerifyOTP}>
                    <div className="grid gap-4">
                      <div className="text-center text-sm text-gray-500">
                        OTP sent to +91{phoneNumber} via WhatsApp
                      </div>
                      
                      <div className="grid gap-2">
                        <Input
                          id="otp"
                          placeholder="Enter 4-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        disabled={otpLoading || otp.length !== 4}
                      >
                        {otpLoading ? "Verifying..." : "Verify OTP"}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={handleRequestOTP}
                        disabled={otpLoading || timeRemaining > 0}
                        className="w-full"
                      >
                        {timeRemaining > 0 
                          ? `Resend OTP in ${timeRemaining}s` 
                          : "Resend OTP"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid gap-4">
                    <div className="text-center text-sm text-gray-500">
                      You will receive an OTP on +91{phoneNumber} via WhatsApp
                    </div>
                    
                    <Button 
                      onClick={handleRequestOTP} 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={otpLoading}
                    >
                      {otpLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex justify-center pt-4">
            <p className="text-xs text-gray-500">
              made with ❤️ by rythmn
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}