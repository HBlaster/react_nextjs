import axios from 'axios';
import React from 'react';
import { server } from '../../../../config/index';
import Image from 'next/image';
import Meta from '../../../../components/Meta';
import Crew from '../../../../components/crew';

const Movie = ({ movie, movieDetails }) => {
  console.log("pelicula recibida en id", movie);
  return (
    <>
    <div className="container max-w-7xl mx-auto pt-6 flex">
      <div className="w-1/3">
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          layout="responsive"
          width={300}
          height={600}
          style={{ width: "100%", display: "block", maxHeight: "100vh", objectFit: "cover" }}
          className="rounded-md"
          alt={movie.title} />
      </div>
      <div className="w-2/3 px-3">
        <Meta title={movie.title} />
        <h1 className="font-bold text-xl my-2">{movie.title}</h1>
        <p className="text-gray-600 text-sm mt-4">{movie.overview}</p>
        <p className="mt-5 text-gray-600 text-sm">Genres: <span className="font-bold">{movie.genres.reduce((acc, genre, index) => {
          if (index === 0) {
            return genre.name;
          } else if (index === movie.genres.length - 1) {
            return acc + " & " + genre.name;
          } else {
            return acc + ", " + genre.name;
          }
        }, "")}</span></p>
        <p className="text-gray-600 text-sm">Release Date: <span className="font-bold">{movie.release_date}</span></p>
      </div>
    </div>
    {/* <div className="w-full container max-w-7xl mx-auto"> */}
    <div className=" container max-w-3xl mx-auto">
        <Crew credits={movieDetails.topBilledCast}></Crew>
    </div>
      </>
  )
}
export async function getStaticProps(context) {
  const { id} = context.params;
  const [movieRes, creditsRes] = await Promise.all([
    axios(`${server}/${id}?api_key=${process.env.API_KEY}`),
    axios(`${server}/${id}/credits?api_key=${process.env.API_KEY}`)
  ]);
  const movie = movieRes.data;
  const credits = creditsRes.data;
  const topBilledCast = credits.cast.filter(actor => actor.order <= 4);
  const director = credits.crew.find(member => member.job === "Director");
  const writers = credits.crew.filter(member => member.department === "Writing").slice(0, 5);
  const movieDetails = {
    topBilledCast,
    director,
    writers
  };

  return {
    props: { movie, movieDetails }
  };
}

export async function getStaticPaths() {
  const lists = ['top_rated', 'popular', 'upcoming', 'now_playing'];

  const paths = [];

  for (const list of lists) {
    const res = await axios(`${server}/${list}?api_key=${process.env.API_KEY}`);
    const movies = res.data.results;

    const ids = movies.map(movie => movie.id);
    const listPaths = ids.map(id => ({ params: { list, id: id.toString() } }));

    paths.push(...listPaths);
  }

  return {
    paths,
    fallback: false
  };
}
export default Movie