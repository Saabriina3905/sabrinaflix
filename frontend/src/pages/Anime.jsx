import { useEffect, useState } from "react";
import { Link } from "react-router";

const Anime = () => {
  const [anime, setAnime] = useState([]);
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
    // Fetch anime using TMDB with anime genre filter
    fetch(
      "https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=16&sort_by=popularity.desc&page=1",
      options
    )
      .then((res) => res.json())
      .then((res) => {
        setAnime(res.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#181818] text-white p-5">
      <h1 className="text-3xl font-bold mb-5">Anime</h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-xl">Loading...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {anime.map((item) => (
            <Link to={`/tv/${item.id}`} key={item.id}>
              <div className="bg-[#181818] p-3 rounded-lg hover:scale-105 transition duration-300">
                <img
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                  alt={item.name}
                  className="rounded-md w-full h-60 object-cover"
                />
                <h2 className="text-sm font-semibold mt-2 text-center">
                  {item.name}
                </h2>
                <p className="text-xs text-gray-400 text-center">
                  ⭐ {item.vote_average?.toFixed(1)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Anime;
  