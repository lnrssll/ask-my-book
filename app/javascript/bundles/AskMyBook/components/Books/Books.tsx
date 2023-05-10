import React from "react";
import { Link, useLoaderData } from "react-router-dom";
import type { LoaderFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";

export const booksLoader: LoaderFunction = async () => {
  const url = "/api/v1/books";
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "GET",
  });
  if (res.ok) {
    return res;
  }
};

export interface BookType {
  id: number;
  title: string;
  author: string;
  description: string;
  default_question: string;
}

const Books = () => {
  const books = useLoaderData() as BookType[];

  return (
    <div className="flexbox fit left">
      {!!books.length &&
        books.map((book) => (
          <Link to={`questions/${book.id}`} key={book.id}>
            <h2>{book.title}</h2>
            {book.author && <h3>By {book.author}</h3>}
            <hr />
            <p className="subtle">
              {book.description || "No description available"}
            </p>
          </Link>
        ))}
    </div>
  );
};

export default Books;
