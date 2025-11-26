import { useEffect, useState } from "react";
import { Link } from "react-router";

const Upcoming = () => {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [upcomingShows, setUpcomingShows] = useState([]);
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
    // Fetch upcoming movies
    fetch(
      "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1",
      options
    )
      .then((res) => res.json())
      .then((res) => setUpcomingMovies(res.results || []))
      .catch((err) => console.error(err));

    // Fetch upcoming TV shows
    fetch(
      "https://api.themoviedb.org/3/tv/on_the_air?language=en-US&page=1",
      options
    )
      .then((res) => res.json())
      .then((res) => {
        setUpcomingShows(res.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#181818] text-white p-5">
      <h1 className="text-3xl font-bold mb-5">Upcoming</h1>
      <p className="text-gray-400 mb-8">
        Browse upcoming movies and shows...
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-xl">Loading...</span>
        </div>
      ) : (
        <>
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Upcoming Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {upcomingMovies.map((movie) => (
                <Link to={`/movie/${movie.id}`} key={movie.id}>
                  <div className="bg-[#181818] p-3 rounded-lg hover:scale-105 transition duration-300">
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      alt={movie.title}
                      className="rounded-md w-full h-60 object-cover"
                    />
                    <h3 className="text-sm font-semibold mt-2 text-center">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-400 text-center">
                      {movie.release_date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming TV Shows</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {upcomingShows.map((show) => (
                <Link to={`/tv/${show.id}`} key={show.id}>
                  <div className="bg-[#181818] p-3 rounded-lg hover:scale-105 transition duration-300">
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${show.poster_path}`}
                      alt={show.name}
                      className="rounded-md w-full h-60 object-cover"
                    />
                    <h3 className="text-sm font-semibold mt-2 text-center">
                      {show.name}
                    </h3>
                    <p className="text-xs text-gray-400 text-center">
                      {show.first_air_date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Upcoming;
  