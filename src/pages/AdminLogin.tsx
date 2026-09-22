import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { setStoredAdminToken, trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("admin@freshflow.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const login = trpc.auth.loginAdmin.useMutation();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const returnTo = searchParams.get("returnTo");
      navigate(returnTo?.startsWith("/") ? returnTo : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate, searchParams]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const result = await login.mutateAsync({ email, password });
      if (result?.token) {
        setStoredAdminToken(result.token);
      }
      utils.auth.me.setData(undefined, result.user);
      await utils.auth.me.refetch();
      const returnTo = searchParams.get("returnTo");
      navigate(returnTo?.startsWith("/") ? returnTo : "/dashboard", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md space-y-3">
        <Link
          id="back-to-home-link"
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <Card className="w-full shadow-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Shop Administration</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to manage Shop.</p>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground border border-border/50">
                <span className="font-semibold text-foreground">Demo Admin:</span> admin@freshflow.com / admin123
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="admin-email" className="pl-9" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" /></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="admin-password" className="pl-9" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></div>
              </div>
              {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
              <Button className="w-full" type="submit" disabled={login.isPending}>{login.isPending ? "Signing in…" : "Sign in"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
