import React, { useEffect, useState, useRef } from "react";
import type { MouseEvent } from "react";
import style from "./Ask.module.css";
import { redirect, useFetcher, useLoaderData } from "react-router-dom";
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
  const [answer, setAnswer] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data) {
      setQuestion(fetcher.data.text);
      setAnswer(fetcher.data.answer);
    }
  }, [fetcher.data]);

  const handleAsk = (e: MouseEvent) => {
    e.preventDefault();
    buttonRef.current?.click();
  };

  return (
    <div className={style.flexbox}>
      <h2 className={style.bold}>{title}</h2>
      {author && <h3>By {author}</h3>}
      {description && <div>{description}</div>}
      <div className={style.flexbox}>
        <fetcher.Form className={style.flexbox} method="post">
          <label htmlFor="question" className={style.flexbox}>
            <div className={style.explanation}>
              {
                "This is an experiment in using AI to make my book's content more accessible. Ask a question and AI'll answer it in real-time:"
              }
            </div>
            <textarea
              disabled={fetcher.state === "submitting"}
              id="question"
              name="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>
          {answer && (
            <div className={style.answer}>
              <div>
                <span className={style.bold}>Answer:</span> {answer}
              </div>
              <button
                className={style.button}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setAnswer("");
                  setQuestion("");
                }}
              >
                Ask Another Question
              </button>
            </div>
          )}
          <div className={style.horizontal}>
            <button ref={buttonRef} hidden type="submit">
              Ask Question
            </button>
          </div>
        </fetcher.Form>
        {fetcher.state === "submitting" ? (
          <div className={style.loading} />
        ) : (
          !answer && (
            <div className={style.horizontal}>
              <button className={style.button} onClick={handleAsk}>
                Ask Question
              </button>
              <fetcher.Form method="patch">
                <button className={style.button} type="submit">
                  {"I'm feeling lucky"}
                </button>
              </fetcher.Form>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Ask;
