import axiosClient from './axiosClient';

export const getReviewsByTour = (tourId: string) =>
  axiosClient.get('/reviews', { params: { tour: tourId } });
export const createReview = (data: { tour: string; rating: number; review: string }) =>
  axiosClient.post('/reviews', data);
export const updateReview = (id: string, data: Partial<{ rating: number; review: string }>) =>
  axiosClient.patch(`/reviews/${id}`, data);
export const deleteReview = (id: string) => axiosClient.delete(`/reviews/${id}`);
export const getReviews = (params?: Record<string, unknown>) => axiosClient.get('/reviews', { params });



