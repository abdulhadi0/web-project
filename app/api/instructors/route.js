import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb-connect';


const InstructorSchema = new mongoose.Schema({
  ID: Number,
  Name: String,
  Designation: String,
  "HEC Approved Supervisor": Boolean,
  "Highest Education": String,
  Email: String,
  School: String,
  Department: String,
  Extension: Number,
  "Image URL": String,
  Campus: String,
});

const RatingSchema = new mongoose.Schema({
  userId: String,
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
  rating: Number,
  comment: String,
});

const Instructor = mongoose.models.Instructor || mongoose.model('Instructor', InstructorSchema);
const Rating = mongoose.models.Rating || mongoose.model('Rating', RatingSchema);

export async function GET(req) {
  await connectDB();

  console.log("DB COnnected")

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const action = searchParams.get('action');

  if (action === 'list') {
    const ratedInstructors = await Rating.find({ userId }).select('instructorId');
    const ratedIds = ratedInstructors.map((r) => r.instructorId);
    const instructors = await Instructor.find({ _id: { $nin: ratedIds } });
    return new Response(JSON.stringify(instructors), { status: 200 });
  }

  if (action === 'ratings') {
    const ratings = await Rating.find({ userId }).populate('instructorId', 'Name Image URL');
    return new Response(JSON.stringify(ratings), { status: 200 });
  }

  return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
}

export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { userId, instructorId, rating, comment } = body;

  if (!userId || !instructorId || !rating) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const newRating = new Rating({ userId, instructorId, rating, comment });
  await newRating.save();
  return new Response(JSON.stringify({ message: 'Rating submitted successfully' }), { status: 201 });
}
