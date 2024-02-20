export interface RelationRecord {
  from: string
  relation: string
  to: string
}

const apiResponse2RelationList = (content: string): Array<RelationRecord> => {
  const relationList: Array<RelationRecord> = []
  content.split(/\r\n|\r|\n/).forEach((csvRecord) => {
    // セル取り出し
    const csvCellList = csvRecord.split(",");

    // 空チェック
    if (csvCellList.length !== 3 || !csvCellList[0] || !csvCellList[1] || !csvCellList[2]) {
      return
    }

    // 追加
    relationList.push(
      {
        from: csvCellList[0],
        relation: csvCellList[1],
        to: csvCellList[2],
      }
    )
  })

  return relationList
}

class PredictionSession {
  relationList: Array<RelationRecord>

  constructor() {
    this.relationList = reactive<Array<RelationRecord>>([])
  }

  flush() {
    this.relationList.length = 0
  }

  async predict(topic: string): Promise<RelationRecord[]> {
    const predictApiUrl = "/api/"
    const res = await useFetch(predictApiUrl, {
      method: "POST",
      body: { topic },
    });

    if (!res.data?.value || typeof res.data?.value !== "string") {
      throw new Error("api error")
    }

    const content = JSON.parse(res.data.value).content;
    if (!content || typeof content !== "string") {
      throw new Error("value error")
    }

    const newRelationList = apiResponse2RelationList(content)

    this.relationList.push(...newRelationList)

    return newRelationList
  }
}

export function usePredictSession() {
  const predictionSession = new PredictionSession()
  return predictionSession
}