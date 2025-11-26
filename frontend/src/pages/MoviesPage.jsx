import { useEffect, useState } from "react";
import { Link } from "react-router";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwODYyM2VlMWMzNDJlOGUyMWJlNWJlOWExNDBmZTIzMyIsIm5iZiI6MTc2MjI2NjE4Mi4yOTksInN1YiI6IjY5MGEwYzQ2ODY5ZGQzNmNlNmRiOGRhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1DX9CDKHz4Lcr89Dz1XTw6OgETUTPGyqTc1Qxm3G4Wk",
    },
  };

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`,
      options
    )
      .then((res) => res.json())
      .then((res) => {
        if (page === 1) {
          setMovies(res.results || []);
        } else {
          setMovies((prev) => [...prev, ...(res.results || [])]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [page]);

  return (
    <div className="min-h-screen bg-[#181818] text-white p-5">
      <h1 className="text-3xl font-bold mb-5">All Movies</h1>

      {loading && page === 1 ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-xl">Loading...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {movies.map((movie) => (
              <Link to={`/movie/${movie.id}`} key={movie.id}>
                <div className="bg-[#181818] p-3 rounded-lg hover:scale-105 transition duration-300">
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-md w-full h-60 object-cover"
                  />
                  <h2 className="text-sm font-semibold mt-2 text-center">
                    {movie.title}
                  </h2>
                  <p className="text-xs text-gray-400 text-center">
                    ⭐ {movie.vote_average?.toFixed(1)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loading}
              className="bg-[#e50914] text-white px-6 py-2 rounded-full hover:bg-[#c40812] disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MoviesPage;
  