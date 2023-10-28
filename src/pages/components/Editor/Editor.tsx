"use client"; // this registers <Editor> as a Client Component
import { getRandomUser } from "@/utils/randomUser";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/style.css";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import * as Y from "yjs";
const doc = new Y.Doc();

const { WebsocketProvider } = require("y-websocket");
const provider = new WebsocketProvider("ws://localhost:1234", "draw-room", doc);

export default function Editor() {
  const editor: BlockNoteEditor = useBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: getRandomUser(),
    },
  });

  return <BlockNoteView editor={editor} />;
}
