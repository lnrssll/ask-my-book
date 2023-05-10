import React from "react";
import type { ActionFunction } from "react-router-dom";
import { useFetcher } from "react-router-dom";
import ReactOnRails from "react-on-rails";

import type { QuestionType } from "../Questions";

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
  alert("Failed to delete question");
  return res;
};

const Question = ({ question }: { question: QuestionType }) => {
  const fetcher = useFetcher();
  return (
    <div className="flexbox no-padding justify">
      <b>{question.text.trim()}</b>
      <div className="flexbox no-grow no-padding">
        <p className="inconsolata standout">{question.answer.trim()}</p>
      </div>
      <div className="horizontal">
        {!!question.embedding.length && <div className="subtle">Embedded</div>}
        <fetcher.Form method="delete" action={question.id.toString()}>
          <button className="danger" type="submit">
            Delete
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
};

export default Question;
