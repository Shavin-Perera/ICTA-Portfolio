'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReviewForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{firstName: string; lastName: string} | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsLoggedIn(false);
          setIsLoading(false);
          return;
        }

        // Fetch user data if logged in
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            firstName: data.firstName,
            lastName: data.lastName
          });
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token || !userData) {
        toast.error('Please log in to submit a review');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          reviewText,
          firstName: userData.firstName,
          lastName: userData.lastName,
          status: 'pending' // Temporary status until approved
        })
      });

      if (response.ok) {
        toast.success('Review submitted for approval!');
        setRating(0);
        setReviewText('');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      toast.error('Error submitting review');
      console.error('Review submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-[#F4E007]" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Want to leave a review?</h3>
        <p className="text-white/80 mb-4">Please log in to share your experience</p>
        <Button 
          onClick={() => router.push('/login')}
          className="bg-[#F4E007] hover:bg-[#F4E007]/90 text-[#220D54] font-medium"
        >
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-3xl mx-auto bg-slate-600">
      <h3 className="text-xl font-bold text-white mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Your Rating
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating ? 'text-[#F4E007] fill-current' : 'text-white/30'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="review" className="block text-white/80 text-sm font-medium mb-2">
            Your Review
          </label>
          <textarea
            id="review"
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4E007] text-white placeholder-white/50"
            placeholder="Share your experience..."
            required
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="bg-[#F4E007] hover:bg-[#F4E007]/90 text-[#220D54] font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}