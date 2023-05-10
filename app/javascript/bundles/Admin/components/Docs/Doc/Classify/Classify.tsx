import React from "react";
import type { ActionFunction } from "react-router-dom";
import { useFetcher, useParams } from "react-router-dom";
import ReactOnRails from "react-on-rails";

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
  alert("Failed to classify doc");
  return res;
};

const Classify = ({ weights }: { weights: number[] }) => {
  const fetcher = useFetcher();
  const { id } = useParams();

  if (fetcher.state === "submitting") {
    return (
      <div className="flexbox">
        <div className="loading" />
      </div>
    );
  }

  return (
    <div className="flexbox">
      <fetcher.Form method="patch" action={`/admin/docs/${id}/classify`}>
        <button className="danger" type="submit">
          {weights.length === 0
            ? "Classify Questions"
            : "Update Classification"}
        </button>
      </fetcher.Form>
    </div>
  );
};

export default Classify;
