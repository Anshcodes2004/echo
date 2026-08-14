import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import type { ReactNode } from "react";

export function AuthGuardLink(props: {
  to: string;
  params?: any;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { to, params, className, children, ariaLabel } = props;
  if (user)
    return (
      <Link to={to} params={params} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className={className} aria-label={ariaLabel}>
          {children}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Please sign up to continue</AlertDialogTitle>
          <AlertDialogDescription>
            You must create an account or sign in before using this feature.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4 flex justify-end gap-2">
          <AlertDialogCancel onClick={() => {}} className="">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => navigate({ to: "/signup" })}>Sign up</AlertDialogAction>
          <AlertDialogAction onClick={() => navigate({ to: "/signin" })}>Sign in</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AuthGuardLink;
