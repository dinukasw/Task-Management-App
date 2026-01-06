"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { updateProfileSchema, type UpdateProfileInput } from "@/validators/auth.schema";
import { useAuth } from "@/context/auth-context";

interface ProfileFormProps {
  initialName?: string | null;
  initialEmail?: string;
}

interface ProfileResponse {
  success: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  error?: string;
}

async function updateProfile(data: UpdateProfileInput): Promise<ProfileResponse> {
  const response = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ProfileResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to update profile");
  }

  return result;
}

export function ProfileForm({ initialName, initialEmail }: ProfileFormProps) {
  const { refreshUser } = useAuth();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialName || "",
      email: initialEmail || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: initialName || "",
      email: initialEmail || "",
    });
  }, [initialName, initialEmail, form]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      refreshUser();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const isLoading = form.formState.isSubmitting || mutation.isPending;

  async function onSubmit(data: UpdateProfileInput) {
    // Only send fields that have changed
    const updates: UpdateProfileInput = {};
    const currentName = initialName || "";
    if (data.name !== currentName && data.name && data.name.trim().length >= 2) {
      updates.name = data.name.trim();
    }
    if (data.email !== initialEmail) {
      updates.email = data.email;
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      return;
    }

    mutation.mutate(updates);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your name"
                  {...field}
                  value={field.value || ""}
                  disabled={isLoading}
                />
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
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Form>
  );
}

