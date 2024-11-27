import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../lib/mongodb-connect';
import User from '../../../../lib/user-model';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { username, email, password, university } = body;

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return NextResponse.json({
        error: 'User with this email or username already exists'
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      university,
      role: 'student'
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}