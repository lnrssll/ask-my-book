import React, { useState } from "react";
import type { ActionFunction } from "react-router-dom";
import { Link, useFetcher, useRouteLoaderData } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import { AuthenticityHeaders } from "react-on-rails/node_package/lib/types";

import style from "./Questions.module.css";
import type { DocType } from "../../Docs";
import { Question } from "./Question";
import { Classify } from "../Classify";

interface HTTPOptions {
  method: string;
  headers: AuthenticityHeaders;
  body?: FormData;
}

export const questionsAction: ActionFunction = async ({ request, params }) => {
  const method = request.method;
  const id = params.id;
  const url = `/api/v1/docs/${id}/questions`;
  const headers = ReactOnRails.authenticityHeaders({});
  const options: HTTPOptions = {
    headers,
    method,
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

export interface QuestionType {
  id: number;
  text: string;
  answer: string;
  embedding: number[];
  document_id: number;
}

export interface QuestionsType {
  questions: QuestionType[];
}

export const Questions = () => {
  const { id, title, description, question_weights, questions } =
    useRouteLoaderData("doc") as DocType & QuestionsType;
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const fetcher = useFetcher();

  const handleSubmit = () => {
    setText("");
    setAnswer("");
  };

  return (
    <div className="flexbox scroll-safe">
      <Link to={`/admin/docs/${id}`}>
        <h1 className="centered">{title ?? "Not Found"}</h1>
      </Link>
      {questions.length > 0 && (
        <div>
          {questions.length} question{questions.length > 1 && "s"} found
        </div>
      )}
      <EmbedQuestions questions={questions} />
      {!!questions.length ? (
        <Classify weights={question_weights} />
      ) : (
        <div>You need to add Questions to create a Question classifier</div>
      )}
      <div className={style.container}>
        <fetcher.Form
          onSubmit={handleSubmit}
          className="flexbox no-padding"
          method="post"
        >
          <h2>New Question</h2>
          <label className={style.label} htmlFor="question">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              id="question"
              name="question[text]"
              placeholder="Question..."
            />
          </label>
          <label className={style.label} htmlFor="answer">
            <textarea
              id="answer"
              name="question[answer]"
              placeholder="Answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>
          <button type="submit">Create</button>
        </fetcher.Form>
        {!!questions.length ? (
          questions.reverse().map((q) => <Question question={q} key={q.id} />)
        ) : (
          <div>No questions yet</div>
        )}
      </div>
    </div>
  );
};

const EmbedQuestions = ({ questions }: QuestionsType) => {
  const fetcher = useFetcher();
  const unembeddedQuestions = questions.filter((q) => q.embedding.length === 0);
  const len = questions.length;
  const ulen = unembeddedQuestions.length;
  const plural = ulen > 1;

  if (unembeddedQuestions.length === 0) {
    return <div className="subtle">All {len} questions are embedded</div>;
  }

  if (fetcher.state === "submitting") {
    return (
      <div className="flexbox">
        <div className="loading" />
      </div>
    );
  }

  return (
    <div className="flexbox">
      <p>
        {ulen} of {len} question{plural && "s"} not embedded
      </p>
      <fetcher.Form method="patch">
        <button type="submit">Embed</button>
      </fetcher.Form>
    </div>
  );
};

export default Questions;
