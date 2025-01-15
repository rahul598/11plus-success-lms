import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const billingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postcode: z.string().min(5, "Valid postcode is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const total = 0; // This will be calculated from cart items

  const form = useForm<z.infer<typeof billingSchema>>({
    resolver: zodResolver(billingSchema),
  });

  const onSubmit = async (values: z.infer<typeof billingSchema>) => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Handle payment processing
      console.log("Processing payment", values);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#2D3648] mb-6">
          Checkout
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Progress Steps */}
                <div className="flex justify-between mb-8">
                  <div className={`text-sm ${step >= 1 ? "text-primary" : "text-gray-400"}`}>
                    1. Billing Details
                  </div>
                  <div className={`text-sm ${step >= 2 ? "text-primary" : "text-gray-400"}`}>
                    2. Payment
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {step === 1 && (
                      <>
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your city" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="postcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postcode</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your postcode" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="card"
                                name="payment"
                                value="card"
                                checked={paymentMethod === "card"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="form-radio"
                              />
                              <Label htmlFor="card">Credit/Debit Card</Label>
                            </div>
                          </div>
                        </div>

                        {paymentMethod === "card" && (
                          <div className="space-y-4">
                            <div>
                              <Label>Card Number</Label>
                              <Input placeholder="1234 5678 9012 3456" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Expiry Date</Label>
                                <Input placeholder="MM/YY" />
                              </div>
                              <div>
                                <Label>CVV</Label>
                                <Input type="password" placeholder="123" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      {step > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(step - 1)}
                        >
                          Back
                        </Button>
                      )}
                      <Button
                        type="submit"
                        className="bg-[#32DBC9] text-white hover:bg-[#2BC4B4]"
                      >
                        {step === 1 ? "Continue to Payment" : "Place Order"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
