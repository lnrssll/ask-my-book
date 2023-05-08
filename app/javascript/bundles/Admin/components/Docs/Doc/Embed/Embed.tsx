import React, { useEffect } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import type { DocType } from "../../Docs";
import style from "./Embed.module.css";

export const embedAction: ActionFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}/embed`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "POST",
  });
  if (res.ok) {
    return res;
  }
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
    return <div>Embeding...</div>;
  }

  return (
    <div className={style.flexbox}>
      <div>{embedded ? "Chunks embedded" : "Not embedded"}</div>
    </div>
  );
};

export default Embed;
