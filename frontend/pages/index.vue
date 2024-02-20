<script setup lang="ts">
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { sleep } from "@/utils/utils"
import type { Node as _Node, Edge as _Edge } from "vis-network";

const VIS_NETWORK_OPTION = 
{
  edges: {
    arrows: {
      to: {
        enabled: true,
        type: "arrow",
      },
    },
  },
};

// ネットワーク上の単語と関連の型
interface Node extends _Node {
  id: string
  type: "topic" | "relation"
}

// ネットワーク上のNode間を結ぶ線の型
interface Edge extends _Edge {
  id: string
  type: "arrow"
}
 

// ネットワーク上の単語と関連
const nodeDataSet: DataSet<Node> = new DataSet([]);

// ネットワーク上のNode間を結ぶ線
const edgeDataSet: DataSet<Edge> = new DataSet([]);

// ネットワーク
let network: Network | undefined = undefined

const predictionSession = usePredictSession()

// ネットワークの初期化
// DOM操作が発生するためonMounted以後に実行
const initNetwork = () => {
  const networkElement = document.getElementById("network");
  if (networkElement) {
    network = new Network(networkElement, {
      nodes: nodeDataSet,
      edges: edgeDataSet,
    }, VIS_NETWORK_OPTION);

    network.on("click", function (params) {
      if (params.nodes.length > 0) {
        onClickNode(params.nodes[0])
      }
    });
  } else {
    console.log("Not found '#network' element")
  }
}

const updateNetwork = async (topic: string) => {
  if (!network) {
    return;
  }

  // Topicの関連情報取得
  const relationRecordList = await predictionSession.predict(topic)

  for (const relationRecord of relationRecordList) {
    nodeDataSet.update({
      id: relationRecord.from,
      label: relationRecord.from,
      shape: "box",
      type: "topic",
      color: "#22C55E",
    })
    await sleep(300)
    edgeDataSet.update({
      id: `from-relation:${relationRecord.from}-${relationRecord.relation}`,
      from: `${relationRecord.from}`,
      to: `${relationRecord.from}-${relationRecord.relation}`,
      type: "arrow",
      color: "#22C55E",
    })
    await sleep(300)
    nodeDataSet.update({
      id: `${relationRecord.from}-${relationRecord.relation}`,
      label: relationRecord.relation,
      shape: "ellipse",
      type: "relation",
      color: {
        border: "#22C55E",
        background: "white",
        highlight: {
          border: "#22C55E",
          background: "white",
        }
      }
    })
    await sleep(300)
    edgeDataSet.update({
      id: `relation-to:${relationRecord.from}-${relationRecord.relation}-${relationRecord.to}`,
      from: `${relationRecord.from}-${relationRecord.relation}`,
      to: `${relationRecord.to}`,
      type: "arrow",
      color: "#22C55E",
    })
    await sleep(300)
    nodeDataSet.update({
      id: relationRecord.to,
      label: relationRecord.to,
      shape: "box",
      type: "topic",
      color: "#22C55E",
    })
    await sleep(300)

  }
}

const predictFormState = reactive({
  topic: "",
});
const isPredicting = ref(false);

onMounted(async () => {
  initNetwork()
});

const onClickNode = (vertexId: string) => {
  const vertex = nodeDataSet.get(vertexId)

  if (!vertex) {
    console.log(`Not found vertex id:${vertexId}`)
  }

  // 単語の時だけ検索窓に追加
  if (vertex?.type === "topic") {
    predictFormState.topic = vertexId

    // 検索窓にフォーカス
    const topicInputElement = document.getElementById("topic")
    topicInputElement?.focus();
  }
}

const onSearch = async () => {
  if (isPredicting.value) return;
  isPredicting.value = true;
  console.log(predictFormState.topic);
  await updateNetwork(predictFormState.topic);
  isPredicting.value = false;
};

const onFlush = async () => {
  edgeDataSet.forEach((edge) => {
    edgeDataSet.remove(edge?.id)
  })
  nodeDataSet.forEach((node) => {
    nodeDataSet.remove(node.id)
  })  
}
</script>

<template>
  <UForm class="searchForm" :state="predictFormState" @submit="onSearch">
    <UInput
      v-model="predictFormState.topic"
      label="topic"
      id="topic"
      class="searchBox"
    />
    <UButton :disabled="isPredicting" type="submit" class="submitSearch">
      <Icon
        v-if="!isPredicting"
        name="simple-line-icons:magnifier"
        color="black"
      />
      <Icon v-if="isPredicting" name="simple-line-icons:refresh" color="black" />
    </UButton>
    <UButton :disabled="isPredicting" class="submitSearch" @click="onFlush">
      <Icon name="simple-line-icons:trash" color="black" />
    </UButton>
  </UForm>
  <div id="network" class="network"></div>
</template>

<style scoped>
.content {
  position: relative;
}
.searchForm {
  z-index: 1;
  display: flex;
  position: absolute;
  padding: 4px;
}
.searchBox {
  margin: 4px;
}
.submitSearch {
  margin: 4px;
}

.network {
  height: 100vh;
}
</style>
