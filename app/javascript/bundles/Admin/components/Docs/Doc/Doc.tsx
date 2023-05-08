import React from "react";
import { Link, redirect, useFetcher, useLoaderData } from "react-router-dom";
import type { LoaderFunction, ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import moment from "moment";

import style from "./Doc.module.css";
import type { DocType } from "../Docs";
import type { QuestionsType } from "./Questions";
import { Chunk } from "./Chunk";
import { Embed } from "./Embed";
import { Decompose } from "./Decompose";
import { Build } from "./Build";
import { Classify } from "./Classify";
import { Search } from "./Search";

export const docLoader: LoaderFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "GET",
  });
  if (res.ok) {
    return res;
  }
};

export const docAction: ActionFunction = async ({ request, params }) => {
  const method = request.method;
  const id = params.id;
  const url = `/api/v1/docs/${id}`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method,
  });
  if (res.ok) {
    return redirect("/admin/docs");
  }
};

const DocView = () => {
  const {
    id,
    title,
    description,
    author,
    start,
    end,
    created_at,
    questions,
    question_weights,
    chunkCount,
    embedded,
    components,
    trees,
  } = useLoaderData() as DocType & QuestionsType;
  const fetcher = useFetcher();

  return (
    <div className={style.flexbox}>
      <h1>{title}</h1>
      {author && <h3>By {author}</h3>}
      <div>{moment(created_at).fromNow()}</div>
      {description && <div>{description}</div>}
      <div>
        Pages {start}-{end}
      </div>
      <fetcher.Form method="patch">
        <button type="submit" className={style.danger}>
          Go Live
        </button>
      </fetcher.Form>
      <fetcher.Form method="delete">
        <button type="submit" className={style.danger}>
          Delete
        </button>
      </fetcher.Form>
      <div className={style.flexbox}>
        <Link to={`/admin/docs/${id}/questions`}>Edit Questions</Link>
        {!!questions.length ? (
          <Classify weights={question_weights} />
        ) : (
          <div>You need to add Questions to create a Question classifier</div>
        )}
      </div>
      {!!trees && <Link to="search">Test Search</Link>}
      <Chunk />
      {chunkCount > 0 && <Embed />}
      {embedded && <Decompose />}
      {!!components && <Build />}
    </div>
  );
};

export default DocView;
