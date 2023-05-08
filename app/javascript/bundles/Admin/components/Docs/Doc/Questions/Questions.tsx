import React, { useState } from "react";
import type { ActionFunction } from "react-router-dom";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import { AuthenticityHeaders } from "react-on-rails/node_package/lib/types";

import style from "./Questions.module.css";
import type { DocType } from "../../Docs";
import { Question } from "./Question";

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
  const { title, description, question_weights, questions } =
    useRouteLoaderData("doc") as DocType & QuestionsType;
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const fetcher = useFetcher();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setText("");
    setAnswer("");
  };

  return (
    <div className={style.flexbox}>
      <h1>{title ?? "Not Found"}</h1>
      {description && <p>{description}</p>}
      <EmbedQuestions questions={questions} />
      <div className={style.horizontal}>
        <fetcher.Form
          onSubmit={handleSubmit}
          className={style.flexbox}
          method="post"
        >
          <h2>New Question</h2>
          <label htmlFor="question">
            <div className={style.label}>Question</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              id="question"
              name="question[text]"
            />
          </label>
          <label htmlFor="answer">
            <div className={style.label}>Answer</div>
            <textarea
              id="answer"
              name="question[answer]"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>
          <button type="submit">Create</button>
        </fetcher.Form>
        <div className={style.flexbox}>
          <h2>Questions</h2>
          {questions.length > 0 && (
            <div>
              {questions.length} question{questions.length > 1 && "s"} found
            </div>
          )}
          {!!questions.length ? (
            questions.reverse().map((q) => <Question question={q} key={q.id} />)
          ) : (
            <p>No questions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const EmbedQuestions = ({ questions }: QuestionsType) => {
  const fetcher = useFetcher();
  const unembeddedQuestions = questions.filter((q) => q.embedding.length === 0);

  if (unembeddedQuestions.length === 0) {
    return <div>All questions are embedded</div>;
  }

  return (
    <div className={style.smallflex}>
      <p>{unembeddedQuestions.length} questions are not embedded</p>
      <fetcher.Form method="patch">
        <button type="submit">Embed Questions</button>
      </fetcher.Form>
    </div>
  );
};

export default Questions;
