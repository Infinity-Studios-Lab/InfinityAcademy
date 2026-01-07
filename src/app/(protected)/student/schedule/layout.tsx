import redirectUser from "@/utils/roles/redirectUser";

export default async function StudentScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectUser(["student"]);
  return <>{children}</>;
}

