import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account | TaskFlow",
  description: "Join TaskFlow to start managing your tasks efficiently.",
};

export default function RegisterPage() {
  return (
    <div className="w-full">
      <RegisterForm />
    </div>
  );
}