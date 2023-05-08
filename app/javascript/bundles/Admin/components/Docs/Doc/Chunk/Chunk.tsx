import React, { useEffect } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import type { DocType } from "../../Docs";
import style from "./Chunk.module.css";

export const chunkAction: ActionFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}/chunk`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "POST",
  });
  if (res.ok) {
    return res;
  }
};

const Chunk = () => {
  const { id, title, chunkCount } = useRouteLoaderData("doc") as DocType;
  const fetcher = useFetcher();
  useEffect(() => {
    if (!chunkCount) {
      fetcher.submit({}, { method: "POST", action: `/admin/docs/${id}/chunk` });
    }
  }, [chunkCount]);

  if (fetcher.state === "submitting") {
    return <div>Chunking...</div>;
  }

  return (
    <div className={style.flexbox}>
      <div>
        {chunkCount} chunks created for {title}
      </div>
      <fetcher.Form method="post" action={`/admin/docs/${id}/chunk`}>
        <button type="submit" className={style.danger}>
          New Chunk
        </button>
      </fetcher.Form>
    </div>
  );
};

export default Chunk;
