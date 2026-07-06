import { useState, type FormEvent } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export function LoginDialog({ children }: { children: React.ReactNode }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    login(username.trim());
    setUsername("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log in</DialogTitle>
            <DialogDescription>
              This is a mock login for testing - enter any username, no password
              needed.
            </DialogDescription>
          </DialogHeader>

          <Field className="mt-4">
            <FieldLabel htmlFor="login-username">Username</FieldLabel>
            <Input
              id="login-username"
              autoFocus
              placeholder="e.g. alice"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!username.trim()}>
              Log in
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
