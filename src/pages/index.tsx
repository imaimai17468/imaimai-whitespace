import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./components/Editor"), { ssr: false });

export default function App() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      <div className="w-1/2 border border-gray-300 p-3 h-4/5 rounded-xl bg-white shadow-lg shadow-white overflow-y-scroll">
        <Editor />
      </div>
    </div>
  );
}
