import React from "react";
import type { ActionFunction } from "react-router-dom";
import { useFetcher } from "react-router-dom";
import ReactOnRails from "react-on-rails";

import type { QuestionType } from "../Questions";
import style from "./Question.module.css";

export const questionAction: ActionFunction = async ({ request, params }) => {
  const method = request.method;
  const id = params.id;
  const questionId = params.questionId;
  const url = `/api/v1/docs/${id}/questions/${questionId}`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method,
  });
  if (res.ok) {
    return res;
  }
};

const Question = ({ question }: { question: QuestionType }) => {
  const fetcher = useFetcher();
  return (
    <div className={style.smallflex}>
      <p>{question.text.trim()}</p>
      <p>{question.answer.trim()}</p>
      <fetcher.Form
        method="delete"
        action={question.id.toString()}
        className={style.flexbox}
      >
        <button type="submit">Delete</button>
      </fetcher.Form>
      {!!question.embedding.length && <div>Embedded</div>}
    </div>
  );
};

export default Question;
