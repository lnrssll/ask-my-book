import React, { useState, useRef } from "react";
import type { MouseEvent } from "react";
import style from "./Ask.module.css";
import { Form, redirect, useFetcher, useLoaderData } from "react-router-dom";
import type { ActionFunction, LoaderFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import { AuthenticityHeaders } from "react-on-rails/node_package/lib/types";

import type { BookType } from "../Books";

interface HTTPOptions {
  method: string;
  headers: AuthenticityHeaders;
  body?: FormData;
}

export const askAction: ActionFunction = async ({ request, params }) => {
  const method = request.method;
  const id = params.id;
  const url = "/api/v1/questions/" + id;
  const headers = ReactOnRails.authenticityHeaders({});
  const options: HTTPOptions = {
    method,
    headers,
  };
  if (method === "POST") {
    const formData = await request.formData();
    options["body"] = formData;
  }
  const res = await fetch(url, options);
  if (res.ok) {
    return res;
  }
};

export const askLoader: LoaderFunction = async ({ params }) => {
  const url = "/api/v1/books/" + params.id;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "GET",
  });
  if (res.ok) {
    return res;
  } else {
    return redirect("/");
  }
};

const Ask = () => {
  const {
    title,
    author,
    description,
    default_question: defaultQuestion,
  } = useLoaderData() as BookType;
  const [question, setQuestion] = useState(defaultQuestion);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fetcher = useFetcher();

  const handleAsk = (e: MouseEvent) => {
    e.preventDefault();
    buttonRef.current?.click();
  };

  return (
    <div className={style.none}>
      <h1>Ask My Book</h1>
      <h2>{title}</h2>
      <h3>{author}</h3>
      <div>{description}</div>
      <div>{defaultQuestion}</div>
      <hr />
      <div className={style.flexbox}>
        <fetcher.Form className={style.flexbox} method="post">
          <label htmlFor="question" className={style.flexbox}>
            <p>
              {
                "This is an experiment in using AI to make my book's content more accessible. Ask a question and AI'll answer it in real-time:"
              }
            </p>
            <textarea
              id="question"
              name="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>
          <div className={style.horizontal}>
            <button ref={buttonRef} hidden type="submit">
              Ask Question
            </button>
          </div>
        </fetcher.Form>
        <div className={style.horizontal}>
          <button onClick={handleAsk}>Ask Question</button>
          <fetcher.Form method="get">
            <button type="submit">{"I'm feeling lucky"}</button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
};

export default Ask;
