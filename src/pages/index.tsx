import { ApolloExplorer } from "@apollo/explorer/react";
import { generate } from "graphql-auto-query";
import { NextPage } from "next";
import { useCallback, useState } from "react";
import { sampleSchema } from "../schema";

const SchemaDialog = ({
  isOpen,
  onClose,
  onSubmit,
  schema,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schema: string, depth: number) => void;
  schema: string;
}) => {
  return (
    <>
      <style jsx>{`
        .root {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          position: fixed;
          background-color: rgba(0, 0, 0, 0.5);
        }
        .hidden {
          display: none;
        }
        .dialog {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80%;
          height: 80%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }
        .textarea {
          flex: 1;
          padding: 0.5rem;
        }
        .footer {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
      `}</style>
      <div className={isOpen ? undefined : "hidden"}>
        <div className="root" onClick={onClose} />
        <form
          className="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
            const schema = e.currentTarget.schema.value;
            const depth = Number(e.currentTarget.depth.value);
            onSubmit(schema, depth);
          }}
        >
          <textarea className="textarea" name="schema" defaultValue={schema} />
          <div className="footer">
            <label htmlFor="depth">Depth</label>
            <input type="number" name="depth" defaultValue={2} />
          </div>
          <div className="footer">
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const Page: NextPage<{ schema: string }> = () => {
  const [schema, setSchema] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("explorerSchema") || sampleSchema;
    }
  });

  const [isSchemaDialogOpen, setSchemaDialogOpen] = useState(false);

  const handleUpdate = (schema: string, depth: number) => {
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.isConnected;
      try {
        const operation = generate(schema, depth);
        iframe?.contentWindow?.postMessage(
          {
            name: "SetOperation",
            variables: "",
            operation,
          },
          "https://explorer.embed.apollographql.com"
        );
        setSchema(schema);
        localStorage.setItem("explorerSchema", schema);
      } catch (e) {
        alert(e);
      }
    }
  };
  const handleRequest: Parameters<typeof ApolloExplorer>["0"]["handleRequest"] =
    useCallback(
      (url, option) => fetch(url, { ...option, credentials: "same-origin" }),
      []
    );
  return (
    <>
      <style global>{`
        html,
        body {
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .explorer {
          flex: 1;
        }
      `}</style>
      <style jsx>{`
        .root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
        }
        .header {
          padding: 1rem;
        }
      `}</style>
      <div className="root">
        <div className="header">
          <button onClick={() => setSchemaDialogOpen(true)}>
            Input GraphQL Schema
          </button>
        </div>
        <ApolloExplorer
          className="explorer"
          schema={schema}
          endpointUrl="/graphql"
          persistExplorerState={true}
          handleRequest={handleRequest}
        />
      </div>

      <SchemaDialog
        schema={schema}
        isOpen={isSchemaDialogOpen}
        onClose={() => setSchemaDialogOpen(false)}
        onSubmit={handleUpdate}
      />
    </>
  );
};

export default Page;
