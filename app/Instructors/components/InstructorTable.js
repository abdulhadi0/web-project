'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function InstructorTable({ filters }) {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('Name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    async function fetchInstructors() {
      setLoading(true);
      try {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/dashboard?${queryString}`);
        const data = await response.json();
        console.log(data)
        setInstructors(data);
      } catch (error) {
        console.error('Failed to fetch instructors', error);
      }
      setLoading(false);
    }

    fetchInstructors();
  }, [filters]);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedInstructors = [...instructors].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredInstructors = sortedInstructors.filter((instructor) =>
    instructor.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);
  const paginatedInstructors = filteredInstructors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ column }) => {
    if (column !== sortColumn) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
      <div className="flex items-center justify-between space-x-2">
        <CardTitle>Instructor List</CardTitle>

          <Input
            type="text"
            placeholder="Search instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {['Name', 'Department', 'Campus', 'Rating', 'HEC Approved'].map((column) => (
                <TableCell key={column} onClick={() => handleSort(column)} className="cursor-pointer">
                  <div className="flex items-center">
                    {column}
                    <SortIcon column={column} />
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
  {paginatedInstructors.map((instructor) => (
    <TableRow 
      key={`${instructor.ID}-${instructor.Name}`}
    >
      <TableCell>{instructor.Name}</TableCell>
      <TableCell>{instructor.Department}</TableCell>
      <TableCell>{instructor.Campus}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-500 mr-1" />
          {instructor.averageRating !== null  
            ? instructor.averageRating.toFixed(1)
            : 'N/A'}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={
            instructor['HEC Approved Supervisor']
              ? 'default'
              : 'destructive'
          }
        >
          {instructor['HEC Approved Supervisor']
            ? 'Approved'
            : 'Not Approved'}
        </Badge>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredInstructors.length)} of{' '}
            {filteredInstructors.length} entries
          </div>
          <div className="space-x-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

