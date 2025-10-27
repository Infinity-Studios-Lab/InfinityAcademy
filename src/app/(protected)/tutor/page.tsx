import redirectUser from "@/utils/roles/redirectUser";

export default async function TutorHome() {
  await redirectUser(["tutor"]);

  return <div className="text-sm">Welcome to the tutor dashboard.</div>;
}
