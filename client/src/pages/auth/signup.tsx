import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { RoleSelectionModal } from "@/components/role-selection-modal";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userId, setUserId] = useState<number>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const payload = {
        username: values.email,
        email: values.email,
        name: values.name,
        password: values.password,
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "Please select your role to complete registration",
      });

      setShowRoleModal(true);
      document.body.style.overflow = 'hidden';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/google';
  };

  const handleFacebookSignup = () => {
    window.location.href = '/api/auth/facebook';
  };

  return (
    <div className={`min-h-screen bg-gradient-primary flex items-center justify-center p-4 ${
      showRoleModal ? 'pointer-events-none' : ''
    }`}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-display font-bold text-[#2D3648]">
              Create Account
            </h1>
            <p className="text-[#545F71]">
              Join us to start your learning journey
            </p>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              className="w-full bg-[#4285F4] hover:bg-[#357ABD] text-white flex items-center justify-center gap-2"
              onClick={handleGoogleSignup}
            >
              <FaGoogle className="w-5 h-5" />
              Continue with Google
            </Button>
            <Button
              type="button"
              className="w-full bg-[#1877F2] hover:bg-[#0C63D4] text-white flex items-center justify-center gap-2"
              onClick={handleFacebookSignup}
            >
              <FaFacebook className="w-5 h-5" />
              Continue with Facebook
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-[#32DBC9] hover:bg-[#2BC4B4] text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-sm text-[#545F71]">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#00AA9B] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <RoleSelectionModal 
        isOpen={showRoleModal} 
        onClose={() => {
          setShowRoleModal(false);
          document.body.style.overflow = 'auto';
        }}
        userId={userId}
      />
    </div>
  );
}