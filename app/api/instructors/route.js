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
}, { timestamps: true });

const Instructor = mongoose.models.Instructor || mongoose.model('Instructor', InstructorSchema);
const Rating = mongoose.models.Rating || mongoose.model('Rating', RatingSchema);

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');

  switch (action) {
    case 'campuses':
      return await handleCampusesRequest();
    
    case 'schools':
      return await handleSchoolsRequest(searchParams);
    
    case 'departments':
      return await handleDepartmentsRequest(searchParams);
    
    case 'instructors':
      return await handleInstructorsListRequest(searchParams, userId);
    
    case 'ratings':
      return await handleRatingsRequest(userId);

    case 'deleteRating':
      return await handleDeleteRatingRequest(searchParams);
    
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  }
}

export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { userId, instructorId, rating, comment } = body;

  if (!userId || !instructorId || !rating) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    // Check if user has already rated this instructor
    const existingRating = await Rating.findOne({ userId, instructorId });
    
    if (existingRating) {
      return new Response(JSON.stringify({ error: 'You have already rated this instructor' }), { status: 400 });
    }

    const newRating = new Rating({ userId, instructorId, rating, comment });
    await newRating.save();
    
    return new Response(JSON.stringify({ 
      message: 'Rating submitted successfully',
      rating: newRating 
    }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(req) {
  await connectDB();

  const body = await req.json();
  const { userId, instructorId, rating, comment } = body;

  if (!userId || !instructorId || !rating) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    const updatedRating = await Rating.findOneAndUpdate(
      { userId, instructorId },
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!updatedRating) {
      return new Response(JSON.stringify({ error: 'Rating not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ 
      message: 'Rating updated successfully',
      rating: updatedRating 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  await connectDB();

  // Parse the URL to get the rating ID
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.search);
  const ratingId = searchParams.get('ratingId');
  const userId = searchParams.get('userId');

  if (!ratingId || !userId) {
    return new Response(JSON.stringify({ error: 'Missing rating ID or user ID' }), { status: 400 });
  }

  try {
    const deletedRating = await Rating.findOneAndDelete({ 
      _id: ratingId, 
      userId: userId 
    });

    if (!deletedRating) {
      return new Response(JSON.stringify({ error: 'Rating not found or unauthorized' }), { status: 404 });
    }

    return new Response(JSON.stringify({ 
      message: 'Rating deleted successfully',
      rating: deletedRating 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}


// Get unique campuses
async function handleCampusesRequest() {
  try {
    const campuses = await Instructor.distinct('Campus');
    return new Response(JSON.stringify(campuses), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Get schools for a specific campus
async function handleSchoolsRequest(searchParams) {
  const campus = searchParams.get('campus');
  
  try {
    const schools = await Instructor.distinct('School', { Campus: campus });
    return new Response(JSON.stringify(schools), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

async function handleDeleteRatingRequest(searchParams) {

  console.log(searchParams)

  const ratingId = searchParams.get('ratingId');


  if (!ratingId) {

    return new Response(JSON.stringify({ error: 'Missing rating ID or user ID' }), { status: 400 });

  }


  try {

    const deletedRating = await Rating.findOneAndDelete({ 

      _id: ratingId

    });


    if (!deletedRating) {

      return new Response(JSON.stringify({ error: 'Rating not found or unauthorized' }), { status: 404 });

    }


    return new Response(JSON.stringify({ 

      message: 'Rating deleted successfully',

      rating: deletedRating 

    }), { status: 200 });

  } catch (error) {

    return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  }

}

// Get departments for a specific campus and school
async function handleDepartmentsRequest(searchParams) {
  const campus = searchParams.get('campus');
  const school = searchParams.get('school');
  
  try {
    const departments = await Instructor.distinct('Department', { 
      Campus: campus, 
      School: school 
    });
    return new Response(JSON.stringify(departments), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Get instructors list with filtering and excluding already rated
async function handleInstructorsListRequest(searchParams, userId) {
  const campus = searchParams.get('campus');
  const school = searchParams.get('school');
  const department = searchParams.get('department');
  
  try {
    // Find already rated instructors by this user
    const ratedInstructors = await Rating.find({ userId }).select('instructorId');
    const ratedIds = ratedInstructors.map((r) => r.instructorId);

    // Find instructors matching criteria and not yet rated
    const instructors = await Instructor.find({
      Campus: campus,
      School: school,
      Department: department,
      _id: { $nin: ratedIds }
    });

    return new Response(JSON.stringify(instructors), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Get user's existing ratings
async function handleRatingsRequest(userId) {
  try {
    const ratings = await Rating.find({ userId }).populate('instructorId', 'Name "Image URL"');
    return new Response(JSON.stringify(ratings), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
