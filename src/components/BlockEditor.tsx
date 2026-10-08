import { api } from "../lib/api";
import type { BlockType, ContentBlock } from "../types";

const labels: Record<BlockType, string> = { paragraph: "Parágrafo", heading: "Título", image: "Imagem", quote: "Citação", list: "Lista" };

function createBlock(type: BlockType): ContentBlock {
  if (type === "heading") return { id: crypto.randomUUID(), type, data: { text: "", level: 2 } };
  if (type === "list") return { id: crypto.randomUUID(), type, data: { items: [""] } };
  if (type === "image") return { id: crypto.randomUUID(), type, data: { url: "", caption: "", credit: "" } };
  return { id: crypto.randomUUID(), type, data: { text: "" } };
}

export default function BlockEditor({ value, onChange }: { value: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void }) {
  const update = (id: string, patch: ContentBlock["data"]) => onChange(value.map((block) => block.id === id ? { ...block, data: { ...block.data, ...patch } } : block));
  const remove = (id: string) => onChange(value.filter((block) => block.id !== id));
  const move = (index: number, delta: number) => { const target = index + delta; if (target < 0 || target >= value.length) return; const next = [...value]; [next[index], next[target]] = [next[target], next[index]]; onChange(next); };

  async function upload(block: ContentBlock, file?: File) {
    if (!file) return;
    const result = await api.upload(file);
    update(block.id, { url: result.url });
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 px-6 py-14 text-center text-gray-500"><strong className="block text-[#101b3d]">Comece a escrever a matéria</strong><span className="mt-2 block text-sm">Adicione parágrafos, títulos, imagens, citações ou listas.</span></div>}
      {value.map((block, index) => (
        <div key={block.id} className="grid grid-cols-[45px_1fr_40px] gap-3 rounded-xl border border-gray-200 bg-white p-3 focus-within:border-blue-400">
          <div className="flex flex-col items-center gap-1 text-xs text-gray-400"><span className="font-bold">{index + 1}</span><button type="button" onClick={() => move(index, -1)} className="h-6 w-7 bg-gray-100 hover:bg-gray-200">↑</button><button type="button" onClick={() => move(index, 1)} className="h-6 w-7 bg-gray-100 hover:bg-gray-200">↓</button></div>
          <div className="space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#b6202a]">{labels[block.type]}</span>
            {block.type === "paragraph" && <textarea rows={4} value={String(block.data.text ?? "")} onChange={(event) => update(block.id, { text: event.target.value })} placeholder="Escreva um parágrafo…" className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-blue-500" />}
            {block.type === "heading" && <div className="grid gap-2 sm:grid-cols-[80px_1fr]"><select value={Number(block.data.level ?? 2)} onChange={(event) => update(block.id, { level: Number(event.target.value) })} className="rounded-lg border border-gray-200 p-3"><option value={2}>H2</option><option value={3}>H3</option></select><input value={String(block.data.text ?? "")} onChange={(event) => update(block.id, { text: event.target.value })} placeholder="Título da seção" className="rounded-lg border border-gray-200 p-3 text-xl font-bold outline-none focus:border-blue-500" /></div>}
            {block.type === "quote" && <><textarea rows={3} value={String(block.data.text ?? "")} onChange={(event) => update(block.id, { text: event.target.value })} placeholder="Texto da citação" className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-blue-500" /><input value={String(block.data.author ?? "")} onChange={(event) => update(block.id, { author: event.target.value })} placeholder="Autor da citação" className="w-full rounded-lg border border-gray-200 p-3" /></>}
            {block.type === "list" && <textarea rows={5} value={Array.isArray(block.data.items) ? block.data.items.join("\n") : ""} onChange={(event) => update(block.id, { items: event.target.value.split("\n") })} placeholder="Um item por linha" className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-blue-500" />}
            {block.type === "image" && <div className="space-y-2">{block.data.url ? <img src={String(block.data.url)} alt="Prévia" className="max-h-80 w-full rounded-lg object-cover" /> : <label className="flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-gray-300 px-5 py-10 text-sm font-semibold text-blue-600">Escolher imagem<input type="file" accept="image/*" onChange={(event) => upload(block, event.target.files?.[0])} className="hidden" /></label>}<input value={String(block.data.caption ?? "")} onChange={(event) => update(block.id, { caption: event.target.value })} placeholder="Legenda" className="w-full rounded-lg border border-gray-200 p-3" /><input value={String(block.data.credit ?? "")} onChange={(event) => update(block.id, { credit: event.target.value })} placeholder="Crédito da imagem" className="w-full rounded-lg border border-gray-200 p-3" /></div>}
          </div>
          <button type="button" onClick={() => remove(block.id)} title="Remover bloco" className="h-9 text-xl text-gray-300 hover:text-red-600">×</button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4"><span className="mr-2 text-xs font-bold uppercase tracking-wider text-gray-500">Adicionar</span>{(["paragraph", "heading", "image", "quote", "list"] as BlockType[]).map((type) => <button key={type} type="button" onClick={() => onChange([...value, createBlock(type)])} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#101b3d]">+ {labels[type]}</button>)}</div>
    </div>
  );
}

