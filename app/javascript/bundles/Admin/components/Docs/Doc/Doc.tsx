import React from "react";
import { redirect, useFetcher, useLoaderData } from "react-router-dom";
import type { LoaderFunction, ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import moment from "moment";

import style from "./Doc.module.css";
import type { DocType } from "../Docs";

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
  const { title, description, author, start, end, created_at } =
    useLoaderData() as DocType;
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
      <fetcher.Form method="delete">
        <button type="submit" className={style.danger}>
          Delete
        </button>
      </fetcher.Form>
    </div>
  );
};

export default DocView;
