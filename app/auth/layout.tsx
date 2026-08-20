import { MobileHomeButton } from "@/components/mobile-home-button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MobileHomeButton />
    </>
  );
}
