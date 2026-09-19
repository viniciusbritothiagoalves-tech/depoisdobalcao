# Depois do Balcão | Landing Page de Rótulos Personalizados

Landing page de alta conversão para a marca **Depois do Balcão**, especializada em rótulos e adesivos personalizados para pequenas e médias empresas (produtos alimentícios, congelados, docerias, açougues, delivery e produtos artesanais).

---

## 🚀 Como Publicar no GitHub e Conectar na Vercel

### Passo 1: Enviar o projeto ao GitHub
No terminal da pasta do projeto, execute os comandos:

```bash
git init
git add .
git commit -m "feat: landing page depois do balcao pronta para producao"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

*(Substitua `https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git` pela URL do seu repositório criado no GitHub).*

---

### Passo 2: Conectar na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique no botão **"Add New..."** > **"Project"**.
3. Selecione o repositório que você acabou de subir.
4. Em **Framework Preset**, deixe selecionado **Other** (projeto estático HTML/CSS/JS).
5. Clique em **Deploy**.
6. Em menos de 30 segundos, sua landing page estará no ar com HTTPS gratuito e CDN global!

---

## ⚙️ Configurações Centrais (`js/config.js`)

Todas as principais configurações comerciais e de integração estão centralizadas no arquivo [`js/config.js`](js/config.js):

- **Número oficial de WhatsApp**: `5538998636150` (+55 38 99863-6150).
- **Validação Anti-Burla de Telefone**: Exige estritamente o formato `(99) 99999-9999` com DDDs válidos de estados do Brasil (incluindo DDDs 51, 53, 54, 55 do RS), nono dígito obrigatório `9` e bloqueio de sequências falsas repetidas.
- **Webhook de Leads (Opcional)**: Envie automaticamente os dados do formulário para o Google Planilhas, CRM, Zapier, Make ou n8n preenchendo a variável `LEAD_WEBHOOK_URL`.
- **Identificadores de Tráfego**: Suporte nativo para Google Analytics (`GOOGLE_ANALYTICS_ID`) e Meta Pixel (`META_PIXEL_ID`).

---

## 📁 Estrutura de Arquivos

```text
├── .gitignore                      # Arquivos ignorados pelo Git
├── admin.html                      # Painel local/navegador para visualizar leads e exportar CSV
├── assets/                         # Imagens da marca e aplicações de embalagens em alta resolução
│   ├── app-artesanais.jpg
│   ├── app-bandejas.jpg
│   ├── app-caixas.jpg
│   ├── app-delivery.jpg
│   ├── app-potes.jpg
│   ├── app-sacos.jpg
│   ├── hero-packaging.jpg
│   └── logo.png
├── css/
│   └── style.css                   # Folha de estilos moderna, responsiva e performática
├── js/
│   ├── app.js                      # Lógica de UX, validações anti-burla, storage e redirecionamento WhatsApp
│   └── config.js                   # Configurações globais e integrações
├── index.html                      # Landing page principal
├── politica-de-privacidade.html    # Página de conformidade com LGPD
├── vercel.json                     # Configuração de rotas limpas e cabeçalhos para a Vercel
└── README.md                       # Documentação do projeto
```

---

## 📊 Painel de Leads (`/admin` ou `admin.html`)
- Permite que você visualize todas as solicitações de orçamento preenchidas no navegador.
- Filtro por termo de busca em tempo real.
- Botão direto para iniciar conversa no WhatsApp do cliente.
- Botão para exportar todos os leads em formato **CSV (compatível com Excel e Google Sheets)**.
