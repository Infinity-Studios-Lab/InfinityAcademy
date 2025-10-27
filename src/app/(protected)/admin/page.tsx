import redirectUser from "@/utils/roles/redirectUser";

export default async function AdminHome() {
  await redirectUser(["admin"]);

  return <div className="text-sm">Welcome to the admin dashboard.</div>;
}
