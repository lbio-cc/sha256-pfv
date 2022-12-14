<template>
	<div class="home">
		<h1>Sha256Pfv 工具</h1>

		<div class="mode-selector">
			<a-radio-group v-model:value="mode" button-style="solid">
				<a-radio-button v-for="(label,value) in modeMap" :value="value">{{ label }}哈希</a-radio-button>
			</a-radio-group>
		</div>

		<div class="mode-executor">
			<a-form :model="formState" layout="vertical" :wrapper-col="{ span: 24 }" @finish="onFinish" @finishFailed="onFinishFailed">
				<a-form-item label="文件" v-show="fileSource === FileSource.LOCAL" name="filePath" :rules="[{ required: fileSource === FileSource.LOCAL, message: '请选择文件' }]">
					<!--<a-form-item-rest>
					<a-radio-group v-model:value="fileSource" button-style="solid">
						<a-radio-button :value="FileSource.LOCAL">本地上传</a-radio-button>
						<a-radio-button :value="FileSource.REMOTE">远程URL</a-radio-button>
					</a-radio-group>
					</a-form-item-rest>-->
					<a-input-search
						:value="formState.filePath"
						placeholder="本地上传文件"
						@search="selectFile"
					>
						<template #enterButton>
							<a-button type="primary"><icon-file-outlined/>选择文件</a-button>
						</template>
					</a-input-search>
				</a-form-item>
				<a-form-item label="文件" v-show="fileSource === FileSource.REMOTE" name="url" :rules="[{ required: fileSource === FileSource.REMOTE, message: '请输入远程URL' }]">
					<!--<a-form-item-rest>
					<a-radio-group v-model:value="fileSource" button-style="solid">
						<a-radio-button :value="FileSource.LOCAL">本地上传</a-radio-button>
						<a-radio-button :value="FileSource.REMOTE">远程URL</a-radio-button>
					</a-radio-group>
					</a-form-item-rest>-->
					<a-input type="url" v-model:value="formState.url" placeholder="远程url"></a-input>
				</a-form-item>

				<a-form-item v-show="mode === Mode.VERIFY" @change="loadHashInfo" label="Sha256Pfv 哈希" name="hash" :rules="[{ required:mode === Mode.VERIFY, asyncValidator:validateHash }]">
					<a-input v-model:value="formState.hash"/>
				</a-form-item>
				
				<a-form-item v-show="mode === Mode.COMPUTE" label="最大哈希长度" name="maxCompleteHashLength" :rules="[{ required: mode === Mode.COMPUTE, message: '请输入最大哈希长度' }]">
					<a-input type="number" v-model:value="formState.maxCompleteHashLength"/>
				</a-form-item>

				<a-form-item>
					<a-button type="primary" html-type="submit">开始{{ modeText }}</a-button>
				</a-form-item>
			</a-form>
		</div>

		<a-modal v-model:visible="result.show" closable :title="result.title" :footer="null">
			{{ result.content }}
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import {computed, reactive, ref} from "vue";
import {FileOutlined as IconFileOutlined} from '@ant-design/icons-vue';
import {message} from "ant-design-vue";
import {ValidateErrorEntity} from "ant-design-vue/lib/form/interface";
import {getSha256PfvInfoResult, showOpenDialogProperty} from "./types/electron";

enum Mode {
	COMPUTE="compute",
	VERIFY="verify",
}
enum FileSource {
	LOCAL,
	REMOTE
}

const mode = ref(Mode.VERIFY);
const fileSource = ref(FileSource.LOCAL);

const result = reactive({
	show:false,
	title:'',
	content:'',
})

interface MergedFormData {
	filePath: string|undefined,
	url: string|undefined,
	maxCompleteHashLength: number|undefined,
	hash: string|undefined,
}

const formState = reactive({
	filePath:undefined,
	url:undefined,
	maxCompleteHashLength: undefined,
	hash:undefined,
} as MergedFormData);

const sha256PfvInfoCache:Record<string, Promise<getSha256PfvInfoResult>> = reactive({});

const modeMap = {
	[Mode.VERIFY]: '验证',
	[Mode.COMPUTE]: '生成'
}

const modeText = computed(()=> modeMap[mode.value])



const selectFile = async () =>{
	let selected = await window.showOpenDialog({
		title:'选择文件',
		properties:[
			showOpenDialogProperty.openFile,
		],
	})
	
	if(!selected.canceled){
		formState.filePath = selected.filePaths[0];
	}
}
const onFinish = async (formState: MergedFormData) => {
	try {
		switch (mode.value) {
			case Mode.VERIFY:
				let verifyResult = await window.completeVerifySha256PfvByFile(formState.filePath!,formState.hash!);
				if(verifyResult.valid) {
					result.content = verifyResult.result ? '一致' : '不一致';
				}
				else{
					throw new Error(verifyResult.error);
				}
				break;
			case Mode.COMPUTE:
				let computeResult = await window.computeSha256PfvByFile(formState.filePath!, formState.maxCompleteHashLength!);
				
				console.log(computeResult)
				if (computeResult.valid) {
					result.content = computeResult.result;
				} else {
					throw new Error(computeResult.error);
				}
				break;
		}
		result.title = `${modeText.value}哈希结果`
		result.show = true;
	} catch (e) {
		result.show = false;
		message.error(`${modeText.value}哈希错误:${(e as Error).message}`);
	}
};
const onFinishFailed = (errorInfo: ValidateErrorEntity) => {
	message.error('表单错误:请检查表单内容');
	console.error(errorInfo)
};

const loadHashInfo =(hash:string|undefined) =>{
	if(!hash || !hash.length)return;
	if(!sha256PfvInfoCache[hash]) {
		sha256PfvInfoCache[hash] = window.getSha256PfvInfo(hash);
	}
	return sha256PfvInfoCache[hash];
};

const validateHash = async(rule:any, value: string | undefined)=>{
	if(!value){
		if(rule.required) {
			throw new Error("请输入哈希");
		}
	}
	else {
		const sha256PfvInfo = await loadHashInfo(value);
		if (!sha256PfvInfo?.valid) {
			throw new Error(sha256PfvInfo?.error || "请输入哈希");
		}
	}
	return true;
}

</script>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
</style>
<style lang="scss" scoped>
.home {
	h1 {
		text-align: center;
		font-size: 24px;
		padding: 1em;
	}
}

.mode-selector {
	text-align: center;
}

.mode-executor {
	max-width: 800px;
	margin-left: auto;
	margin-right: auto;
}

.file-uploader {
	:deep(.ant-upload-list.ant-upload-list-text) {
		display: inline-block;
	}
}
</style>