import { Suspense } from "react";

import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 py-10 text-white">
          <div className="text-sm text-zinc-400">
            Loading password reset...
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
