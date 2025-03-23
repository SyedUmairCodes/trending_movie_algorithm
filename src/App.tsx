import { useEffect, useState } from "react";
import "./App.css";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import Card from "./components/Card";
import { useDebounce } from "react-use";
import { getSearchCount, updateSearchCount } from "./appwrite";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_KEY = import.meta.env.VITE_MOVIEDB_API;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

type TrendingMovie = {
  poster_url: string | undefined;
  title: string | undefined;
  $id: string;
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState<any[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
      setMovieList(data.results || []);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to fetch movies, please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      const moviesResult = await getSearchCount();
      // Extract the documents array from the DocumentList
      if (moviesResult && "documents" in moviesResult) {
        const mappedMovies: TrendingMovie[] = moviesResult.documents.map(
          (doc) => ({
            $id: doc.$id,
            title: doc.title || "",
            poster_url: doc.poster_url || "",
            // Map other properties as needed
          })
        );
        setTrendingMovies(mappedMovies);
      } else {
        setTrendingMovies([]);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(
        "Failed to fetch trending movies, please try again later."
      );
    }
  };

  // const fetchTrendingMovies = async () => {
  //   try {
  //     const movies = await getSearchCount();
  //     setTrendingMovies(movies);
  //   } catch (error) {
  //     console.log(error);
  //     setErrorMessage("Failed to fetch movies, please try again later.");
  //   }
  // };
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
    fetchTrendingMovies();
  }, [debouncedSearchTerm]);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" />
          <h1>
            Find All Of Your Favorite{" "}
            <span className="text-gradient">Movies</span>
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>TrendingMovies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>Latest Releases</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <Card key={movie.key} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
