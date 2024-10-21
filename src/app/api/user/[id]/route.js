import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { id } = params;
       
  await dbConnect();

  try {
    const user = await User.findById(id).select('-__v');
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching user' }), { status: 500 });
  }
}

// PUT request handler for updating user by ID
export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json(); 

  await dbConnect();

  try {
    const user = await User.findByIdAndUpdate(id, body, { new: true });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating user' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  await dbConnect();

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'User deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting user' }), { status: 500 });
  }
}
