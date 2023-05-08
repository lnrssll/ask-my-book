import React, { useState, useEffect } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import type { DocType } from "../../Docs";
import style from "./Decompose.module.css";

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
    return <div>Decomposing...</div>;
  }

  return (
    <div className={style.flexbox}>
      <div>
        decomposed and projected with onto {components} dimensions {oldVariance}
        % of variance retained
      </div>
      {showForm ? (
        <fetcher.Form method="post" action={`/admin/docs/${id}/decompose`}>
          <label className={style.flexbox} htmlFor="variance">
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
          <div className={style.horizontal}>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowForm(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className={style.danger}>
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
          className={style.danger}
        >
          New Decompose
        </button>
      )}
    </div>
  );
};

export default Decompose;
