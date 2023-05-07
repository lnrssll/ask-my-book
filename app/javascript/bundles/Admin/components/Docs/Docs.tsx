import React from "react";
import { useLoaderData } from "react-router-dom";
import style from "./Docs.module.css";
import ReactOnRails from "react-on-rails";

export const docsLoader = async () => {
  const headers = ReactOnRails.authenticityHeaders({});
  const url = "/api/v1/docs";
  const res = await fetch(url, {
    headers: headers,
    method: "GET",
  });
  if (res.ok) {
    return res;
  }
};

export interface Doc {
  id: number;
  title: string;
  description: string;

  created_at: string;
  updated_at: string;
}

const Docs = () => {
  const docs = useLoaderData() as Doc[];

  return (
    <div className={style.flexbox}>
      <h1>Docs</h1>
      {!!docs.length &&
        docs.map((doc) => (
          <div key={doc.id}>
            <h2>{doc.title}</h2>
            <p>{doc.description}</p>
            <p>{doc.created_at}</p>
          </div>
        ))}
    </div>
  );
};

export default Docs;
