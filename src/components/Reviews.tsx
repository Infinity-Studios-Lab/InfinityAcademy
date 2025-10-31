import ReviewCard from './ReviewCard'; 

interface ReviewProps {
  reviews: Array<{
    teachername: string;
    subject: string;
    rating: number;
    description: string;
  }>;
}

export default function Reviews({ reviews }: ReviewProps) {
  return (
    <div>
    <div className="carousel carousel-vertical rounded-box h-[280px] w-[72rem]"> 
      {reviews.map((review, index) => (
        <div key={index} className="carousel-item h-full w-full">
          <ReviewCard 
            teachername={review.teachername}
            subject={review.subject}
            rating={review.rating}
            description={review.description}
            scroller={reviews.length - 1 > index}
          />

        </div>

      ))}
    </div>
    </div>

  );
}