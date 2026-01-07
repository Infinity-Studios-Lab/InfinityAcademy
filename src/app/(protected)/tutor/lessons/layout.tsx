import redirectUser from "@/utils/roles/redirectUser";

export default async function TutorLessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectUser(["tutor"]);
  return <>{children}</>;
}

