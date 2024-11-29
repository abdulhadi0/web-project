'use client';

import { useState, useEffect } from 'react';
import RatingPopup from './RatingPopup';
import { Button } from '@/components/ui/button';
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RatePage() {
  const [ratings, setRatings] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchRatings(session.user.id);
    }
  }, [status]);

  const fetchRatings = async (userId) => {
    try {
      const res = await fetch(`/api/instructors?action=ratings&userId=${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch ratings');
      }
      const data = await res.json();
      setRatings(data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Instructor Ratings</h1>
      <Button onClick={() => setShowPopup(true)}>Add Rating</Button>

      {ratings.length === 0 ? (
        <p className="mt-4">No ratings available. Add a new rating.</p>
      ) : (
        <Table className="mt-6">
          <TableCaption>A list of your instructor ratings.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Instructor</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ratings.map((rating) => (
              <TableRow key={rating._id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    {rating.instructorId.Name}
                  </div>
                </TableCell>
                <TableCell>{rating.rating} / 5</TableCell>
                <TableCell>{rating.comment || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {showPopup && (
        <RatingPopup
          userId={session?.user?.id}
          closePopup={() => setShowPopup(false)}
          refreshRatings={() => fetchRatings(session.user.id)}
        />
      )}
    </div>
  );
}
