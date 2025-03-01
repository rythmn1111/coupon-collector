// pages/user/home.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

interface User {
  id: number;
  name: string;
  buyerRole: string;
  totalReward: number;
  phoneNumber: string;
  // Add other user properties as needed
}

export default function UserHome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user data from localStorage on component mount
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if no user data found
      router.push("/user");
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleSellClick = () => {
    router.push("/user/sell");
  };

  const handleInventoryClick = () => {
    router.push("/user/inventory");
  };

  const handleAllBillClick = () => {
    router.push("/user/bills");
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header with role name and points */}
      <div className="border-2 border-pink-500 rounded-lg m-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-pink-700 text-2xl font-bold">{user.name} - {user.buyerRole}</h1>
          <div className="text-pink-700">
            <span>points = {user.totalReward}</span>
          </div>
        </div>
        
        {/* Menu Buttons */}
        <div className="mt-8 space-y-4 flex flex-col items-center">
          {/* Only show sell button for p1 and p2 roles */}
          {(user.buyerRole === "p1" || user.buyerRole === "p2") && (
            <Button 
              className="bg-blue-100 text-blue-600 hover:bg-blue-200 w-64 py-6 text-xl"
              onClick={handleSellClick}
            >
              sell
            </Button>
          )}
          
          <Button 
            className="bg-blue-100 text-blue-600 hover:bg-blue-200 w-64 py-6 text-xl"
            onClick={handleInventoryClick}
          >
            inventory
          </Button>
          
          <Button 
            className="bg-blue-100 text-blue-600 hover:bg-blue-200 w-64 py-6 text-xl"
            onClick={handleAllBillClick}
          >
            all bill
          </Button>
        </div>
      </div>
    </div>
  );
}