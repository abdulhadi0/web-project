'use client';
import { useState } from 'react';
import InstructorTable from './components/InstructorTable';
import InstructorFilters from './components/InstructorFilter';
import InstructorStats from './components/InstructorStats';

export default function InstructorsPage() {
  const [filters, setFilters] = useState({});

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Instructors Dashboard</h1>
      
      <InstructorFilters onFilterChange={setFilters} />
      
      <InstructorTable filters={filters} />
    </div>
  );
}