"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

// Next.js Link wrapper that maintains compatibility with react-router-dom syntax
export function Link({ to, ...props }: ComponentProps<typeof NextLink> & { to?: string }) {
  const href = to || (props.href as string);
  return <NextLink {...props} href={href} />;
}

// useNavigate hook replacement for Next.js
export function useNavigate() {
  const router = useRouter();

  return (path: string) => {
    router.push(path);
  };
}

// useLocation hook replacement for Next.js
export function useLocation() {
  // In Next.js App Router, we can use usePathname and useSearchParams
  // For now, return a simple object to maintain compatibility
  if (typeof window !== "undefined") {
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };
  }
  return {
    pathname: "/",
    search: "",
    hash: "",
  };
}
