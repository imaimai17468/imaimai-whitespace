import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

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

  // 初期状態を0に設定
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 初回レンダリング時にwindowのサイズを設定
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // resizeイベントのハンドラ
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // resizeイベントリスナーを追加
    window.addEventListener("resize", handleResize);

    return () => {
      // cleanup
      window.removeEventListener("resize", handleResize);
    };
  }, []); // 空の依存配列で初回レンダリング時のみ実行

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

      socket.emit("draw", {
        action: "start",
        from: { x, y },
        to: { x, y },
      });

      draw(e);
    };

    const stopDrawing = () => {
      setDrawing(false);
      context.beginPath();

      socket.emit("draw", {
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
      context.beginPath(); // 新しいパスを開始
      context.moveTo(x, y);

      socket.emit("draw", {
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

    socket.on("draw", (data: DrawData) => {
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

  // canvasのwidthとheightにstateを使用
  return (
    <canvas
      ref={canvasRef}
      width={windowSize.width}
      height={windowSize.height}
    />
  );
}
