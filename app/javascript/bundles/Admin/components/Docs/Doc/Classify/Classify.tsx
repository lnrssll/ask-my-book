import React from "react";
import type { ActionFunction } from "react-router-dom";
import { useFetcher } from "react-router-dom";
import ReactOnRails from "react-on-rails";

import style from "./Classify.module.css";

export const classifyAction: ActionFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}/classify`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "PATCH",
  });
  if (res.ok) {
    return res;
  }
};

const Classify = ({ weights }: { weights: number[] }) => {
  const fetcher = useFetcher();

  return (
    <div className={style.smallflex}>
      <fetcher.Form method="patch" action={"classify"}>
        <button className={style.danger} type="submit">
          {weights.length === 0
            ? "Classify Questions"
            : "Update Classification"}
        </button>
      </fetcher.Form>
    </div>
  );
};

export default Classify;
