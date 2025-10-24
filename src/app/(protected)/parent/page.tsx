import AverageRating from "@/components/AverageRating";

export default function ParentHome() {
  return (
    <div className="h-full">
      <div className="text-sm">Welcome to the parent dashboard.</div>
      <div className="flex flex-row justify-between h-1/2 w-full">
        <AverageRating totalStars={50} maxStars={100} />
      </div>
    </div>
  );
}
