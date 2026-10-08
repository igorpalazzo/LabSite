# LIRA Lab Site + CMS local baseado em Git

Site institucional do LIRA com um CMS que funciona somente na máquina do colaborador. O FastAPI não precisa ser hospedado: ele cria os JSONs e prepara as imagens que serão enviados ao GitHub por commit e Pull Request.

## Como funciona

```text
CMS local
   ↓ Publicar
src/data/blog/<slug>.json
public/news/<slug>/imagens.webp
   ↓ commit + Pull Request
GitHub
   ↓ merge na main
Vercel faz o build e publica
```

O site público lê `src/data/blog/*.json` durante o build. Depois de compilado, ele não consulta o FastAPI nem precisa de banco de dados ou armazenamento em nuvem.

Em produção, qualquer rota `/admin` mostra:

```text
CMS disponível somente localmente
```

## Preparação inicial

```bash
cp .env.example .env
npm install
```

Crie o ambiente do backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

## Usar o CMS

Terminal 1, na raiz:

```bash
npm run dev
```

Terminal 2:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Acessos locais:

- Site: http://localhost:5173
- CMS: http://localhost:5173/admin
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs

Login inicial:

```text
E-mail: admin@liralab.com.br
Senha:  LiraAdmin2026!
```

Altere `ADMIN_PASSWORD` e `JWT_SECRET` no `.env`.

## Publicar uma notícia

Crie uma branch antes de abrir o CMS:

```bash
git checkout -b noticia/nome-da-noticia
```

No painel:

1. crie e salve a notícia;
2. envie para revisão;
3. aprove;
4. clique em **Publicar**.

O botão Publicar não envia nada diretamente à internet. Ele gera:

```text
src/data/blog/nome-da-noticia.json
public/news/nome-da-noticia/<imagens>
```

Confira os arquivos:

```bash
git status
git diff
```

Envie apenas o conteúdo publicado:

```bash
git add src/data/blog public/news
git commit -m "Adiciona notícia: nome da notícia"
git push origin noticia/nome-da-noticia
```

Depois, abra um Pull Request. Quando ele for aprovado e incorporado à `main`, a Vercel executará o build e publicará a matéria.

## Dados que não vão ao GitHub

Estes dados são locais e estão no `.gitignore`:

```text
.env
backend/data/*.json
backend/media/*
```

Eles contêm rascunhos, usuários, revisões e arquivos temporários do CMS.

Ao iniciar o backend em um clone novo, as notícias já publicadas em `src/data/blog/` são importadas automaticamente para o painel local.

## Arquivar uma notícia

Ao arquivar uma notícia pelo CMS, o JSON correspondente é removido de `src/data/blog/`. Faça commit da remoção e abra um Pull Request para retirá-la do site.

## Docker local

```bash
cp .env.example .env
docker compose up --build
```

Os volumes do Docker permitem que o backend escreva diretamente em `src/data/blog/` e `public/news/` no computador hospedeiro.

## Vercel

Não defina `VITE_CMS_LOCAL=true` na Vercel. Sem essa variável, as rotas administrativas exibem apenas a mensagem de disponibilidade local.

O único serviço implantado na Vercel é o frontend estático.

