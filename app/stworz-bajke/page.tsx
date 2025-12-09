"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CreateStory from "@/components/pages/CreateStory";

export default function CreateStoryPage() {
  return (
    <ProtectedRoute requireSubscription>
      <CreateStory />
    </ProtectedRoute>
  );
}
