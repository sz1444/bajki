"use client";

// Compatibility layer for react-router-dom -> Next.js navigation
import NextLink from "next/link";
import { useRouter as useNextRouter, usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

// Link component replacement
export function Link({ to, children, ...props }: { to: string; children: ReactNode; className?: string; [key: string]: any }) {
  return (
    <NextLink href={to} {...props}>
      {children}
    </NextLink>
  );
}

// useNavigate hook replacement
export function useNavigate() {
  const router = useNextRouter();
  return (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };
}

// useLocation hook replacement
export function useLocation() {
  // Używamy window.location zamiast Next.js hooków, aby uniknąć problemu z Suspense
  if (typeof window !== "undefined") {
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: null,
    };
  }

  return {
    pathname: "/",
    search: "",
    hash: "",
    state: null,
  };
}

// useSearchParams hook replacement - wrappuje Next.js version w kompatybilne API
export function useSearchParams() {
  // Używamy window.URLSearchParams zamiast Next.js hook aby uniknąć Suspense boundary
  if (typeof window === "undefined") {
    return [new URLSearchParams(), () => {}] as const;
  }

  const searchParams = new URLSearchParams(window.location.search);

  // Zwracamy tablicę [searchParams, setSearchParams] zgodnie z react-router-dom API
  // Uwaga: setSearchParams nie jest wspierane w Next.js App Router
  return [searchParams, () => {}] as const;
}

// Navigate component replacement
export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useNextRouter();

  if (replace) {
    router.replace(to);
  } else {
    router.push(to);
  }

  return null;
}

// BrowserRouter replacement (no-op in Next.js)
export function BrowserRouter({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Routes replacement (no-op in Next.js)
export function Routes({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Route replacement (no-op in Next.js)
export function Route({ element, path }: { element?: ReactNode; path?: string; [key: string]: any }) {
  return <>{element}</>;
}

// NavLink component replacement
import { forwardRef } from "react";

export const NavLink = forwardRef<HTMLAnchorElement, { to: string; children?: ReactNode; className?: string | ((props: { isActive: boolean; isPending?: boolean }) => string); [key: string]: any }>(
  ({ to, children, className, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === to;

    const finalClassName = typeof className === 'function'
      ? className({ isActive, isPending: false })
      : className;

    return (
      <NextLink href={to} className={finalClassName} ref={ref} {...props}>
        {children}
      </NextLink>
    );
  }
);

NavLink.displayName = "NavLink";

// NavLinkProps type
export interface NavLinkProps {
  to: string;
  children?: ReactNode;
  className?: string | ((props: { isActive: boolean; isPending?: boolean }) => string);
  [key: string]: any;
}
