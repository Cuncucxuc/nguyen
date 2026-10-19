import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Film } from 'lucide-react';
import { Movie } from '../../types';
import MovieCard from './MovieCard';

interface MovieListProps {
  title: string;
  movies: Movie[];
  showAll?: boolean;
  id?: string;
  viewAllLink?: string;
}

export const MovieList: React.FC<MovieListProps> = ({
  title,
  movies,
  showAll = false,
  id,
  viewAllLink = '#',
}) => {
  // Nếu không showAll thì hiển thị tối đa 10 phim
  const displayedMovies = showAll ? movies : movies.slice(0, 10);

  return (
    <section id={id} className="w-full">
      {/* Header section with title and view all link */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-red-600 rounded-full" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">
            {title}
          </h2>
        </div>

        {!showAll && movies.length > 5 && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-400 transition-colors group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Movie Grid */}
      {displayedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {displayedMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="animate-fadeIn"
              style={{
                animationDelay: `${index * 60}ms`,
                animationFillMode: 'both',
              }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-gray-900/50 border border-gray-800 text-center">
          <Film className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-gray-400 text-base font-medium">
            Hiện chưa có danh sách phim phù hợp.
          </p>
        </div>
      )}
    </section>
  );
};

export default MovieList;
