import React, { useState, useEffect } from "react";
import { Link, useFetcher, useRouteLoaderData } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import type { DocType } from "../../Docs";
import style from "./Search.module.css";

export const searchAction: ActionFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}/search`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "PATCH",
  });
  if (res.ok) {
    return res;
  }
  alert("Failed to search");
  return res;
};

const Search = () => {
  const [expanded, setExpanded] = useState(0);
  const fetcher = useFetcher();
  const { id, title, chunkCount } = useRouteLoaderData("doc") as DocType;

  if (fetcher.state === "submitting") {
    return (
      <div className="flexbox">
        <div className="loading" />
      </div>
    );
  }

  return (
    <div className="flexbox">
      <Link to={`/admin/docs/${id}`}>
        <h1 className="centered">{title ?? "Not Found"}</h1>
      </Link>
      <fetcher.Form method="patch">
        <button type="submit">New Search Test</button>
      </fetcher.Form>
      {fetcher.data && (
        <div className="flexbox fit">
          <div className={style.grid}>
            {fetcher.data.result?.map((result: number, i: number) => (
              <button
                key={i}
                style={{
                  backgroundColor: expanded === i ? "#2f2626" : "#fffff0",
                  color: expanded === i ? "#fffff0" : "#2f2626",
                }}
                onClick={() => setExpanded(i)}
                className={style.item}
              >
                <div>#{i + 1}</div>
                <div>{result}</div>
              </button>
            ))}
          </div>
          <div className="subtle">Chunks labeled 0 through {chunkCount}</div>
          <div>{fetcher.data.time} millis</div>
          <div className="standout fit">{fetcher.data.labels[expanded]}</div>
        </div>
      )}
    </div>
  );
};

export default Search;
