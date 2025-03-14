import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import OtpVerification from "../../components/otp_verification"; // We'll create this component
import { useRouter } from "next/router";

const formSchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email().optional(),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    gstNumber: z.string().regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GSTIN format. Must be 15 characters in the correct format"
      ).optional(),
    aadharCard: z.string().regex(/^[0-9]{12}$/, "Aadhar card must be exactly 12 digits").optional(),
    panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "PAN card must be exactly 10 characters").optional(),
});

export default function Onboarding() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phoneNumber: "",
            gstNumber: "",
        },
    });
    
    const [userData, setUserData] = useState<z.infer<typeof formSchema> | null>(null);
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);
        
        try {
            // Check if user exists
            const checkResponse = await fetch('/api/checkuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: values.phoneNumber,
                }),
            });
    
            if (!checkResponse.ok) {
                throw new Error('Failed to check phone number');
            }
    
            const checkData = await checkResponse.json();
            
            if (checkData.exists) {
                setError("Phone number already exists");
                return;
            }
            
            // Request OTP if user doesn't exist
            const otpResponse = await fetch('http://localhost:3001/auth/create_otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: values.phoneNumber }),
            });
            
            if (!otpResponse.ok) {
                const errorData = await otpResponse.json();
                throw new Error(errorData.message || 'Failed to send OTP');
            }
            
            // const otpData = await otpResponse.json();
            
            // Store user data and show OTP verification screen
            setUserData(values);
            setShowOtpVerification(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }
    
    // Function to handle successful OTP verification
    const handleOtpSuccess = () => {
        // Redirect or show success message
        alert("Verification successful! User data has been saved.");
        // You might want to redirect to another page or show a success component
        router.push("/billing/new_bill");
    };

    if (showOtpVerification && userData) {
        return (
            <OtpVerification 
                phoneNumber={userData.phoneNumber} 
                userData={userData}
                onSuccess={handleOtpSuccess}
            />
        );
    }

    return (
        <>
        <div className="h-20 bg-orange-600 flex justify-center items-center">
                <h1 className="text-white font-bold font-mono text-5xl">Onboarding</h1>
        </div>
        <div className="mt-4 mins-h-screen bg-black flex flex-col gap-5">
            
            <div className="flex justify-center items-center flex-col gap-5">
                <div className="w-96 bg-white p-6 rounded-lg">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-black">Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            {/* Other form fields here... */}
                            
                        
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Email (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="example@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="10-digit phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="gstNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">GST Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="15-character GST number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="aadharCard"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Aadhar Card (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="12-digit Aadhar number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="panCard"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Pan Card (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter pan card number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                disabled={isLoading}
                            >
                                <p className="text-2xl text-white font-mono">
                                    {isLoading ? "Sending..." : "Generate OTP"}
                                </p>
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
        </>
    );
}