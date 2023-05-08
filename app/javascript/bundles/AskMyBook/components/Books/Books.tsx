import React from "react";
import style from "./Books.module.css";
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
    <div className={style.flexbox}>
      {!!books.length &&
        books.map((book) => (
          <Link to={`questions/${book.id}`} key={book.id}>
            <h2>{book.title}</h2>
            <h3>{book.author}</h3>
            <p>{book.description}</p>
          </Link>
        ))}
    </div>
  );
};

export default Books;
