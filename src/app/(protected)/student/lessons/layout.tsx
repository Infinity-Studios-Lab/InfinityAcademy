import redirectUser from "@/utils/roles/redirectUser";

export default async function StudentLessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectUser(["student"]);
  return <>{children}</>;
}

