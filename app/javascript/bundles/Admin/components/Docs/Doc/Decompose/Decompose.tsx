import React, { useState, useEffect } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import type { DocType } from "../../Docs";

export const decomposeAction: ActionFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}/decompose`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "PATCH",
  });
  if (res.ok) {
    return res;
  }
};

const Decompose = () => {
  const {
    id,
    components,
    variance: oldVariance,
  } = useRouteLoaderData("doc") as DocType;
  const [variance, setVariance] = useState(oldVariance);
  const [showForm, setShowForm] = useState(false);

  const fetcher = useFetcher();
  useEffect(() => {
    if (!components) {
      fetcher.submit(
        {},
        { method: "POST", action: `/admin/docs/${id}/decompose` }
      );
    }
  }, [components]);

  useEffect(() => {
    setShowForm(false);
  }, [fetcher.state]);

  if (fetcher.state === "submitting") {
    return (
      <div className="flexbox no-padding centered">
        <p>Decomposing...</p>
        <div className="loading" />
      </div>
    );
  }

  return (
    <div className="flexbox self-end no-padding">
      <div className="subtle centered" style={{ width: "300px" }}>
        decomposed and projected onto {components} dimensions with {oldVariance}
        % of variance retained
      </div>
      {showForm ? (
        <fetcher.Form
          className="flexbox"
          method="post"
          action={`/admin/docs/${id}/decompose`}
        >
          <label htmlFor="variance">
            <div>% of Variance Retained</div>
            <input
              type="number"
              name="variance"
              min="0"
              max="100"
              step="1"
              value={variance}
              onChange={(e) => setVariance(parseInt(e.target.value))}
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
          New Decompose
        </button>
      )}
    </div>
  );
};

export default Decompose;
