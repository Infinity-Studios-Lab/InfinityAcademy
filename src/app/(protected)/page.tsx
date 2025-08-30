import { redirect } from "next/navigation";

export default function ProtectedHome() {
  // Redirect to student dashboard
  redirect("/student");
}
