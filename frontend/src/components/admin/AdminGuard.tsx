"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const error = useAuthStore((state) => state.error);

  const [ready, setReady] = useState(false);
  const hasRequestedUser = useRef(false);

  const isWelcomePage = pathname.startsWith("/admin/welcome");

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      hasRequestedUser.current = false;
      router.replace("/admin/login");
      return;
    }

    if (!hasRequestedUser.current) {
      hasRequestedUser.current = true;
      void fetchUser().catch(() => {
        hasRequestedUser.current = false;
        router.replace("/admin/login");
      });
      return;
    }

    if (!user) {
      return;
    }

    if (!user.bound_username) {
      if (!isWelcomePage) {
        router.replace("/admin/welcome");
        return;
      }
      setReady(true);
      return;
    }

    setReady(true);
  }, [hydrated, token, user, fetchUser, router, isWelcomePage]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) return;
    if (ready) return;

    if (hasRequestedUser.current && !user && error) {
      router.replace("/admin/login");
    }
  }, [hydrated, token, ready, user, error, router]);

  if (!hydrated || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
