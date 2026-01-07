import { redirect } from "next/navigation";
import redirectUser from "@/utils/roles/redirectUser";

export default async function TutorScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectUser(["tutor"]);
  return <>{children}</>;
}

