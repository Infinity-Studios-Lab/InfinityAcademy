
import Reviews from '@/components/Reviews';
import AverageRating from "@/components/AverageRating";
import redirectUser from "@/utils/roles/redirectUser";
import { createClient } from "@/utils/supabase/server";

export default async function ParentHome() {
  await redirectUser(["parent"]);

  const supabase = await createClient();
  
  // Fetch reviews from database (if reviews table exists)
  let formattedReviews: Array<{
    teachername: string;
    subject: string;
    rating: number;
    description: string;
  }> = [];

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error && reviews) {
    // Format reviews to match the expected structure
    formattedReviews = reviews.map((review: any) => ({
      teachername: review.teacher_name || review.tutor_name || "Unknown Teacher",
      subject: review.subject || "Unknown Subject",
      rating: review.rating || 0,
      description: review.description || review.comment || "",
    }));
  }

  return (
    <div>
    <div className="text-sm">Welcome to the parent dashboard.</div>
      <div className="flex flex-row justify-between h-full w-full">
        <AverageRating totalStars={50} maxStars={100} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Teacher Reviews</h1>
          {formattedReviews.length === 0 ? (
            <p className="text-base-content/70">No reviews available yet.</p>
          ) : (
            <Reviews reviews={formattedReviews} />
          )}
        </div>
      </div>
    </div>
  );
}
