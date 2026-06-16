import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' })); // support larger OCR payloads

const PORT = 3000;

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized successfully with backend key.");
  } else {
    console.warn("GEMINI_API_KEY is not configured or contains placeholder. AI Features will fall back to smart local simulations.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

// Endpoint 1: Gemini Insights
app.post("/api/gemini/insights", async (req, res) => {
  try {
    const { transactions, goals, budgets } = req.body;
    
    if (!ai) {
      // Smart simulation in Portuguese if key isn't provided, to keep development highly interactive
      const categorySum: { [key: string]: number } = {};
      transactions.forEach((t: any) => {
        if (t.type === "expense") {
          categorySum[t.category] = (categorySum[t.category] || 0) + Number(t.amount);
        }
      });

      const highestExpenses = Object.entries(categorySum)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);

      const topCategory = highestExpenses[0]?.[0] || "Alimentação";
      const topCategoryAmount = highestExpenses[0]?.[1] || 1500;

      const mockInsights = [
        {
          title: `Gastos elevados em ${topCategory}`,
          description: `Identificamos que você direcionou cerca de R$ ${topCategoryAmount.toFixed(2)} para ${topCategory} este mês. Reduzir em apenas 10% nessa categoria liberaria mais recursos para suas caixinhas de poupança.`,
          impact: "Alto",
          savingAmountEstimated: `R$ ${(topCategoryAmount * 0.1).toFixed(2)}/mês`
        },
        {
          title: "Potencializador de Investimentos",
          description: "Sua sobra atual está mantida integralmente na poupança. Simule migrar parte dela para um CDB 110% do CDI – isso renderia cerca de 34% a mais no ano sem alterar seu perfil de risco.",
          impact: "Médio",
          savingAmountEstimated: "R$ 45.40/mês"
        },
        {
          title: "Análise de Despesas Recorrentes",
          description: "Você tem mais de 3 assinaturas de lazer ativas. Considere fazer um rodízio entre serviços de streaming para economizar sem perder o entretenimento doméstico.",
          impact: "Baixo",
          savingAmountEstimated: "R$ 39.90/mês"
        }
      ];

      return res.json({
        insights: mockInsights,
        overallAnalysis: "Excelente controle geral! Os indicadores rápidos mostram fluxo de caixa saudável, porém há espaço para readequação de despesas supérfluas e aceleração de objetivos de longo prazo."
      });
    }

    const prompt = `Analise as seguintes finanças pessoais de forma detalhada e amigável.
    
    Transações Recentes:
    ${JSON.stringify(transactions, null, 2)}
    
    Metas de Poupança (Savings Goals):
    ${JSON.stringify(goals, null, 2)}
    
    Orçamentos Definidos por Categoria:
    ${JSON.stringify(budgets, null, 2)}
    
    Por favor, forneça exatamente 3 insights financeiros acionáveis em Português do Brasil.
    Cada insight deve ser focado em:
    1. Uma análise inteligente dos gastos por categoria ou despesas recorrentes (ex: onde cortar gastos baseado em desvios).
    2. Como acelerar o atingimento das metas informadas de poupança/investimento.
    3. Uma sugestão ou dica comportamental financeira baseada nas finanças informadas.
    
    Retorne a resposta no seguinte formato JSON estrito:
    {
      "insights": [
        {
          "title": "Título curto e chamativo do insight",
          "description": "Texto descritivo com conselhos de finanças ou análise",
          "impact": "Alto" | "Médio" | "Baixo",
          "savingAmountEstimated": "R$ X/mês" ou "N/A"
        },
        ...
      ],
      "overallAnalysis": "Uma breve análise geral de 2 a 3 frases sobre a saúde financeira consolidada do usuário."
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             insights: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                   title: { type: Type.STRING },
                   description: { type: Type.STRING },
                   impact: { type: Type.STRING },
                   savingAmountEstimated: { type: Type.STRING }
                 },
                 required: ["title", "description", "impact", "savingAmountEstimated"]
               }
             },
             overallAnalysis: { type: Type.STRING }
          },
          required: ["insights", "overallAnalysis"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Insight Error:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao gerar insights." });
  }
});

// Endpoint 2: Receipt OCR simulation or analysis
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    const { imageText, mimeType, base64Image } = req.body;
    
    if (!ai) {
      // If we don't have Gemini configured, parse mock outcomes realistically based on inputs
      const query = (imageText || "").toLowerCase();
      let est = "Restaurante Sabor Natural";
      let val = 78.50;
      let cat = "Lazer";
      let sub = "Restaurantes";
      let list = [{ name: "Almoço Executivo Grelhado", qty: 1, price: 54.00 }, { name: "Suco Natural Maracujá", qty: 2, price: 16.00 }, { name: "Taxa de Serviço 10%", qty: 1, price: 8.50 }];

      if (query.includes("mercado") || query.includes("carrefour") || query.includes("pão de") || query.includes("compras")) {
        est = "Supermercado Pão de Açúcar";
        val = 145.90;
        cat = "Moradia";
        sub = "Supermercado";
        list = [
          { name: "Arroz Integral Camil 1kg", qty: 2, price: 17.80 },
          { name: "Azeite Virgem Especial", qty: 1, price: 45.90 },
          { name: "Cereal de Chocolate Nescau", qty: 3, price: 42.00 },
          { name: "Queijo Minas Padrão", qty: 1, price: 40.20 }
        ];
      } else if (query.includes("posto") || query.includes("combustivel") || query.includes("gasolina") || query.includes("shell")) {
        est = "Auto Posto Shell Ipiranga";
        val = 180.00;
        cat = "Transporte";
        sub = "Combustível";
        list = [{ name: "Gasolina Aditivada (Litros)", qty: 30, price: 180.00 }];
      } else if (query.includes("uber") || query.includes("corrida")) {
        est = "Uber do Brasil Tecnologia";
        val = 32.40;
        cat = "Transporte";
        sub = "Uber/Aplicativos";
        list = [{ name: "Corrida Viagem Urbana Central", qty: 1, price: 32.40 }];
      }

      return res.json({
        success: true,
        data: {
          establishment: est,
          date: new Date().toISOString().split('T')[0],
          amount: val,
          category: cat,
          subCategory: sub,
          items: list,
          isMock: true
        }
      });
    }

    let contents: any[] = [];
    let prompt = `Analise o texto abaixo ou a imagem da nota fiscal/cupom fiscal enviada. 
    Identifique o nome do estabelecimento emitente ("establishment"), a data ("date"), o valor total gasto ("amount"), a categoria primária ("category") mais adequada, a subcategoria ("subCategory"), e faça o mapeamento dos itens individuais ("items"). 
    Atribua obrigatoriamente a uma das seguintes categorias padrão: "Alimentação", "Moradia", "Transporte", "Lazer", "Saúde", "Educação", "Compras", "Outros".
    Retorne EXCLUSIVAMENTE um objeto JSON no seguinte formato estruturado:
    {
      "establishment": "Nome Fantasia Oficial",
      "date": "AAAA-MM-DD" (ou se não identificado, use a data atual 2026-06-03),
      "amount": 123.45 (number),
      "category": "Alimentação" / "Moradia" / "Transporte" / "Lazer" / "Saúde" / "Educação" / "Compras" / "Outros",
      "subCategory": "Supermercado" / "Uber/Aplicativos" / "Restaurantes" / "Assinatura" etc.,
      "items": [
        { "name": "Nome descritivo amigável", "qty": 1, "price": 123.45 }
      ]
    }`;

    if (base64Image && mimeType) {
      contents = [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        },
        { text: prompt }
      ];
    } else {
      contents = [
        { text: `${prompt}\n\nou texto extraído da Nota Fiscal: ${imageText}` }
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            establishment: { type: Type.STRING },
            date: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            subCategory: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  qty: { type: Type.NUMBER },
                  price: { type: Type.NUMBER }
                },
                required: ["name", "qty", "price"]
              }
            }
          },
          required: ["establishment", "date", "amount", "category", "subCategory", "items"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json({
      success: true,
      data: JSON.parse(resultText)
    });
  } catch (error: any) {
    console.error("OCR Scan backend fail:", error);
    res.status(500).json({ success: false, error: error.message || "Erro no processamento OCR." });
  }
});

// Start listening or connect to Vite compilation middleware
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully working on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Crash during start:", err);
});
