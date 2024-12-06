import mongoose from 'mongoose'; 
import { NextResponse } from 'next/server';
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

  const Instructor = mongoose.models.Instructor || mongoose.model('Instructor', InstructorSchema);

export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);

  // Filters
  const filters = {};
  if (searchParams.get('department')) filters.Department = searchParams.get('department');
  if (searchParams.get('campus')) filters.Campus = searchParams.get('campus');
  if (searchParams.get('hecApproved')) filters['HEC Approved Supervisor'] = searchParams.get('hecApproved') === 'true';

  try {
    // Fetch instructors with aggregated ratings
    const instructors = await Instructor.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'ratings', // Ensure collection name is correct
          localField: '_id',
          foreignField: 'instructorId',
          as: 'ratings',
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $gt: [{ $size: '$ratings' }, 0] },
              { $avg: '$ratings.rating' },
              null
            ]
          },
          ratingCounts: {
            $reduce: {
              input: [1, 2, 3, 4, 5],
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [[
                      { k: { $toString: '$$this' }, 
                        v: { 
                          $size: { 
                            $filter: { 
                              input: '$ratings', 
                              as: 'rating', 
                              cond: { $eq: ['$$rating.rating', '$$this'] } 
                            } 
                          } 
                        }
                      }
                    ]]
                  },
                ],
              },
            },
          },
          totalRatings: { $size: '$ratings' },
        },
      },
      {
        $project: {
          ratings: 0, // Exclude raw ratings from the final output
        },
      },
    ]);

    return NextResponse.json(instructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch instructors',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

