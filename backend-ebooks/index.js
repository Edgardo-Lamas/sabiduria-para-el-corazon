import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const PORT = process.env.PORT || 3001;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error("Faltan variables de entorno NOTION_TOKEN o NOTION_DATABASE_ID");
  process.exit(1);
}

app.get("/api/ebooks", async (req, res) => {
  try {
    const notionRes = await axios.post(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {},
      {
        headers: {
          "Authorization": `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ results: notionRes.data.results });
  } catch (err) {
    console.error("Error consultando Notion:", err?.response?.data || err.message);
    res.status(500).json({ error: "Error consultando Notion" });
  }
});

app.get("/", (req, res) => {
  res.send("API de eBooks para Sabiduría para el Corazón");
});

app.listen(PORT, () => {
  console.log(`Servidor backend eBooks escuchando en puerto ${PORT}`);
});
