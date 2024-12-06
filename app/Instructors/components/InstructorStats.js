'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstructorStats({ filters }) {
  const [stats, setStats] = useState({ totalInstructors: 0, averageRating: 0 });

  useEffect(() => {
    async function fetchStats() {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/dashboard?${queryString}`);
      const data = await response.json();

      const totalInstructors = data.length;
      const averageRating = data.reduce((acc, instructor) => acc + (instructor.averageRating || 0), 0) / totalInstructors || 0;

      setStats({ totalInstructors, averageRating });
    }

    fetchStats();
  }, [filters]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Total Instructors: {stats.totalInstructors}</div>
        <div>Average Rating: {stats.averageRating.toFixed(1)}</div>
      </CardContent>
    </Card>
  );
}