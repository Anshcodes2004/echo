import { FormEvent, useState } from "react";
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/signup")({ component: SignUp });

function SignUp() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signUp(name, email, password);
      navigate({ to: "/" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <form onSubmit={submit} className="w-full max-w-md card-soft p-6">
        <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start recording and save your insights.
        </p>
        <label className="mt-4 block text-sm text-muted-foreground">Full name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
        <label className="mt-4 block text-sm text-muted-foreground">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
        <label className="mt-3 block text-sm text-muted-foreground">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            disabled={busy}
          >
            {busy ? "Creating…" : "Create account"}
          </button>
          <Link to="/signin" className="text-sm text-muted-foreground hover:underline">
            Already have an account?
          </Link>
        </div>
      </form>
    </div>
  );
}
