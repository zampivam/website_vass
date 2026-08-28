import React from "react";
import type { User } from "firebase/auth";
import { getIdTokenResult, onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AdminDashboard } from "./AdminDashboard";
import { AuthPanel } from "./AuthPanel";
import { resolveAdminAccess } from "./admin";

export function AdminPortal() {
  const [user, setUser] = React.useState<User | null>(null);
  const [staff, setStaff] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    document.title = "Staff Portal | Virginia Autism Spectrum Services";
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex,nofollow,noarchive";

    return onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setStaff(false);
        setLoading(false);
        return;
      }
      try {
        const token = await getIdTokenResult(nextUser, true);
        setStaff(token.claims.staff === true);
      } catch {
        setStaff(false);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const decision = resolveAdminAccess({ loading, uid: user?.uid ?? null, staff });

  React.useEffect(() => {
    if (decision === "redirect-parent") window.location.replace("/#portal");
  }, [decision]);

  if (decision === "loading" || decision === "redirect-parent") {
    return <main className="admin-auth-shell"><p>{decision === "loading" ? "Checking staff access..." : "Returning to the parent portal..."}</p></main>;
  }

  if (decision === "login") {
    return <main className="admin-auth-shell"><AuthPanel staffMode /></main>;
  }

  return (
    <>
      <div className="admin-session-bar">
        <a href="/">Virginia Autism Spectrum Services</a>
        <span>{user?.email}</span>
        <button type="button" onClick={() => signOut(auth)}>Sign out</button>
      </div>
      <AdminDashboard user={user!} />
    </>
  );
}
