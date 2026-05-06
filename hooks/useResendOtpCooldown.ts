import { AuthService } from "@/utils/auth";
import { toast } from "@/utils/toast";
import { useEffect, useMemo, useState } from "react";

type UseResendOtpCooldownOptions = {
  email: string;
  baseLabel?: string;
  cooldownMs?: number;
  disabled?: boolean;
};

export function useResendOtpCooldown({
  email,
  baseLabel = "Resend OTP",
  cooldownMs = 2 * 60 * 1000,
  disabled = false,
}: UseResendOtpCooldownOptions) {
  const [isResending, setIsResending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [now, setNow] = useState(() => Date.now());

  const secondsLeft = useMemo(() => {
    const msLeft = cooldownUntil - now;
    return msLeft > 0 ? Math.ceil(msLeft / 1000) : 0;
  }, [cooldownUntil, now]);

  const label = useMemo(() => {
    if (secondsLeft <= 0) return baseLabel;
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    return `Resend in ${mm}:${ss}`;
  }, [baseLabel, secondsLeft]);

  const isDisabled = disabled || isResending || secondsLeft > 0;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const resend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Error", "Email is missing. Please re-enter your email.");
      return false;
    }

    if (secondsLeft > 0) {
      toast.info("Please wait", `You can resend OTP in ${label.replace("Resend in ", "")}.`);
      return false;
    }

    setIsResending(true);
    const result = await AuthService.resendOtp(trimmedEmail);
    setIsResending(false);

    if (result.success) {
      setCooldownUntil(Date.now() + cooldownMs);
      toast.success("Success", result.message || "OTP resent successfully. Check your inbox.");
      return true;
    }

    toast.error("Error", result.message || "Unable to resend OTP.");
    return false;
  };

  return {
    resend,
    resendLabel: label,
    isResending,
    secondsLeft,
    isDisabled,
  };
}
