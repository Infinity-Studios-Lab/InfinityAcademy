export interface ReviewCardProp {
    teachername: string;
    subject: string;
    rating?: number;
    description: string;
    scroller?: boolean;
}


export default function ReviewCard(prop: ReviewCardProp) {
  const { teachername, subject, rating, description, scroller } = prop;
  console.log(scroller);

  return (
    <div className="card bg-primary text-primary-content w-[72rem] h-[15rem] shadow-xl">
      <div className="card-body p-4"> 
        
        <div className="flex flex-row items-center gap-4 mb-3">
          <h3 className="font-bold text-lg">{teachername}</h3>
          <div className="flex items-center gap-4">
            <h4 className="badge badge-outline">{subject}</h4>
            
            <div className="rating rating-sm rating-half pointer-events-none">
              <input type="radio" name={`rating-${teachername}`} className="rating-hidden" />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="0.5 star" defaultChecked={rating === 0.5} />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="1 star" defaultChecked={rating === 1} />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="1.5 star" defaultChecked={rating === 1.5} />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="2 star" defaultChecked={rating === 2} />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="2.5 star" defaultChecked={rating === 2.5} />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="3 star" defaultChecked={rating === 3} />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="3.5 star" defaultChecked={rating === 3.5} />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="4 star" defaultChecked={rating === 4} />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="4.5 star" defaultChecked={rating === 4.5} />
              <input type="radio" name={`rating-${teachername}`} className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="5 star" defaultChecked={rating === 5} />
            </div>
          </div>
        </div>

        <div className="h-32 border border-black-500 overflow-y-auto flex items-center justify-center"> 
          <p className="text-sm whitespace-normal break-words text-center">
            {description}
            
          </p>
          
        </div>
        {scroller && <span className="text-xs text-zinc-50"> (Scroll for more)</span>}
        
      </div>
    </div>
  );
}