import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { MobileShell } from "@/components/mobile-shell";

export default function Page() {
  return (
    <MobileShell className="items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </MobileShell>
  );
}
