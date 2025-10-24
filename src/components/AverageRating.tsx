interface AverageRatingProps {
    totalStars: number;
    maxStars: number;
}

export default function AverageRating({ totalStars, maxStars }: AverageRatingProps) {
    const averageRating = (totalStars / maxStars) * 100;
    return (
        <div className="card bg-primary text-primary-content w-96 h-full">
            <div className="card-body flex flex-col items-center justify-start gap-10">
                <h2 className="card-title">Average Student Rating</h2>
                <div className="radial-progress" 
                    style={{ "--value": `${averageRating}`, "--size": "10rem", "--thickness": "1rem"} as React.CSSProperties} 
                    aria-valuenow={averageRating} role="progressbar"> <span className="text-2xl font-bold">{averageRating}%</span>
                </div>
                <div className="flex flex-col items-center justify-start gap-2">
                    <h3 className="text-lg font-bold">Total Stars:</h3>
                    <h2 className="text-2xl font-bold">{totalStars}/{maxStars}</h2>
                </div>
            </div>
        </div>
    );
};