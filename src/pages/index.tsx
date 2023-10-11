import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const ydoc = new Y.Doc();
const yMap = ydoc.getMap("drawMap");

const provider = new WebsocketProvider(
  "ws://localhost:1234",
  "draw-room",
  ydoc
);

type DrawAction = "start" | "draw" | "end";

type DrawData = {
  action: DrawAction;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const startDrawing = (e: MouseEvent) => {
      setDrawing(true);

      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;

      context.moveTo(x, y);
      setLastPosition({ x, y });

      yMap.set("draw", {
        action: "start",
        from: { x, y },
        to: { x, y },
      });

      draw(e);
    };

    const stopDrawing = () => {
      setDrawing(false);
      context.beginPath();

      yMap.set("draw", {
        action: "end",
        from: { x: lastPosition.x, y: lastPosition.y },
        to: { x: lastPosition.x, y: lastPosition.y },
      });
    };

    const draw = (e: MouseEvent) => {
      if (!drawing) return;

      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;

      context.lineWidth = 5;
      context.lineCap = "round";
      context.strokeStyle = "black";

      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);

      yMap.set("draw", {
        action: "draw",
        from: { x: lastPosition.x, y: lastPosition.y },
        to: { x, y },
      });

      setLastPosition({ x, y });
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mousemove", draw);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mousemove", draw);
    };
  }, [drawing, lastPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    yMap.observe((event) => {
      const data = event.target.get("draw") as DrawData;

      context.lineWidth = 5;
      context.lineCap = "round";
      context.strokeStyle = "black";

      if (data.action === "start" || data.action === "draw") {
        context.beginPath();
        context.moveTo(data.from.x, data.from.y);
        context.lineTo(data.to.x, data.to.y);
        context.stroke();
      }
      if (data.action === "end") {
        context.beginPath();
      }
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={windowSize.width}
      height={windowSize.height}
    />
  );
}
