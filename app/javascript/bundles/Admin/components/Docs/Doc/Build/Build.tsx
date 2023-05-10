import React, { useState, useEffect } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import type { DocType } from "../../Docs";

export const buildAction: ActionFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}/build`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "PATCH",
  });
  if (res.ok) {
    return res;
  }
  alert("Failed to build doc");
  return res;
};

const Build = () => {
  const { id, trees: oldTrees } = useRouteLoaderData("doc") as DocType;
  const [trees, setTrees] = useState(oldTrees);
  const [showForm, setShowForm] = useState(false);
  const fetcher = useFetcher();
  useEffect(() => {
    if (!oldTrees) {
      fetcher.submit({}, { method: "POST", action: `/admin/docs/${id}/build` });
    }
  }, [oldTrees]);

  useEffect(() => {
    setShowForm(false);
  }, [fetcher.state]);

  if (fetcher.state === "submitting") {
    return (
      <div className="flexbox no-padding centered">
        <p>Building...</p>
        <div className="loading" />
      </div>
    );
  }

  return (
    <div className="flexbox self-end no-padding">
      <div className="subtle centered">
        {oldTrees ? `Index built with ${oldTrees} trees` : "Index not built"}
      </div>
      {showForm ? (
        <fetcher.Form
          className="flexbox"
          method="post"
          action={`/admin/docs/${id}/build`}
        >
          <label htmlFor="trees">
            <div>Search Trees in Index</div>
            <input
              type="number"
              name="trees"
              min="0"
              step="1"
              value={trees}
              onChange={(e) => setTrees(parseInt(e.target.value))}
            />
          </label>
          <div className="horizontal">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowForm(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="danger">
              Confirm
            </button>
          </div>
        </fetcher.Form>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowForm(true);
          }}
          className="danger"
        >
          New Build
        </button>
      )}
    </div>
  );
};

export default Build;
