import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "university") navigate("/dashboard/university");
    else if (user.role === "employer") navigate("/dashboard/employer");
    else navigate("/dashboard/student");
  }, [navigate]);
  return null;
}
