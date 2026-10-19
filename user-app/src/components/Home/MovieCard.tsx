import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';
import { Movie } from '../../types';
import { getAgeRatingInfo } from '../../utils';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();

  const handleBookTicket = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/dat-ve/${movie.id}`);
  };

  const isNowShowing = movie.status === 'now_showing';

  return (
    <Link
      to={`/phim/${movie.id}`}
      className="group relative flex flex-col bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-600/10 cursor-pointer h-full"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-950">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {/* Age Rating */}
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider shadow-md uppercase ${getAgeRatingInfo(
              movie.ageRating
            ).bg}`}
          >
            {movie.ageRating || 'P'}
          </span>

          {/* Status Badge */}
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide shadow-md ${
              isNowShowing ? 'bg-green-600 text-white' : 'bg-amber-500 text-black font-bold'
            }`}
          >
            {isNowShowing ? 'Đang Chiếu' : 'Sắp Chiếu'}
          </span>
        </div>

        {/* Format Badges (Bottom of image) */}
        {movie.format && movie.format.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1 z-10 pointer-events-none">
            {movie.format.map((fmt) => (
              <span
                key={fmt}
                className="bg-black/75 backdrop-blur-sm text-gray-200 border border-gray-700 text-[10px] px-1.5 py-0.5 rounded font-medium"
              >
                {fmt}
              </span>
            ))}
          </div>
        )}

        {/* Hover Overlay with Đặt Vé button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 z-20">
          <button
            onClick={handleBookTicket}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-600/40 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <Ticket className="w-4 h-4" />
            <span>{isNowShowing ? 'Đặt Vé' : 'Xem Chi Tiết'}</span>
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Movie Title */}
          <h3
            className="text-white font-semibold text-base sm:text-lg line-clamp-1 group-hover:text-red-500 transition-colors duration-200"
            title={movie.title}
          >
            {movie.title}
          </h3>

          {/* Genre text */}
          <p className="text-gray-400 text-xs sm:text-sm line-clamp-1 mt-0.5">
            {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
          </p>
        </div>

        {/* Bottom row: Rating & Duration */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 font-bold">{movie.rating?.toFixed(1) || '8.0'}</span>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{movie.duration} phút</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
