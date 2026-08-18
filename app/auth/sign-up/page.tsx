import { SignUpForm } from "@/components/sign-up-form";
import { MobileShell } from "@/components/mobile-shell";

export default function Page() {
  return (
    <MobileShell className="items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </MobileShell>
  );
}
