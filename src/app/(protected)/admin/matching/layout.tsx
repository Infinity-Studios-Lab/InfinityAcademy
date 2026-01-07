import redirectUser from "@/utils/roles/redirectUser";

export default async function AdminMatchingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectUser(["admin"]);
  return <>{children}</>;
}

