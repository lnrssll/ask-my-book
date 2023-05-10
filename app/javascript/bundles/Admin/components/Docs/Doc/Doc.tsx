import React, { useEffect } from "react";
import {
  Link,
  redirect,
  useFetcher,
  useFetchers,
  useLoaderData,
} from "react-router-dom";
import type { LoaderFunction, ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import moment from "moment";

import style from "./Doc.module.css";
import type { DocType } from "../Docs";
import type { QuestionsType } from "./Questions";
import { Chunk } from "./Chunk";
import { Embed } from "./Embed";
import { Decompose } from "./Decompose";
import { Build } from "./Build";

export const docLoader: LoaderFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "GET",
  });
  if (res.ok) {
    return res;
  }
  alert("Failed to load doc");
  return res;
};

export const docAction: ActionFunction = async ({ request, params }) => {
  const method = request.method;
  const id = params.id;
  const url = `/api/v1/docs/${id}`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method,
  });
  if (res.ok) {
    return redirect("/admin/docs");
  }
};

const DocView = () => {
  const {
    id,
    title,
    description,
    author,
    ready,
    created_at,
    chunkCount,
    embedded,
    components,
    trees,
  } = useLoaderData() as DocType & QuestionsType;
  const [progress, setProgress] = React.useState(0);
  const fetcher = useFetcher();
  const fetchers = useFetchers();

  useEffect(() => {
    const chunkFetcher = fetchers.find(
      (f) => f.formAction === `/admin/docs/${id}/chunk`
    );
    const embedFetcher = fetchers.find(
      (f) => f.formAction === `/admin/docs/${id}/embed`
    );
    const decomposeFetcher = fetchers.find(
      (f) => f.formAction === `/admin/docs/${id}/decompose`
    );
    const buildFetcher = fetchers.find(
      (f) => f.formAction === `/admin/docs/${id}/build`
    );
    if (chunkFetcher) {
      setProgress(0);
    } else if (embedFetcher) {
      setProgress(1);
    } else if (decomposeFetcher) {
      setProgress(2);
    } else if (buildFetcher) {
      setProgress(3);
    } else {
      setProgress(4);
    }
  }, [fetchers]);

  return (
    <div className="flexbox">
      <div>
        <h1>{title}</h1>
        <div className="horizontal">
          {author && <h3>By {author}</h3>}
          <div>Uploaded {moment(created_at).fromNow()}</div>
        </div>
      </div>
      {description && <div className="subtle">{description}</div>}
      {trees && progress > 3 ? (
        <div>
          <div className="horizontal">
            <Link to={`/admin/docs/${id}/questions`}>
              <button>Questions</button>
            </Link>
            {!!trees && (
              <Link to="search">
                <button>Test</button>
              </Link>
            )}
            {!ready ? (
              <fetcher.Form method="patch">
                <button type="submit" className="success">
                  Go Live
                </button>
              </fetcher.Form>
            ) : (
              <button className="success ping" disabled>
                Live
              </button>
            )}
            <fetcher.Form method="delete">
              <button type="submit" className={style.danger}>
                Delete
              </button>
            </fetcher.Form>
          </div>
        </div>
      ) : (
        <div className="centered inconsolata">
          Processing your document... This may take a few minutes!
        </div>
      )}
      <div className={style.container}>
        <Chunk />
        {chunkCount > 0 && <Embed />}
        {embedded && <Decompose />}
        {!!components && <Build />}
        <div className={style.progcontainer}>
          <div className={style.progressbar}>
            {progress > 0 && chunkCount > 0 && (
              <div className={style.progress1} />
            )}
            {progress > 1 && embedded && <div className={style.progress2} />}
            {progress > 2 && !!components && (
              <div className={style.progress3} />
            )}
            {progress > 3 && !!trees && <div className={style.progress4} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocView;
