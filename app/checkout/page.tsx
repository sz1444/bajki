import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Checkout from "@/components/pages/Checkout";

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <Checkout/>
    </ProtectedRoute>
  );
}
