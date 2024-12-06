'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, X } from 'lucide-react';
import { toast } from "@/lib/hooks/use-toast";

export default function RatingPopup({ 
  userId, 
  closePopup, 
  refreshRatings, 
  selectedRating = null 
}) {
  const [formData, setFormData] = useState({
    campus: '',
    school: '',
    department: '',
    instructor: '',
    rating: 0,
    comment: ''
  });

  const [dropdownData, setDropdownData] = useState({
    campuses: [],
    schools: [],
    departments: [],
    instructors: []
  });

  const [loading, setLoading] = useState({
    campuses: false,
    schools: false,
    departments: false,
    instructors: false,
    submit: false
  });

  // Fetch and populate initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(prev => ({ ...prev, campuses: true }));
      try {
        const res = await fetch('/api/instructors?action=campuses');
        if (!res.ok) throw new Error('Failed to fetch campuses');
        const data = await res.json();
        setDropdownData(prev => ({ ...prev, campuses: data }));

        if (selectedRating) {
          const { instructorId, rating: existingRating, comment: existingComment } = selectedRating;

          // Populate form with `selectedRating` details
          const { Campus, School, Department, _id } = instructorId;
          setFormData({
            campus: Campus,
            school: School,
            department: Department,
            instructor: _id,
            rating: existingRating,
            comment: existingComment || ''
          });

          // Fetch dropdowns sequentially for pre-filled data
          await fetchDropdownData('schools', { campus: Campus });
          await fetchDropdownData('departments', { campus: Campus, school: School });
          await fetchDropdownData('instructors', { campus: Campus, school: School, department: Department });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch campuses",
          variant: "destructive"
        });
      } finally {
        setLoading(prev => ({ ...prev, campuses: false }));
      }
    };

    fetchInitialData();
  }, [selectedRating]);

  // Fetch dependent dropdown data
  const fetchDropdownData = async (type, params) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const queryParams = new URLSearchParams(params).toString();
      const res = await fetch(`/api/instructors?action=${type}&${queryParams}`);
      
      if (!res.ok) throw new Error(`Failed to fetch ${type}`);
      
      const data = await res.json();
      setDropdownData(prev => ({ ...prev, [type]: data }));
      
      // Reset subsequent dropdowns
      if (type === 'campuses') {
        setFormData(prev => ({ ...prev, school: '', department: '', instructor: '' }));
        setDropdownData(prev => ({ ...prev, schools: [], departments: [], instructors: [] }));
      } else if (type === 'schools') {
        setFormData(prev => ({ ...prev, department: '', instructor: '' }));
        setDropdownData(prev => ({ ...prev, departments: [], instructors: [] }));
      } else if (type === 'departments') {
        setFormData(prev => ({ ...prev, instructor: '' }));
        setDropdownData(prev => ({ ...prev, instructors: [] }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch ${type}`,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Dropdown change handlers
  const handleDropdownChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    switch (field) {
      case 'campus':
        fetchDropdownData('schools', { campus: value });
        break;
      case 'school':
        fetchDropdownData('departments', { 
          campus: formData.campus, 
          school: value 
        });
        break;
      case 'department':
        fetchDropdownData('instructors', { 
          campus: formData.campus, 
          school: formData.school, 
          department: value,
          userId 
        });
        break;
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    const { instructor, rating } = formData;

    if (!instructor || rating === 0) {
      toast({
        title: "Validation Error",
        description: "Please select an instructor and provide a rating.",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));

    try {
      const endpoint = selectedRating 
        ? `/api/instructors/${selectedRating._id}` 
        : '/api/instructors/';
      const method = selectedRating ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          instructorId: instructor,
          rating: formData.rating,
          comment: formData.comment,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit rating.');

      toast({
        title: "Success",
        description: selectedRating 
          ? "Rating updated successfully" 
          : "Rating added successfully",
      });

      // Reset and close
      refreshRatings();
      closePopup();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2"
          onClick={closePopup}
        >
          <X className="h-5 w-5" />
        </Button>
        <CardHeader>
          <CardTitle>
            {selectedRating ? 'Edit Rating' : 'Add New Rating'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Dropdown fields */}
            {[
              { 
                label: 'Campus', 
                field: 'campus', 
                options: dropdownData.campuses 
              },
              { 
                label: 'School', 
                field: 'school', 
                options: dropdownData.schools 
              },
              { 
                label: 'Department', 
                field: 'department', 
                options: dropdownData.departments 
              },
              { 
                label: 'Instructor', 
                field: 'instructor', 
                options: dropdownData.instructors.map(i => ({
                  value: i._id,
                  label: i.Name
                }))
              }
            ].map(({ label, field, options }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <Select
                  value={formData[field] || ''} 
                  onValueChange={(value) => handleDropdownChange(field, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem 
                        key={typeof option === 'string' ? option : option.value} 
                        value={typeof option === 'string' ? option : option.value}
                      >
                        {typeof option === 'string' ? option : option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {/* Rating Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(value => (
                  <Star 
                    key={value} 
                    className={`h-6 w-6 cursor-pointer ${value <= formData.rating ? 'text-yellow-500' : 'text-gray-300'}`} 
                    onClick={() => setFormData(prev => ({ ...prev, rating: value }))} 
                  />
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <Textarea 
                placeholder="Enter comment (optional)" 
                value={formData.comment} 
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>

            {/* Submit Button */}
            <Button 
              disabled={loading.submit} 
              className="w-full" 
              onClick={handleSubmit}
            >
              {loading.submit ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
