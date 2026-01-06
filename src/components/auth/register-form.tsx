"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

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
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

import { registerSchema, type RegisterInput } from "@/validators/auth.schema";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize React Hook Form (RHF)
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    setIsLoading(true);
    try {
      console.log("Registering User:", values);
      // API call will be implemented here later
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full border-border bg-card shadow-xl transition-all">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Create an account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your details to get started with TaskFlow
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* The RHF Provider */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid gap-2 mb-4">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
       
                      <Input placeholder="John Doe" className="pl-10" {...field} disabled={isLoading} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-2 mb-4">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
             
                      <Input placeholder="name@example.com" className="pl-10" {...field} disabled={isLoading} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid gap-2 mb-4">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
      
                      <Input type="password" placeholder="••••••••" className="pl-10" {...field} disabled={isLoading} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground text-center w-full">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}