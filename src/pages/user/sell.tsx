// pages/user/sell.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/router";
import axios from "axios";

interface User {
  id: number;
  name: string;
  buyerRole: string;
  totalReward: number;
  phoneNumber: string;
  sellingBalance: Record<string, number> | null;
}

interface Product {
  id: number;
  productName: string;
  price: number;
  p1Reward: number;
  p2Reward: number;
  p3Reward: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function SellPage() {
  const [user, setUser] = useState<User | null>(null);
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerInfo, setBuyerInfo] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  
  // New user registration state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserGst, setNewUserGst] = useState("");
  const [newUserAadhar, setNewUserAadhar] = useState("");
  const [newUserPan, setNewUserPan] = useState("");
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  
  const router = useRouter();

  useEffect(() => {
    // Countdown timer for OTP resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Load user data from localStorage on component mount
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect if user role is p3 (cannot sell)
      if (parsedUser.buyerRole === "p3") {
        router.push("/user/home");
      }
    } else {
      // Redirect to login if no user data found
      router.push("/user");
    }
    
    // Fetch products
    fetchProducts();
    
    setLoading(false);
  }, [router]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products12");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
    }
  };

  const lookupBuyer = async () => {
    if (!buyerPhone || buyerPhone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setError("");
      const response = await axios.get(`/api/users1?phoneNumber=${buyerPhone}`);
      const buyer = response.data;
      
      // Check if buyer has the correct role
      if (
        (user?.buyerRole === "p1" && buyer.buyerRole !== "p2") ||
        (user?.buyerRole === "p2" && buyer.buyerRole !== "p3")
      ) {
        setError(`You can only sell to ${user?.buyerRole === "p1" ? "p2" : "p3"} users`);
        setBuyerInfo(null);
        return;
      }
      
      setBuyerInfo(buyer);
    } catch (error) {
      // If user not found, prompt to register new user
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        setShowRegisterDialog(true);
      } else {
        setError("Error occurred while searching for buyer");
      }
      setBuyerInfo(null);
    }
  };

  const handleRequestOtp = async () => {
    if (!buyerPhone || buyerPhone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setError("");
      const response = await axios.post("http://localhost:3001/auth/create_otp", {
        phoneNumber: buyerPhone,
      });
      
      setOtpSent(true);
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

  const registerNewUser = async () => {
    if (!otp || otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      // First verify OTP
      const verifyResponse = await axios.post("http://localhost:3001/auth/verify_otp", {
        phoneNumber: buyerPhone,
        otp,
      });

      if (!verifyResponse.data.success) {
        setError("Invalid OTP. Please try again.");
        return;
      }

      // Determine the role based on the seller's role
      const newUserRole = user?.buyerRole === "p1" ? "p2" : "p3";

      // Create the new user
      const createResponse = await axios.post("/api/users1", {
        name: newUserName,
        phoneNumber: buyerPhone,
        buyerRole: newUserRole,
        email: newUserEmail || `${buyerPhone}@example.com`, // Default email if not provided
        gstNumber: newUserGst || null,
        adharNumber: newUserAadhar || null,
        panNumber: newUserPan || null,
        sellingBalance: {} // Empty selling balance initially
      });

      // Set the newly created user as the buyer
      setBuyerInfo(createResponse.data);
      setShowRegisterDialog(false);
      setOtpSent(false);
      setOtp("");
      
    } catch (error) {
      console.error("Error registering new user:", error);
      setError("Failed to register new user. Please try again.");
    }
  };

  const addToCart = (product: Product) => {
    // Check if seller has enough stock
    const sellerBalance = user?.sellingBalance || {};
    const availableStock = sellerBalance[product.productName] || 0;
    
    // Get current quantity in cart
    const currentCartItem = cart.find(item => item.product.productName === product.productName);
    const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;
    
    if (currentQuantity + 1 > availableStock) {
      setError(`Not enough stock for ${product.productName}. Available: ${availableStock}`);
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
    
    // Clear any previous errors
    setError("");
  };

  const updateQuantity = (productId: number, productName: string, quantity: number) => {
    // Check available stock for this product
    const sellerBalance = user?.sellingBalance || {};
    const availableStock = sellerBalance[productName] || 0;
    
    if (quantity > availableStock) {
      setError(`Not enough stock for ${productName}. Available: ${availableStock}`);
      return;
    }
    
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    } else {
      setCart(prevCart => 
        prevCart.map(item => 
          item.product.id === productId 
            ? { ...item, quantity } 
            : item
        )
      );
    }
    
    // Clear any previous errors
    setError("");
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!buyerInfo) {
      setError("Please select a valid buyer first");
      return;
    }

    if (cart.length === 0) {
      setError("Cart is empty. Please add products");
      return;
    }

    try {
      const productNamesWithQuantity: Record<string, number> = {};
      cart.forEach(item => {
        productNamesWithQuantity[item.product.productName] = item.quantity;
      });

      await axios.post("/api/transfer-sale", {
        sellerId: user?.id,
        buyerId: buyerInfo.id,
        productNamesWithQuantity,
        totalPrice: getTotalPrice(),
        sellerRole: user?.buyerRole,
        buyerRole: buyerInfo.buyerRole
      });

      // Update the user data in localStorage with new selling balance and rewards
      const updatedUserResponse = await axios.get(`/api/users1?phoneNumber=${user?.phoneNumber}`);
      localStorage.setItem("user", JSON.stringify(updatedUserResponse.data));
      
      // Reset state and show success
      setCart([]);
      setBuyerPhone("");
      setBuyerInfo(null);
      alert("Sale completed successfully!");
      router.push("/user/home");
    } catch (error) {
      console.error("Error during checkout:", error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to complete sale");
      } else {
        setError("Failed to complete sale");
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!user || user.buyerRole === "p3") {
    return null; // Will redirect in useEffect
  }

  // Available stock for display
  const getAvailableStock = (productName: string) => {
    const sellerBalance = user?.sellingBalance || {};
    return sellerBalance[productName] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-black">Sell Products</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      {/* Buyer Selection */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="font-mono">Select Buyer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="tel"
              maxLength={10}
              placeholder="Enter buyer's phone number"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, ''))}
              className="flex-1"
            />
            <Button onClick={lookupBuyer}>Search</Button>
          </div>
          
          {buyerInfo && (
            <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
              <p className="text-black"><strong>Name:</strong> {buyerInfo.name}</p>
              <p className="text-black"><strong>Role:</strong> {buyerInfo.buyerRole}</p>
              <p className="text-black"><strong>Phone:</strong> {buyerInfo.phoneNumber}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Product Selection */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>My Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => {
              const stock = getAvailableStock(product.productName);
              return (
                <div key={product.id} className="border rounded p-3">
                  <h3 className="font-medium">{product.productName}</h3>
                  <p>₹{product.price}</p>
                  <p className={stock > 0 ? "text-green-600" : "text-red-600"}>
                    Stock: {stock}
                  </p>
                  <Button 
                    onClick={() => addToCart(product)}
                    size="sm"
                    className="mt-2"
                    disabled={stock <= 0}
                  >
                    Add to Cart
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Cart */}
      {cart.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.product.id} className="border-b">
                    <td className="p-2">{item.product.productName}</td>
                    <td className="text-right p-2">₹{item.product.price}</td>
                    <td className="text-right p-2">
                      <div className="flex items-center justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.product.productName, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.product.productName, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="text-right p-2">₹{item.product.price * item.quantity}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td colSpan={3} className="text-right p-2">Total:</td>
                  <td className="text-right p-2">₹{getTotalPrice()}</td>
                </tr>
              </tbody>
            </table>
            
            <Button 
              onClick={handleCheckout}
              className="w-full mt-4"
              disabled={!buyerInfo || cart.length === 0}
            >
              Complete Sale
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Button 
        variant="outline"
        onClick={() => router.push("/user/home")}
        className="mt-4"
      >
        Back to Home
      </Button>
      
      {/* New User Registration Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register New {user?.buyerRole === "p1" ? "P2" : "P3"} User</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {otpSent ? (
              <div className="space-y-4">
                <p>We have sent an OTP to {buyerPhone}</p>
                <Input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                {countdown > 0 && (
                  <p className="text-sm text-gray-500">Resend in {countdown} seconds</p>
                )}
                {countdown === 0 && (
                  <Button 
                    variant="outline" 
                    onClick={handleRequestOtp}
                    className="w-full"
                  >
                    Resend OTP
                  </Button>
                )}
                <Button onClick={registerNewUser} className="w-full">Verify & Register</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  placeholder="Full Name (required)"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Email (optional)"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
                <Input
                  placeholder="GST Number (optional)"
                  value={newUserGst}
                  onChange={(e) => setNewUserGst(e.target.value)}
                />
                <Input
                  placeholder="Aadhar Number (optional)"
                  value={newUserAadhar}
                  onChange={(e) => setNewUserAadhar(e.target.value)}
                />
                <Input
                  placeholder="PAN Number (optional)"
                  value={newUserPan}
                  onChange={(e) => setNewUserPan(e.target.value)}
                />
                <Button onClick={handleRequestOtp} className="w-full" disabled={!newUserName}>
                  Send OTP to {buyerPhone}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}