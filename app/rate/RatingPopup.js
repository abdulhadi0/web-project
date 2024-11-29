'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function RatingPopup({ userId, closePopup, refreshRatings }) {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch(`/api/instructors?action=list&userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch instructors.');
        const data = await res.json();
        const sortedData = data.sort((a, b) => a.Name.localeCompare(b.Name));
        setInstructors(sortedData);

      } catch (error) {
        alert(error.message);
      }
    };

    fetchInstructors();
  }, [userId]);

  const handleSubmit = async () => {
    if (!selectedInstructor || rating === 0) {
      alert('Please select an instructor and provide a rating.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          instructorId: selectedInstructor,
          rating,
          comment,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit rating.');

      
      setRating(0);
      setComment('');
      setSelectedInstructor('');
      refreshRatings();
      closePopup();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold">Rate an Instructor</h2>
        <Select onValueChange={(value) => setSelectedInstructor(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an Instructor" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Instructors</SelectLabel>
              {instructors.map((instructor) => (
                <SelectItem key={instructor._id} value={instructor._id}>
                  {instructor.Name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex gap-1 my-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer text-2xl ${
                star <= rating ? 'text-yellow-500' : 'text-gray-400'
              }`}
              onClick={() => setRating(star)}
              role="button"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={closePopup} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
