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
  sellingBalance?: Record<string, number>; // Adding sellingBalance which could be like {"paint 1": 1, "paint 2": 10}
  // Add other user properties as needed
}

export default function UserHome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInventory, setShowInventory] = useState(false);
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
    // Toggle inventory display on the current page
    setShowInventory(!showInventory);
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
       
        {/* Inventory section that shows when toggled */}
        {showInventory && (
          <div className="mt-4 border-t-2 border-pink-300 pt-4">
            <h2 className="text-pink-700 text-xl font-bold mb-2">Your Inventory</h2>
            {user.sellingBalance && Object.keys(user.sellingBalance).length > 0 ? (
              <div className="bg-white rounded-lg p-4 shadow">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-pink-600 pb-2">Product</th>
                      <th className="text-right text-pink-600 pb-2">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(user.sellingBalance).map(([product, quantity]) => (
                      <tr key={product} className="border-t border-pink-100">
                        <td className="py-2 text-gray-700">{product}</td>
                        <td className="py-2 text-right text-gray-700">{quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No items in your inventory</p>
            )}
          </div>
        )}

        {/* Menu Buttons */}
        <div className="mt-8 space-y-4 flex flex-col items-center">
          {/* Only show sell button for p1 and p2 roles */}
          {(user.buyerRole === "p1" || user.buyerRole === "p2") && (
            <Button
              className="bg-blue-100 text-blue-600 hover:bg-blue-200 w-64 py-6 text-xl"
              onClick={handleSellClick}
            >
              Sell
            </Button>
          )}
         
          <Button
            className={`${showInventory ? 'bg-blue-200 text-blue-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} w-64 py-6 text-xl`}
            onClick={handleInventoryClick}
          >
            {showInventory ? 'Hide Inventory' : 'Show Inventory'}
          </Button>
         
          <Button
            className="bg-blue-100 text-blue-600 hover:bg-blue-200 w-64 py-6 text-xl"
            onClick={handleAllBillClick}
          >
            All Bills
          </Button>
        </div>
      </div>
    </div>
  );
}