'use client';
import { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({
    campuses: [],
    schools: [],
    departments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const response = await fetch('/api/filter-options');
        const data = await response.json();
        setOptions(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch filter options', error);
        setLoading(false);
      }
    }

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };
    
    // Reset subsequent filters when a parent filter changes
    switch (key) {
      case 'campus':
        // Reset school and department when campus changes
        delete newFilters.school;
        delete newFilters.department;
        break;
      case 'school':
        // Reset department when school changes
        delete newFilters.department;
        break;
    }

    // Set the new filter value
    newFilters[key] = value;

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <Label>Campus</Label>
        <Select 
          onValueChange={(value) => handleFilterChange('campus', value)}
          value={filters.campus || ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Campus" />
          </SelectTrigger>
          <SelectContent>
            {options.campuses.map((campus) => (
              <SelectItem key={campus} value={campus}>
                {campus}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>School</Label>
        <Select 
          onValueChange={(value) => handleFilterChange('school', value)}
          disabled={!filters.campus}
          value={filters.school || ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select School" />
          </SelectTrigger>
          <SelectContent>
            {options.schools
              .filter(school => !filters.campus || school.campus === filters.campus)
              .map((school) => (
                <SelectItem 
                  key={`${school.name}-${school.campus}`}
                  value={school.name}
                >
                  {school.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Department</Label>
        <Select
          onValueChange={(value) => handleFilterChange('department', value)}
          disabled={!filters.school || !filters.campus}
          value={filters.department || ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {options.departments
              .filter(dept => 
                (!filters.campus || dept.campus === filters.campus) &&
                (!filters.school || dept.school === filters.school)
              )
              .map((dept) => (
                <SelectItem 
                  key={`${dept.name}-${dept.campus}-${dept.school}`}
                  value={dept.name}
                >
                  {dept.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}