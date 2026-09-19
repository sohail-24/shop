// Legacy FreshFlow customer login/register UI, retained but no longer routed by Shop.
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Loader2, Lock, Mail, Phone, Sprout } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { isValidIndianMobileNumber, normalizeFrontendMobileNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clearGuestCart, getGuestCart } from "@/lib/guestCart";
import { isOwner } from "@/lib/roles";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedReturnTo = useMemo(() => searchParams.get("returnTo"), [searchParams]);
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation();
  const loginMobile = trpc.auth.loginMobile.useMutation();
  const loginEmail = trpc.auth.loginEmail.useMutation();
  const register = trpc.auth.register.useMutation();

  const [mobileForm, setMobileForm] = useState({ mobileNumber: "", password: "", remember: false });
  const [emailForm, setEmailForm] = useState({ email: "", password: "", remember: false });
  const [registrationMethod, setRegistrationMethod] = useState<"mobile" | "email">("mobile");
  const [registerForm, setRegisterForm] = useState({
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [error, setError] = useState<string | null>(null);

  const isPending = loginMobile.isPending || loginEmail.isPending || register.isPending || addToCart.isPending;

  async function syncGuestCart() {
    const guestItems = getGuestCart();
    for (const item of guestItems) {
      await addToCart.mutateAsync({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes,
      });
    }
    clearGuestCart();
  }

  async function finishLogin() {
    await syncGuestCart();
    await utils.auth.me.invalidate();
    const user = await utils.auth.me.fetch();
    if (!user) {
      throw new Error("Session was not established. Please try again.");
    }
    const defaultDestination = user.role === "admin" || isOwner(user) ? "/dashboard" : "/";
    navigate(requestedReturnTo || defaultDestination, { replace: true });
  }

  async function handleMobileLogin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!isValidIndianMobileNumber(mobileForm.mobileNumber)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    try {
      await loginMobile.mutateAsync({
        mobileNumber: normalizeFrontendMobileNumber(mobileForm.mobileNumber),
        password: mobileForm.password,
      });
      await finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    }
  }

  async function handleEmailLogin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await loginEmail.mutateAsync({
        email: emailForm.email,
        password: emailForm.password,
      });
      await finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (registrationMethod === "mobile" && !isValidIndianMobileNumber(registerForm.mobileNumber)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    if (!registerForm.agreeTerms) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    try {
      await register.mutateAsync({
        method: registrationMethod,
        mobileNumber: registrationMethod === "mobile" ? normalizeFrontendMobileNumber(registerForm.mobileNumber) : undefined,
        email: registrationMethod === "email" ? registerForm.email : undefined,
        password: registerForm.password,
      });
      await finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-xl shadow-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to FreshFlow</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Buy and manage wholesale products with ease.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mobile" className="space-y-5" onValueChange={() => setError(null)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mobile">Mobile Login</TabsTrigger>
              <TabsTrigger value="email">Email Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="mobile">
              <form onSubmit={handleMobileLogin} className="space-y-4">
                <FieldIcon icon={Phone}>
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    value={mobileForm.mobileNumber}
                    onChange={(event) => setMobileForm({ ...mobileForm, mobileNumber: event.target.value })}
                    placeholder="98765 43210"
                    required
                  />
                </FieldIcon>
                <FieldIcon icon={Lock}>
                  <Label htmlFor="mobilePassword">Password</Label>
                  <Input
                    id="mobilePassword"
                    type="password"
                    value={mobileForm.password}
                    onChange={(event) => setMobileForm({ ...mobileForm, password: event.target.value })}
                    required
                  />
                </FieldIcon>
                <RememberForgot
                  checked={mobileForm.remember}
                  onCheckedChange={(remember) => setMobileForm({ ...mobileForm, remember })}
                />
                <SubmitButton pending={isPending}>Login</SubmitButton>
              </form>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <FieldIcon icon={Mail}>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailForm.email}
                    onChange={(event) => setEmailForm({ ...emailForm, email: event.target.value })}
                    placeholder="buyer@freshflow.example"
                    required
                  />
                </FieldIcon>
                <FieldIcon icon={Lock}>
                  <Label htmlFor="emailPassword">Password</Label>
                  <Input
                    id="emailPassword"
                    type="password"
                    value={emailForm.password}
                    onChange={(event) => setEmailForm({ ...emailForm, password: event.target.value })}
                    required
                  />
                </FieldIcon>
                <RememberForgot
                  checked={emailForm.remember}
                  onCheckedChange={(remember) => setEmailForm({ ...emailForm, remember })}
                />
                <SubmitButton pending={isPending}>Login</SubmitButton>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-3">
                  <Label>Registration Method</Label>
                  <RadioGroup
                    value={registrationMethod}
                    onValueChange={(value) => setRegistrationMethod(value as "mobile" | "email")}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <Label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                      <RadioGroupItem value="mobile" />
                      Mobile Number
                    </Label>
                    <Label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                      <RadioGroupItem value="email" />
                      Email Address
                    </Label>
                  </RadioGroup>
                </div>

                {registrationMethod === "mobile" ? (
                  <FieldIcon icon={Phone}>
                    <Label htmlFor="registerMobile">Mobile Number</Label>
                    <Input
                      id="registerMobile"
                      value={registerForm.mobileNumber}
                      onChange={(event) => setRegisterForm({ ...registerForm, mobileNumber: event.target.value })}
                      required
                    />
                  </FieldIcon>
                ) : (
                  <FieldIcon icon={Mail}>
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      value={registerForm.email}
                      onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                      required
                    />
                  </FieldIcon>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldIcon icon={Lock}>
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      value={registerForm.password}
                      onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                      required
                    />
                  </FieldIcon>
                  <FieldIcon icon={Lock}>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })}
                      required
                    />
                  </FieldIcon>
                </div>

                <Label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={registerForm.agreeTerms}
                    onCheckedChange={(checked) => setRegisterForm({ ...registerForm, agreeTerms: checked === true })}
                  />
                  I agree to the Terms & Conditions
                </Label>
                <SubmitButton pending={isPending}>Create Account</SubmitButton>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account? <Link to="/login" className="font-medium text-primary">Sign In</Link>
                </p>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <>
              <Separator className="my-4" />
              <p className="text-center text-sm text-destructive">{error}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FieldIcon({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Icon className="hidden" aria-hidden="true" />
      {children}
    </div>
  );
}

function RememberForgot({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="flex items-center gap-2 text-sm">
        <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
        Remember Me
      </Label>
      <Button type="button" variant="link" className="h-auto p-0 text-sm">
        Forgot Password
      </Button>
    </div>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" className="h-11 w-full bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
