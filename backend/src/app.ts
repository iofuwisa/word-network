import 'dotenv/config'

import express from "express"

import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";

const genLod = async (topic: string) => {
  const systemPrompt =
    "あなたは与えられた単語と他の単語の関係を説明するシステムです\n" +
    "フォーマット:\n" +
    "主語,関係,目的語\n" +
    "\n" +
    "ルール:\n" +
    "主語:単語または、与えられた単語 説明文における主語\n" +
    "目的語:単語、与えられた単語 説明文における目的語\n" +
    "関係:動詞または、主語の被修飾名詞または、目的語にかかる形容詞または、目的語の修飾名詞" +
    "\n" +
    "「リンゴ」が与えられた単語の時の例:" +
    "リンゴ,一部,果物\n" +
    "人間,食べる,リンゴ\n" +
    "ジョナゴールド,品種,リンゴ\n" +
    "リンゴ,色,赤\n" +
    "ニュートン,見る,リンゴ\n" +
    "ニュートン,発見する,万有引力\n" +
    "りんご,重さ,35~1000グラム\n" +
    "りんご,浮く,水\n" +
    ""

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{topic}"],
  ]);

  const model = new ChatOpenAI({});
  const outputParser = new StringOutputParser();

  const chain = prompt.pipe(model).pipe(outputParser);

  const response = await chain.invoke({
    topic,
  });

  return response
}

const app = express();
app.use(express.json());

const port = process.env.PORT

app.get('/healthcheck', (req, res) => {
  res.send('OK');
})

/*
  RequestBody: {topic:'検索するワード'}
  ResponseBody: {"content":"単語,関連名,単語\n単語,関連名,単語\n単語,関連名,単語"}
*/
app.post('/', async (req, res) => {
  console.log("post-head", req.headers)
  console.log("post-body", req.body)
  const topic = req.body.topic as string
  const lod = await genLod(topic)
  console.log(JSON.stringify({ content: lod }))
  res.send(JSON.stringify({ content: lod }))
});

// mock
// app.post('/', async (req, res) => {
//   console.log("post-head", req.headers)
//   console.log("post-body", req.body)
//   const mockResponse = {
//     content: "サンマ,食べる,魚\nカレイ,同じくらいの大きさ,サンマ\nサンマ,美味しい,焼き魚\nサンマ,季節,秋\nサンマ,主役,料理"
//   }
//   res.send(JSON.stringify(mockResponse))
// });

app.listen(port, () => console.log(`Example app listening on port ${port}!`));