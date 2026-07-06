import { Link } from "react-router";
import { LogIn, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { userId, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-border/60 px-6 py-3">
      <div>
        {userId ? (
          <Button variant="outline" size="sm" onClick={logout}>
            <User className="size-4" />
            {userId}
            <LogOut className="size-4" />
          </Button>
        ) : (
          <LoginDialog>
            <Button variant="outline" size="sm">
              <LogIn className="size-4" />
              Log in
            </Button>
          </LoginDialog>
        )}
      </div>

      <Link to="/" className="font-heading text-base font-medium">
        Poly Market Clone
      </Link>

      <div className="w-[88px]" aria-hidden />
    </header>
  );
}
