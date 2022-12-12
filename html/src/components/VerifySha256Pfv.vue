<template>
	<div class="produce">
		<a-form :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" @finish="onFinish" @finishFailed="onFinishFailed">
			<a-form-item label="Sha256Pfv 哈希" name="hash" :rules="[{ required: true, message: '请输入哈希' }]">
				<a-input v-model:value="formState.hash"/>
			</a-form-item>

			<a-form-item :wrapper-col="{ offset: 4, span: 20 }">
				<a-button type="primary" html-type="submit">开始验证</a-button>
			</a-form-item>
		</a-form>
		
		<a-modal v-model:visible="verifyResultShow" closable title="哈希比对结果" :footer="null">
			{{ verifyResult?"一致":"不一致" }}
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import {computed, inject, reactive, ref} from "vue";
	import {ValidateErrorEntity} from "ant-design-vue/es/form/interface";
	import {message, notification} from "ant-design-vue";
	import Sha256Pfv from "@/sdk/Sha256Pfv";
	import Sha256PfvException from "@/sdk/Sha256PfvException";
	import {ComputedRef} from "@vue/reactivity";
	
	const file = inject('file') as ComputedRef<File|undefined>;
	
	type VerifyFormData = {
		hash: string
	}
	
	const formState = reactive({
		hash: '4e50b8833fcaa4556b11cb4f4ff3e8bb410b2ad93d7e72ad56da99a25fb2c1',
	} as VerifyFormData);
	
	const verifyResult = ref(undefined as undefined|boolean);
	const verifyResultShow = ref(false);

	const onFinish = async (formState: VerifyFormData) => {
		try {
			let sha256Pfv = await Sha256Pfv.fromString(formState.hash);
			if(file.value !== undefined) {
				verifyResult.value = await sha256Pfv.completeVerifyFile(file.value);
				verifyResultShow.value = true;
			}
			else{
				verifyResultShow.value = false;
				message.error('请选择文件');
			}
		}
		catch (e){
			verifyResultShow.value = false;
			message.error(`哈希校验错误:${(e as Sha256PfvException).message}`);
		}
	};
	const onFinishFailed = (errorInfo: ValidateErrorEntity) => {
		message.error('表单错误:请检查表单内容');
	};
</script>

<style scoped lang="scss">

</style>