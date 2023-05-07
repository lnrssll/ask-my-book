import React, { useState } from "react";
import type { FC } from "react";
import { Document as PDFDocument, Page } from "react-pdf";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

import style from "./Preview.module.css";

interface PreviewProps {
  file: File;
  page: number;
  setPage: (page: number) => void;
  setStart: (start: number) => void;
  setEnd: (end: number) => void;
}

const Preview: FC<PreviewProps> = ({
  file,
  page,
  setPage,
  setStart,
  setEnd,
}) => {
  const [pageCount, setPageCount] = useState(0);
  return (
    <div className={style.flexbox}>
      <div className={style.pdf}>
        {page > 1 && (
          <div className={style.left}>
            <button
              onClick={(e) => {
                e.preventDefault();
                setPage(1);
              }}
            >
              start
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setPage(page - 1);
              }}
            >
              prev
            </button>
            {page > 10 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page - 10);
                }}
              >
                prev 10
              </button>
            )}
          </div>
        )}
        <PDFDocument
          onLoadSuccess={(doc) => {
            setPageCount(doc.numPages);
            setEnd(doc.numPages);
          }}
          file={file}
        >
          <Page
            renderAnnotationLayer={false}
            renderTextLayer={false}
            height={300}
            pageNumber={page}
          />
        </PDFDocument>
        {page < pageCount && (
          <div className={style.right}>
            <button
              onClick={(e) => {
                e.preventDefault();
                setPage(pageCount);
              }}
            >
              end
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setPage(page + 1);
              }}
            >
              next
            </button>
            {page < pageCount - 10 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 10);
                }}
              >
                next 10
              </button>
            )}
          </div>
        )}
      </div>
      <div className={style.flexbox}>Page {page}</div>
      <div className={style.horizontal}>
        <button
          onClick={(e) => {
            e.preventDefault();
            setStart(page);
          }}
        >
          Set Start
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setEnd(page);
          }}
        >
          Set End
        </button>
      </div>
    </div>
  );
};

export default Preview;
