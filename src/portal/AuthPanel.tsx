import React from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { safePortalError } from "./policy";

type AuthPanelProps = {
  staffMode?: boolean;
};

export function AuthPanel({ staffMode = false }: AuthPanelProps) {
  const [view, setView] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      if (view === "signup" && !staffMode) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await sendEmailVerification(credential.user);
        setStatus("Account created. Check your email to verify it before opening family records.");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      setStatus(safePortalError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setStatus("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setStatus(safePortalError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    if (!email.trim()) {
      setStatus("Enter your email address first, then select Reset password.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus("If that address has an account, Firebase will send password-reset instructions.");
    } catch (error) {
      setStatus(safePortalError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="portal-form auth-panel" onSubmit={handleEmailAuth}>
      <div>
        <span className="portal-kicker">{staffMode ? "Authorized staff" : "Parent or caregiver"}</span>
        <h3>{staffMode ? "Staff portal sign in" : view === "login" ? "Sign in to your portal" : "Create your parent account"}</h3>
        <p>
          {staffMode
            ? "Your account must have the VASS staff permission."
            : "Your records stay behind your verified Firebase account."}
        </p>
      </div>

      {!staffMode ? (
        <div className="segmented" aria-label="Portal account mode">
          <button className={view === "login" ? "active" : ""} type="button" onClick={() => setView("login")}>
            Log in
          </button>
          <button className={view === "signup" ? "active" : ""} type="button" onClick={() => setView("signup")}>
            Sign up
          </button>
        </div>
      ) : null}

      <label>
        Email address
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label>
        Password
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete={view === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
        />
      </label>
      <button className="button button--primary" type="submit" disabled={loading}>
        {loading ? "Please wait..." : view === "signup" && !staffMode ? "Create account" : "Log in securely"}
      </button>

      <div className="auth-divider"><span>or</span></div>
      <button className="button button--google" type="button" onClick={handleGoogleSignIn} disabled={loading}>
        Continue with Google
      </button>

      {view === "login" || staffMode ? (
        <button className="text-button" type="button" onClick={handlePasswordReset} disabled={loading}>
          Reset password
        </button>
      ) : null}

      {status ? <p className="portal-status" role="status" aria-live="polite">{status}</p> : null}
    </form>
  );
}
