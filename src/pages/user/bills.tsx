// pages/user/bills.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface User {
  id: number;
  name: string;
  buyerRole: string;
  totalReward: number;
  phoneNumber: string;
}

interface TransferSale {
  id: number;
  sellerId: number;
  buyerId: number;
  productNamesWithQuantity: Record<string, number>;
  totalPrice: number;
  sellerRole: string;
  buyerRole: string;
}

export default function UserBills() {
  const [user, setUser] = useState<User | null>(null);
  const [bills, setBills] = useState<TransferSale[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/user");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Fetch bills for this user
    fetchBills(parsedUser.id);
  }, [router]);

  const fetchBills = async (userId: number) => {
    try {
      // Fetch bills where user is the seller
      const response = await fetch(`/api/bills?sellerId=${userId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch bills");
      }

      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push("/user/home");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-pink-700 text-2xl font-bold">All Bills</h1>
        <Button 
          className="bg-pink-100 text-pink-600 hover:bg-pink-200"
          onClick={handleBackClick}
        >
          Back to Home
        </Button>
      </div>

      {bills.length > 0 ? (
        <div className="space-y-4">
          {bills.map((bill) => (
            <Card key={bill.id} className="border-pink-200">
              <CardHeader className="bg-pink-100">
                <div className="flex justify-between">
                  <CardTitle className="text-pink-700">Bill #{bill.id}</CardTitle>
                  <div className="text-pink-600 font-semibold">₹{bill.totalPrice.toFixed(2)}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Buyer ID:</span>
                    <span className="font-medium">{bill.buyerId}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Buyer Role:</span>
                    <span className="font-medium">{bill.buyerRole}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Seller Role:</span>
                    <span className="font-medium">{bill.sellerRole}</span>
                  </div>
                </div>

                <div className="border-t border-pink-100 pt-3">
                  <h3 className="text-pink-600 font-semibold mb-2">Products</h3>
                  <table className="w-full">
                    <thead className="text-gray-500 text-sm">
                      <tr>
                        <th className="text-left pb-1">Product</th>
                        <th className="text-right pb-1">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(bill.productNamesWithQuantity).map(([product, quantity]) => (
                        <tr key={product} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-1">{product}</td>
                          <td className="py-1 text-right">{quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-2">No bills found</p>
          <p className="text-sm text-gray-400">You haven t made any sales yet</p>
        </div>
      )}
    </div>
  );
}