<script lang="ts">
import WaterMark from "./index";

const waterMarkInstance = new WaterMark({
  content: "测试水印",
  width: 100,
  height: 100,
  font: "20",
});

export default {
  setup() {
    return {
      waterMarkInstance,
    };
  },
};
</script>

<template>
  <button @click="waterMarkInstance.remove">移除水印</button>
  <button @click="waterMarkInstance.create">添加水印</button>
</template>

<style>
* {
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  justify-content: center;
  align-items: center;
}
html,
body {
  padding: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
}
canvas {
  border: 1px solid #f2f2f2;
}
</style>
