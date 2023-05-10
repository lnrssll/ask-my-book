import React, { useEffect } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import type { DocType } from "../../Docs";

export const embedAction: ActionFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}/embed`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "PATCH",
  });
  if (res.ok) {
    return res;
  }
  alert("Failed to embed doc");
  return res;
};

const Embed = () => {
  const { id, embedded, chunkCount } = useRouteLoaderData("doc") as DocType;
  const fetcher = useFetcher();
  useEffect(() => {
    if (chunkCount && !embedded) {
      fetcher.submit({}, { method: "POST", action: `/admin/docs/${id}/embed` });
    }
  }, [embedded, chunkCount]);

  if (fetcher.state === "submitting") {
    return (
      <div className="flexbox no-padding centered">
        <p>Embedding...</p>
        <div className="loading" />
      </div>
    );
  }

  return (
    <div className="flexbox self-end no-padding">
      <div className="subtle centered">
        {embedded ? chunkCount + " chunks embedded" : "Not embedded"}
      </div>
      {embedded ? (
        <button
          type="submit"
          style={{ opacity: "50%" }}
          disabled
          className="no-cursor no-shadow danger"
        >
          No Action
        </button>
      ) : (
        <fetcher.Form method="POST" action={`/admin/docs/${id}/embed`}>
          <button type="submit" className="danger">
            Retry
          </button>
        </fetcher.Form>
      )}
    </div>
  );
};

export default Embed;
