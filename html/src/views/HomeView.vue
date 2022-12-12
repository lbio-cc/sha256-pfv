<template>
	<div class="home">
		<h1>Sha256Pfv 工具</h1>
		
		<div class="mode-selector">
			<a-radio-group v-model:value="mode" button-style="solid">
				<a-radio-button :value="Mode.VERIFY">验证哈希</a-radio-button>
				<a-radio-button :value="Mode.COMPUTE">计算哈希</a-radio-button>
			</a-radio-group>
		</div>
		
		<div class="mode-executor">
			<a-upload class="file-uploader" ref="fileUploader" :max-count="1" v-model:file-list="files" :custom-request="localUploadFile" >
				<a-button>
					<icon-file-outlined />选择文件
				</a-button>
			</a-upload>
			<template v-if="file">
				<produce-sha256-pfv v-if="mode === Mode.COMPUTE" />
				<verify-sha256-pfv v-else-if="mode === Mode.VERIFY" />
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {computed, provide, ref} from "vue";
import ProduceSha256Pfv from "@/components/ProduceSha256Pfv.vue";
import VerifySha256Pfv from "@/components/VerifySha256Pfv.vue";
import {UploadRequestOption} from "ant-design-vue/lib/vc-upload/interface";
import {FileOutlined as IconFileOutlined} from '@ant-design/icons-vue';

enum Mode {
	COMPUTE,
	VERIFY,
}

const files = ref<File[]>([]);
const mode = ref(Mode.VERIFY);
const fileUploader = ref();
const file = computed(()=> files.value.length > 0?files.value[0]:undefined);
provide('file',file);

const localUploadFile = function (request: UploadRequestOption):void{
	files.value.push(request.file as File);
	if(files.value.length > 1){
		files.value.shift();
	}
	request.onSuccess?.(request.file);
}

</script>

<style lang="scss" scoped>
	.home{
		h1{
			text-align: center;
			font-size: 24px;
			padding: 1em;
		}
	}

	.mode-selector{
		text-align: center;
	}
	.mode-executor{
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}
	.file-uploader{
		:deep(.ant-upload-list.ant-upload-list-text){
			display: inline-block;
		}
	}
</style>