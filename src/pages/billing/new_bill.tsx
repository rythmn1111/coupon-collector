import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { useRouter } from "next/router";

// Define types for products
interface Product {
  id: number;
  productName: string;
  price: number;
  p1Reward: number;
  p2Reward: number;
  p3Reward: number;
}

interface ProductWithQuantity {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

// Create a schema for the form
const formSchema = z.object({
  buyerPhoneNumber: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
});

export default function AdminSalesForm() {
//   const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductWithQuantity[]>([]);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [buyerExists, setBuyerExists] = useState(false);
  const [buyerId, setBuyerId] = useState<number | null>(null);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyerPhoneNumber: "",
    },
  });

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products1');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError('Error loading products. Please try again later.');
        console.error(err);
      }
    };
    
    fetchProducts();
  }, []);

  // Check if buyer exists when phone number changes
  const watchBuyerPhone = form.watch("buyerPhoneNumber");
  
  useEffect(() => {
    const checkBuyer = async () => {
      if (watchBuyerPhone && watchBuyerPhone.length === 10) {
        try {
          const response = await fetch(`/api/users/check?phoneNumber=${watchBuyerPhone}`);
          
          if (!response.ok) {
            throw new Error('Failed to check user');
          }
          
          const data = await response.json();
          
          if (data.exists) {
            setBuyerExists(true);
            setBuyerId(data.userId);
          } else {
            setBuyerExists(false);
            setBuyerId(null);
          }
        } catch (err) {
          console.error(err);
          setBuyerExists(false);
          setBuyerId(null);
        }
      } else {
        setBuyerExists(false);
        setBuyerId(null);
      }
    };
    
    checkBuyer();
  }, [watchBuyerPhone]);

  // Function to add product to list
  const addProduct = (productId: number) => {
    const selectedProduct = products.find(p => p.id === productId);
    
    if (!selectedProduct) return;
    
    // Check if product already exists in the selected list
    const existingIndex = selectedProducts.findIndex(p => p.productId === productId);
    
    if (existingIndex >= 0) {
      setError("This product is already added. You can update its quantity.");
      return;
    }
    
    const newProduct: ProductWithQuantity = {
      productId: selectedProduct.id,
      productName: selectedProduct.productName,
      quantity: 1,
      price: selectedProduct.price,
      totalPrice: selectedProduct.price,
    };
    
    const updatedProducts = [...selectedProducts, newProduct];
    setSelectedProducts(updatedProducts);
    updateTotalBillAmount(updatedProducts);
  };

  // Function to remove product from list
  const removeProduct = (index: number) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
    updateTotalBillAmount(updatedProducts);
  };

  // Function to update product quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) quantity = 1;
    
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = quantity;
    updatedProducts[index].totalPrice = quantity * updatedProducts[index].price;
    
    setSelectedProducts(updatedProducts);
    updateTotalBillAmount(updatedProducts);
  };

  // Function to calculate total bill amount
  const updateTotalBillAmount = (products: ProductWithQuantity[]) => {
    const total = products.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotalBillAmount(total);
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!buyerExists || !buyerId) {
      setError("Buyer with this phone number doesn't exist. Please register the user first.");
      return;
    }
    
    if (selectedProducts.length === 0) {
      setError("Please add at least one product");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Convert selected products to the format needed for the database
      const productNamesWithQuantity: Record<string, number> = {};
      selectedProducts.forEach(product => {
        productNamesWithQuantity[product.productName] = product.quantity;
      });
      
      // Prepare data for submission
      const saleData = {
        buyerPhoneNumber: values.buyerPhoneNumber,
        buyerId,
        productNamesWithQuantity,
        totalPrice: totalBillAmount,
        buyerRole: "p1" // Default as per requirement
      };
      
      // Submit the sale
      const response = await fetch('/api/admin-sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create sale');
      }
      
      // Show success message
      setSuccess("Sale has been successfully recorded!");
      
      // Reset form and selections
      form.reset();
      setSelectedProducts([]);
      setTotalBillAmount(0);
      
      // Optional: redirect after success
      // router.push("/admin/sales");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record sale');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="h-20 bg-orange-600 flex justify-center items-center">
        <h1 className="text-white font-bold font-mono text-5xl">Admin Sales Form</h1>
      </div>
      <div className="mt-4 min-h-screen bg-black flex flex-col gap-5">
        <div className="flex justify-center items-center flex-col gap-5">
          <div className="w-full max-w-3xl bg-white p-6 rounded-lg">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
            {success && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{success}</div>}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="buyerPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">Buyer Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter 10-digit phone number" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <div className="mt-1">
                        {buyerExists ? (
                          <span className="text-green-600 text-sm">Buyer found with ID: {buyerId}</span>
                        ) : watchBuyerPhone?.length === 10 ? (
                          <span className="text-red-600 text-sm">Buyer not found. Please register first.</span>
                        ) : null}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-4 text-black">Add Products</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <Select onValueChange={(value) => addProduct(parseInt(value))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.productName} (₹{product.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedProducts.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-2 font-medium text-sm border-b pb-2">
                        <div className="col-span-5 text-black">Product</div>
                        <div className="col-span-2 text-center text-black">Price</div>
                        <div className="col-span-2 text-center text-black">Quantity</div>
                        <div className="col-span-2 text-center text-black">Total</div>
                        <div className="col-span-1 text-black"></div>
                      </div>
                      
                      {selectedProducts.map((product, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5 text-black">{product.productName}</div>
                          <div className="col-span-2 text-center text-black">₹{product.price}</div>
                          <div className="col-span-2 ">
                            <Input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                              className="text-center"
                            />
                          </div>
                          <div className="col-span-2 text-center text-black">₹{product.totalPrice}</div>
                          <div className="col-span-1 text-center">
                            <button 
                              type="button" 
                              onClick={() => removeProduct(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4 text-right">
                        <div className="font-bold text-black">
                          Total: ₹{totalBillAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No products added yet. Select products from the dropdown above.
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading || !buyerExists}
                >
                  <p className="text-2xl text-white font-mono">
                    {isLoading ? "Processing..." : "Submit Sale"}
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