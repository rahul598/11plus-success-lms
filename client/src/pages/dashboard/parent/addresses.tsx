import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Trash } from "lucide-react";

const addressSchema = z.object({
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postcode: z.string().min(1, "Postcode is required"),
  type: z.string().min(1, "Address type is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface Address extends AddressFormValues {
  id: string;
}

export default function ParentAddressesPage() {
  const { toast } = useToast();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postcode: "",
      type: "home",
    },
  });

  // Mock addresses data
  const mockAddresses: Address[] = [
    {
      id: "1",
      addressLine1: "123 Main St",
      addressLine2: "Apt 4B",
      city: "London",
      state: "Greater London",
      postcode: "SW1A 1AA",
      type: "home",
    },
    {
      id: "2",
      addressLine1: "456 Business Ave",
      city: "Manchester",
      state: "Greater Manchester",
      postcode: "M1 1AA",
      type: "work",
    },
  ];

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["/api/parent/addresses"],
    queryFn: async () => {
      const response = await fetch("/api/parent/addresses");
      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }
      return response.json();
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (data: AddressFormValues & { id?: string }) => {
      const response = await fetch(`/api/parent/addresses${data.id ? `/${data.id}` : ''}`, {
        method: data.id ? 'PUT' : 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update address");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Address saved successfully",
      });
      setEditingAddress(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: AddressFormValues) {
    updateAddressMutation.mutate({
      ...data,
      id: editingAddress?.id,
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Type</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="home/work/other" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  {editingAddress && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingAddress(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit">
                    {editingAddress ? "Update" : "Add"} Address
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* List of Addresses */}
        <Card>
          <CardHeader>
            <CardTitle>Your Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAddresses.map((address) => (
                <div
                  key={address.id}
                  className="border rounded-lg p-4 flex justify-between items-start"
                >
                  <div>
                    <div className="font-medium">{address.type.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">
                      {address.addressLine1}
                      {address.addressLine2 && <>, {address.addressLine2}</>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {address.city}, {address.state}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {address.postcode}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingAddress(address);
                        form.reset(address);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
