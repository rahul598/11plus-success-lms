import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, MinusCircle, PlusCircle } from "lucide-react";
import { Link } from "wouter";

export default function CartPage() {
  // TODO: Implement cart state management
  const cartItems = []; // This will be replaced with actual cart items
  const total = 0; // This will be calculated from cart items

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#2D3648] mb-6">
          Your Cart
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <Card>
              <ScrollArea className="h-[400px] md:h-[600px]">
                <CardContent className="p-6">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-lg text-gray-500 mb-4">Your cart is empty</p>
                      <Link href="/">
                        <Button>Continue Shopping</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Cart items will be mapped here */}
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  className="w-full bg-[#32DBC9] text-white hover:bg-[#2BC4B4]"
                  disabled={cartItems.length === 0}
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
