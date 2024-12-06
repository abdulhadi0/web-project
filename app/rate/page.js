'use client';


import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';

import { useSession } from "next-auth/react";

import { Star, MessageCircleQuestion, Edit, Trash2 } from 'lucide-react';

import { toast } from "@/lib/hooks/use-toast";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { Card, CardContent } from '@/components/ui/card';


// You'll need to create this component

import RatingPopup from './RatingPopup';


export default function RatePage() {

  const [ratings, setRatings] = useState([]);

  const [showPopup, setShowPopup] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [selectedRating, setSelectedRating] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');


  const { data: session, status } = useSession();


  useEffect(() => {

    if (status === "authenticated") {

      fetchRatings(session.user.id);

    }

  }, [status]);


  const fetchRatings = async (userId) => {

    setIsLoading(true);

    try {

      const res = await fetch(`/api/instructors?action=ratings&userId=${userId}`);

      if (!res.ok) {

        throw new Error('Failed to fetch ratings');

      }

      const data = await res.json();

      setRatings(data);

    } catch (error) {

      toast({

        title: "Error",

        description: "Failed to fetch ratings",

        variant: "destructive"

      });

    } finally {

      setIsLoading(false);

    }

  };


  const handleEditRating = (rating) => {

    setSelectedRating(rating);

    setShowPopup(true);

  };


  const handleDeleteRating = async () => {

    if (!selectedRating) return;


    try {

      const res = await fetch(`/api/instructors?action=deleteRating&ratingId=${selectedRating._id}`, {

        method: 'GET'

      });


      if (!res.ok) {

        throw new Error('Failed to delete rating');

      }


      // Remove the deleted rating from the list

      setRatings(ratings.filter(r => r._id !== selectedRating._id));

      

      toast({

        title: "Success",

        description: "Rating deleted successfully",

        variant: "default"

      });


      setIsDeleteDialogOpen(false);

    } catch (error) {

      toast({

        title: "Error",

        description: "Failed to delete rating",

        variant: "destructive"

      });

    }

  };


  const filteredRatings = ratings.filter(rating => 

    rating.instructorId.Name.toLowerCase().includes(searchTerm.toLowerCase())

  );


  if (isLoading) {

    return (

      <div className="flex justify-center items-center h-screen">

        <p>Loading ratings...</p>

      </div>

    );

  }


  return (

    <div className="p-6 max-w-6xl mx-auto">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-gray-800 flex items-center">

          My Instructor Ratings

        </h1>

        <div className="flex items-center space-x-2">

          <Input 

            type="text" 

            placeholder="Search instructors..." 

            value={searchTerm} 

            onChange={(e) => setSearchTerm(e.target.value)} 

            className="w-64"

          />

          <Button 

            onClick={() => {

              setSelectedRating(null);

              setShowPopup(true);

            }}

          >

            Add New Rating

          </Button>

        </div>

      </div>


      {filteredRatings.length === 0 ? (

        <Card className="text-center p-8">

          <MessageCircleQuestion className="mx-auto mb-4 text-gray-400" size={48} />

          <p className="text-gray-600 text-lg">

            You haven't rated any instructors yet. Start by adding your first rating!

          </p>

        </Card>

      ) : (

        <div className="space-y-4">

          {filteredRatings.map((rating) => (

            <Card key={rating._id} className="hover:shadow-md transition-shadow">

              <CardContent className="p-4 px-8 flex items-center justify-between">

                <div className="flex items-center space-x-4">

                  <div>

                    <h3 className="text-lg font-semibold">

                      {rating.instructorId.Name}

                    </h3>

                    <div className="flex items-center">

                      {[...Array(5)].map((_, i) => (

                        <Star 

                          key={i} 

                          className={`h-5 w-5 ${i < rating.rating ? 'text-yellow-500' : 'text-gray-300'}`} 

                        />

                      ))}

                      <Badge variant="secondary" className="ml-2">

                        {rating.rating}/5

                      </Badge>

                    </div>

                    {rating.comment && (

                      <p className="text-gray-600 mt-2 italic">

                        "{rating.comment}"

                      </p>

                    )}

                  </div>

                </div>

                <div className="flex space-x-2">

                  <Button 

                    variant="outline" 
                    className="hidden"

                    size="icon"

                    onClick={() => handleEditRating(rating)}

                  >

                    <Edit className="h-4 w-4" />

                  </Button>

                  <Button 

                    variant="destructive" 

                    size="icon"

                    onClick={() => {

                      setSelectedRating(rating);

                      setIsDeleteDialogOpen(true);

                    }}

                  >

                    <Trash2 className="h-4 w-4" />

                  </Button>

                </div>

              </CardContent>

            </Card>

          ))}

        </div>

      )}


      {/* Delete Confirmation Dialog */}

      <Dialog 

        open={isDeleteDialogOpen} 

        onOpenChange={setIsDeleteDialogOpen}

      >

        <DialogContent>

          <DialogHeader>

            <DialogTitle>Delete Rating</DialogTitle>

            <DialogDescription>

              Are you sure you want to delete your rating for {selectedRating?.instructorId?.Name}?

              This action cannot be undone.

            </DialogDescription>

          </DialogHeader>

          <div className="flex justify-end space-x-2">

            <Button 

              variant="outline" 

              onClick={() => setIsDeleteDialogOpen(false)}

            >

              Cancel

            </Button>

            <Button 

              variant="destructive" 

              onClick={handleDeleteRating}

            >

              Delete

            </Button>

          </div>

        </DialogContent>

      </Dialog>


      {showPopup && (

        <RatingPopup

          userId={session?.user?.id}

          closePopup={() => setShowPopup(false)}

          refreshRatings={() => fetchRatings(session.user.id)}

          selectedRating={selectedRating}

        />

      )}

    </div>

  );

}