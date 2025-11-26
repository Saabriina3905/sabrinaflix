import { useEffect, useState } from "react";
import { Link } from "react-router";


const TvShows = () => {
  const [shows, setShows] = useState([]);

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwODYyM2VlMWMzNDJlOGUyMWJlNWJlOWExNDBmZTIzMyIsIm5iZiI6MTc2MjI2NjE4Mi4yOTksInN1YiI6IjY5MGEwYzQ2ODY5ZGQzNmNlNmRiOGRhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1DX9CDKHz4Lcr89Dz1XTw6OgETUTPGyqTc1Qxm3G4Wk"
    },
  };

  useEffect(() => {
    fetch("https://api.themoviedb.org/3/tv/popular?language=en-US&page=1", options)
      .then((res) => res.json())
      .then((res) => setShows(res.results))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="text-white p-5">
      <h1 className="text-3xl font-bold mb-5">TV Shows</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
  {shows.map((show) => (
    <Link to={`/tv/${show.id}`} key={show.id}>
      <div className="bg-[#181818] p-3 rounded-lg hover:scale-105 transition duration-300">
        <img
          src={`https://image.tmdb.org/t/p/w500/${show.poster_path}`}
          alt={show.name}
          className="rounded-md w-full h-60 object-cover"
        />
        <h2 className="text-sm font-semibold mt-2 text-center">{show.name}</h2>
      </div>
    </Link>
  ))}
</div>

    </div>
  );
};

export default TvShows;
