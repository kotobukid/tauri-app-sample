<script setup lang="ts">
import {type Ref, ref} from "vue";
import {useApply, useDataUrlToBlob} from "../composables/render_svg_as_png"
import {invoke} from "@tauri-apps/api/tauri";

type Point2D = {
    x: number,
    y: number
};

const points = ref<Point2D[]>([]);


const append_circle = (e: MouseEvent) => {
    points.value = [...points.value, {x: e.offsetX, y: e.offsetY}];
}

const svg_edit: Ref<SVGSVGElement | null> = ref(null);
const save_image = async () => {
    useApply(svg_edit, "circle {fill: red;}", async (dataUrl: string) => {
        const blob: Blob = useDataUrlToBlob(dataUrl);
        const arrayBuffer = await blob.arrayBuffer(); // BlobをArrayBufferに変換
        const uint8Array = new Uint8Array(arrayBuffer); // ArrayBufferをUint8Arrayに変換
        await invoke("save_blob", {args: Array.from(uint8Array)});
    });
}
</script>

<template lang="pug">
a.save(href="#" @click.prevent="save_image") Save image
br
svg(width="800" ref="svg_edit" height="480" viewBox="0 0 800 480" @click="append_circle")
    circle(:cx="p.x" :cy="p.y" r="50" fill="red" v-for="p in points")

</template>

<style scoped lang="less">
svg {
    outline: 1px solid grey;
    user-select: none;
    -webkit-user-drag: none;
}
</style>