import React, { useEffect } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import type { DocType } from "../../Docs";

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
  alert("Failed to chunk doc");
  return res;
};

const Chunk = () => {
  const { id, chunkCount } = useRouteLoaderData("doc") as DocType;
  const fetcher = useFetcher();
  useEffect(() => {
    if (!chunkCount) {
      fetcher.submit({}, { method: "POST", action: `/admin/docs/${id}/chunk` });
    }
  }, [chunkCount]);

  if (fetcher.state === "submitting") {
    return (
      <div className="flexbox no-padding centered">
        <p>Chunking...</p>
        <div className="loading" />
      </div>
    );
  }

  return (
    <div className="flexbox self-end no-padding">
      <div className="subtle centered">{chunkCount} chunks created</div>
      <fetcher.Form method="post" action={`/admin/docs/${id}/chunk`}>
        <button type="submit" className="danger">
          New Chunk
        </button>
      </fetcher.Form>
    </div>
  );
};

export default Chunk;
