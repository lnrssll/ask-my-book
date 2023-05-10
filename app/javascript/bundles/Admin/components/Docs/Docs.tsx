import React from "react";
import { Link, useFetcher, useLoaderData } from "react-router-dom";
import type { LoaderFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import moment from "moment";

import style from "./Docs.module.css";

export const docsLoader: LoaderFunction = async () => {
  const headers = ReactOnRails.authenticityHeaders({});
  const url = "/api/v1/docs";
  const res = await fetch(url, {
    headers: headers,
    method: "GET",
  });
  if (res.ok) {
    return res;
  }
  alert("Failed to load docs");
  return res;
};

export interface DocType {
  id: number;
  title: string;
  description: string;
  author: string;

  chunkCount: number;

  embedded: boolean;

  components: number;
  variance: number;

  trees: number;

  question_weights: number[];

  ready: boolean;

  start: number;
  end: number;

  created_at: string;
  updated_at: string;
}

const Docs = () => {
  const docs = useLoaderData() as DocType[];
  const fetcher = useFetcher();

  return (
    <div className="flexbox">
      {!!docs.length &&
        docs.map((doc) => (
          <div className="flexbox" key={doc.id}>
            <div>
              <Link to={String(doc.id)}>
                <h2>{doc.title}</h2>
                {doc.author && <h3>By {doc.author}</h3>}
              </Link>
              <div className="horizontal">
                <div className="subtle">{moment(doc.created_at).fromNow()}</div>
                <fetcher.Form method="delete" action={`/admin/docs/${doc.id}`}>
                  <button type="submit" className={style.danger}>
                    Delete
                  </button>
                </fetcher.Form>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Docs;
