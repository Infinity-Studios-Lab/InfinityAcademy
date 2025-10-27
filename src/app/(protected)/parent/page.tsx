import AverageRating from "@/components/AverageRating";
import redirectUser from "@/utils/roles/redirectUser";

export default async function ParentHome() {
  await redirectUser(["parent"]);

  return (
    <div className="h-full">
      <div className="text-sm">Welcome to the parent dashboard.</div>
      <div className="flex flex-row justify-between h-full w-full">
        <AverageRating totalStars={50} maxStars={100} />
      </div>
    </div>
  );
}
