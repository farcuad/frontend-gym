import { Navigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";

interface PlanRouteProps {
  minPlan: "trial" | "Basic" | "Medium" | "Premium";
  children: React.ReactNode;
}

export const PlanRoute = ({ minPlan, children }: PlanRouteProps) => {
  const { subscription, loading } = useSubscription();

  const planWeights = {
    trial: 1,
    Basic: 1,
    Medium: 2,
    Premium: 3,
  };

  if (loading) return null; // o un spinner

  if (!subscription) {
    return <Navigate to="/home/plans-gym" replace />;
  }

  const userPlan = subscription.plan_type as keyof typeof planWeights;

  if (planWeights[userPlan] < planWeights[minPlan]) {
    return <Navigate to="/home/plans-gym" replace />;
  }

  return <>{children}</>;
};
