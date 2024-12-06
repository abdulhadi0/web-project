'use client';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function InstructorDetailsModal({ 
  instructor, 
  open, 
  onOpenChange 
}) {
  if (!instructor) return null;

  const ratingDistribution = [
    { rating: 1, count: instructor.ratingCounts?.[1] || 0 },
    { rating: 2, count: instructor.ratingCounts?.[2] || 0 },
    { rating: 3, count: instructor.ratingCounts?.[3] || 0 },
    { rating: 4, count: instructor.ratingCounts?.[4] || 0 },
    { rating: 5, count: instructor.ratingCounts?.[5] || 0 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{instructor.Name} - Detailed Ratings</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Rating Distribution Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistribution}>
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Comments */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Top Comments</h3>
            {instructor.topComments?.map((comment, index) => (
              <div 
                key={index} 
                className="border p-2 mb-2 rounded"
              >
                <p>{comment.text}</p>
                <div className="text-sm text-gray-500">
                  Rating: {comment.rating} ★
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}