import type { ContentBlock } from "../types";

export default function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="mt-12 space-y-7 text-lg leading-8 text-gray-700">
      {blocks.map((block) => {
        if (block.type === "heading") {
          return Number(block.data.level) === 3 ? (
            <h3 key={block.id} className="pt-5 text-2xl font-black tracking-tight text-[#101b3d]">
              {String(block.data.text ?? "")}
            </h3>
          ) : (
            <h2 key={block.id} className="pt-7 text-3xl font-black tracking-tight text-[#101b3d]">
              {String(block.data.text ?? "")}
            </h2>
          );
        }
        if (block.type === "quote") {
          return (
            <figure key={block.id} className="my-10 border-l-4 border-[#b6202a] bg-gray-50 px-7 py-6">
              <blockquote className="text-2xl font-medium italic leading-relaxed text-[#101b3d]">
                “{String(block.data.text ?? "")}”
              </blockquote>
              {block.data.author && <figcaption className="mt-4 text-sm font-semibold text-gray-500">— {String(block.data.author)}</figcaption>}
            </figure>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={block.id} className="my-10">
              <img src={String(block.data.url ?? "")} alt={String(block.data.alt ?? block.data.caption ?? "")} className="w-full rounded-2xl" />
              {(block.data.caption || block.data.credit) && (
                <figcaption className="mt-3 text-sm text-gray-500">
                  {String(block.data.caption ?? "")}
                  {block.data.credit && <strong> Foto: {String(block.data.credit)}</strong>}
                </figcaption>
              )}
            </figure>
          );
        }
        if (block.type === "list") {
          const items = Array.isArray(block.data.items) ? block.data.items : [];
          return <ul key={block.id} className="list-disc space-y-2 pl-7">{items.map((item, index) => <li key={`${block.id}-${index}`}>{item}</li>)}</ul>;
        }
        return <p key={block.id}>{String(block.data.text ?? "")}</p>;
      })}
    </div>
  );
}

