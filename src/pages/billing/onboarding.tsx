import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
//   FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email().optional(),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    gstNumber: z.string().regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GSTIN format. Must be 15 characters in the correct format"
      ),
      aadharCard: z.string().regex(/^[0-9]{12}$/, "Aadhar card must be exactly 12 digits").optional(),
});

export default function Onboarding() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phoneNumber: "",
            gstNumber: "",
            aadharCard: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Handle form submission
        console.log(values);
    }

    return <>
    <div className="min-h-screen bg-black">
        <div className="h-20 bg-orange-600 flex justify-center items-center">
            <h1 className="text-white font-bold font-mono text-5xl">Onboarding</h1>
        </div>
        <div className="h-[calc(100vh-8rem)] flex justify-center items-center flex-col gap-5">
            <div className="w-96 bg-white p-6 rounded-lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email (Optional)</FormLabel>
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
                                    <FormLabel>Phone Number</FormLabel>
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
                                    <FormLabel>GST Number</FormLabel>
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
                                    <FormLabel>Aadhar Card (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="12-digit Aadhar number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                            <p className="text-2xl text-white font-mono">
                                Generate OTP
                                </p>
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    </div>
    </>
}