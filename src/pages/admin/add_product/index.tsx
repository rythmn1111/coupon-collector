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

const formSchema = z.object({
    productName: z.string().nonempty("Product name is required"),
    price: z.coerce.number().positive("Price must be positive"),
    p1Reward: z.coerce.number().int("P1 Reward must be an integer").nonnegative("P1 Reward must be non-negative"),
    p2Reward: z.coerce.number().int("P2 Reward must be an integer").nonnegative("P2 Reward must be non-negative"),
    p3Reward: z.coerce.number().int("P3 Reward must be an integer").nonnegative("P3 Reward must be non-negative"),
});

export default function AddProduct() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: "",
            price: 0,
            p1Reward: 0,
            p2Reward: 0,
            p3Reward: 0,
        },
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            // Check if product exists
            const checkResponse = await fetch('/api/checkproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productName: values.productName,
                }),
            });
    
            if (!checkResponse.ok) {
                throw new Error('Failed to check product name');
            }
    
            const checkData = await checkResponse.json();
            
            if (checkData.exists) {
                setError("Product name already exists");
                return;
            }
            
            // Create the product
            const createResponse = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });
            
            if (!createResponse.ok) {
                const errorData = await createResponse.json();
                throw new Error(errorData.message || 'Failed to create product');
            }
            
            // Reset form
            form.reset();
            setSuccess("Product added successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
        <div className="h-20 bg-orange-600 flex justify-center items-center">
            <h1 className="text-white font-bold font-mono text-5xl">Add new product</h1>
        </div>
        <div className="mt-4 mins-h-screen bg-black flex flex-col gap-5">
            
            <div className="flex justify-center items-center flex-col gap-5">
                <div className="w-96 bg-white p-6 rounded-lg">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
                    {success && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{success}</div>}
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="productName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-black">Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter product name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-black">Price</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="0.00" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="p1Reward"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black">P1 Reward</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="p2Reward"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black">P2 Reward</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="p3Reward"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black">P3 Reward</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                disabled={isLoading}
                            >
                                <p className="text-2xl text-white font-mono">
                                    {isLoading ? "Saving..." : "Add Product"}
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