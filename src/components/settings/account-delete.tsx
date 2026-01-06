"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteAccountSchema, type DeleteAccountInput } from "@/validators/auth.schema";
import { useAuth } from "@/context/auth-context";

interface DeleteAccountResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function deleteAccount(data: DeleteAccountInput): Promise<DeleteAccountResponse> {
  const response = await fetch("/api/auth/account", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: DeleteAccountResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to delete account");
  }

  return result;
}

export function AccountDelete() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const form = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      toast.success("Account deleted successfully");
      await logout();
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account");
      form.reset();
    },
  });

  const isLoading = form.formState.isSubmitting || mutation.isPending;

  async function onSubmit(data: DeleteAccountInput) {
    mutation.mutate(data);
  }

  return (
    <>
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive mb-1">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. This will permanently
              delete your account and all associated tasks.
            </p>
            <Button
              type="button"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and
              remove all your data from our servers. Please enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    form.reset();
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

