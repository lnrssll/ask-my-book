import React, { useState, useEffect } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
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
};

const Search = () => {
  const [expanded, setExpanded] = useState(0);
  const fetcher = useFetcher();
  const { chunkCount } = useRouteLoaderData("doc") as DocType;

  if (fetcher.state === "submitting") {
    return <div>Searching...</div>;
  }

  return (
    <div className={style.flexbox}>
      <fetcher.Form method="patch">
        <button type="submit" className={style.danger}>
          New Search Test
        </button>
      </fetcher.Form>
      {fetcher.data && (
        <div className={style.flexbox}>
          <div>Results</div>
          <div className={style.grid}>
            {fetcher.data.result?.map((result: number, i: number) => (
              <button
                key={i}
                style={{
                  backgroundColor: expanded === i ? "#ffebee" : "#eebb11",
                }}
                onClick={() => setExpanded(i)}
                className={style.item}
              >
                <div>#{i + 1}</div>
                <div>{result}</div>
              </button>
            ))}
          </div>
          <div>Chunks labeled 0 through {chunkCount}</div>
          <div>{fetcher.data.time} millis</div>
          <div className={style.label}>{fetcher.data.labels[expanded]}</div>
        </div>
      )}
    </div>
  );
};

export default Search;
