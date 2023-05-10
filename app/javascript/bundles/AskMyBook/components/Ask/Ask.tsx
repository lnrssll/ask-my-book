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
    default_question: defaultQuestion,
  } = useLoaderData() as BookType;
  const [question, setQuestion] = useState(defaultQuestion);
  const [answer, setAnswer] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data) {
      setQuestion(fetcher.data.text);
      setAnswer(fetcher.data.answer.split(" "));
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (answer && answer.length > index) {
      const timer = setTimeout(() => {
        setIndex(index + 1);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [answer, index]);

  const handleAsk = (e: MouseEvent) => {
    e.preventDefault();
    buttonRef.current?.click();
  };

  return (
    <div className="flexbox top">
      <h2 className="centered">{title}</h2>
      {author && <h3>By {author}</h3>}
      <fetcher.Form className="flexbox fit" method="post">
        <label htmlFor="question" className="flexbox">
          <div className="subtle">
            {
              "This is an experiment in using AI to make my book's content more accessible. Ask a question and AI'll answer it in real-time:"
            }
          </div>
          <textarea
            disabled={fetcher.state === "submitting" || !!answer.length}
            id="question"
            name="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        {!!answer.length && (
          <>
            <div className={style.answer}>
              {answer.slice(0, index).join(" ")}
            </div>
            <button
              className={style.button}
              hidden={answer.length > index}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setAnswer([]);
                setIndex(0);
                setQuestion("");
              }}
            >
              Ask Another Question
            </button>
          </>
        )}
        <div className={style.horizontal}>
          <button ref={buttonRef} hidden type="submit">
            Ask Question
          </button>
        </div>
      </fetcher.Form>
      <div className="flexbox fit">
        {fetcher.state === "submitting" ? (
          <div className={style.loading} />
        ) : (
          !answer.length && (
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
