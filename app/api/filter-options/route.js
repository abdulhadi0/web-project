import mongoose from 'mongoose';
import { NextResponse } from 'next/server';


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
  

export async function GET() {
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  try {
    const campuses = await Instructor.distinct('Campus');
    const schools = await Instructor.aggregate([
      { $group: { _id: { school: '$School', campus: '$Campus' } } },
      { $project: { 
        name: '$_id.school', 
        campus: '$_id.campus', 
        _id: 0 
      } }
    ]);
    const departments = await Instructor.aggregate([
        { $group: { _id: { department: '$Department', school: '$School', campus: '$Campus' } } },
        { $project: { 
            name: '$_id.department', 
            school: '$_id.school', 
            campus: '$_id.campus', 
            _id: 0 
        } }
      ]);
      

    console.log(schools)
    console.log(departments)


    return NextResponse.json({
        campuses,
        schools: schools.map(s => ({ name: s.name, campus: s.campus })),
        departments: departments.map(d => ({ name: d.name, school: d.school, campus: d.campus }))
      });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}