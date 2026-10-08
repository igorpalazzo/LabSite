import { Link } from "react-router-dom";

export default function CmsLocalOnlyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-6">
      <section className="w-full max-w-2xl border border-gray-200 bg-white p-9 text-center shadow-xl md:p-14">
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#101b3d] text-2xl font-black text-white">L</div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[#b6202a]">LIRA / Administração</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#101b3d] md:text-5xl">
          CMS disponível somente localmente
        </h1>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-gray-600">
          Para criar ou editar notícias, clone o repositório e execute o frontend e o FastAPI em sua máquina. As matérias publicadas são enviadas ao site por commit e Pull Request.
        </p>
        <Link to="/" className="mt-9 inline-flex bg-[#b6202a] px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#971922]">
          Voltar ao site
        </Link>
      </section>
    </main>
  );
}

