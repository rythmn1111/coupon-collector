// Enhanced version with search/filter
import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

// Define interfaces for our data
interface AdminSale {
  id: number;
  buyerPhoneNumber: string;
  buyerId: number;
  productNamesWithQuantity: Record<string, number>;
  totalPrice: number;
  buyerRole: string;
  buyerName?: string;
}

export default function AdminSalesTable() {
  const [salesData, setSalesData] = useState<AdminSale[]>([]);
  const [filteredData, setFilteredData] = useState<AdminSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('/api/admin-sales1');
        
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
        
        const data = await response.json();
        setSalesData(data);
        setFilteredData(data);
      } catch (err) {
        setError('Error loading sales data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalesData();
  }, []);

  // Filter data when search term changes
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredData(salesData);
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = salesData.filter(sale => 
      sale.buyerName?.toLowerCase().includes(lowercasedSearch) ||
      sale.buyerPhoneNumber.includes(searchTerm) ||
      Object.keys(sale.productNamesWithQuantity).some(product => 
        product.toLowerCase().includes(lowercasedSearch)
      )
    );
    
    setFilteredData(filtered);
  }, [searchTerm, salesData]);

  // Function to format products and quantities as a readable string
  const formatProductsList = (productsObj: Record<string, number>) => {
    return Object.entries(productsObj)
      .map(([product, quantity]) => `${product} (${quantity})`)
      .join(", ");
  };

  // Calculate total amount from all sales
  const totalAmount = filteredData.reduce((total, sale) => total + sale.totalPrice, 0);

  return (
    <>
      <div className="h-20 bg-orange-600 flex justify-center items-center">
        <h1 className="text-white font-bold font-mono text-5xl ">Admin Sales Records</h1>
      </div>
      
      <div className="p-6 min-h-screen bg-black">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-mono">Sales History</CardTitle>
            <CardDescription>
              A complete list of all sales transactions made through the admin panel
            </CardDescription>
            <div className="mt-4">
              <Input
                placeholder="Search by name, phone or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading sales data...</div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                {searchTerm ? "No matching sales records found." : "No sales records found."}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableCaption>List of all admin sales transactions</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Buyer Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead className="text-right">Total Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.id}</TableCell>
                        <TableCell>{sale.buyerName || "Unknown"}</TableCell>
                        <TableCell>{sale.buyerPhoneNumber}</TableCell>
                        <TableCell className="capitalize">{sale.buyerRole}</TableCell>
                        <TableCell>{formatProductsList(sale.productNamesWithQuantity)}</TableCell>
                        <TableCell className="text-right">₹{sale.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              Showing {filteredData.length} of {salesData.length} entries
            </div>
            <div className="font-bold">
              Total Amount: ₹{totalAmount.toFixed(2)}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}