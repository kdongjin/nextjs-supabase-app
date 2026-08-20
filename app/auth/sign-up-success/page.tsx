import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileShell } from "@/components/mobile-shell";

export default function Page() {
  return (
    <MobileShell className="items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">가입해 주셔서 감사합니다!</CardTitle>
              <CardDescription>이메일을 확인해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                회원가입이 완료되었습니다. 로그인 전에 이메일을 확인해 계정을 인증해주세요.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileShell>
  );
}
