"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Strona nie znaleziona</h1>
      <p className="text-gray-600 mb-8">Przepraszamy, nie możemy znaleźć strony, której szukasz.</p>
      <Link href="/">
        <Button>Wróć do strony głównej</Button>
      </Link>
    </div>
  );
}
