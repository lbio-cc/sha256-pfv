<template>
	<div class="produce">
		<a-form :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" @finish="onFinish" @finishFailed="onFinishFailed">
			<a-form-item label="最大哈希长度" name="maxCompleteHashLength" :rules="[{ required: true, message: '请输入最大哈希长度' }]">
				<a-input type="number" v-model:value="formState.maxCompleteHashLength"/>
			</a-form-item>

			<a-form-item :wrapper-col="{ offset: 4, span: 20 }">
				<a-button type="primary" html-type="submit">开始生成</a-button>
			</a-form-item>
		</a-form>

		<a-modal v-model:visible="produceResultShow" closable title="生成结果" :footer="null">
			{{ produceResult }}
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import {inject, reactive, ref} from "vue";
	import Sha256Pfv from "@/sdk/Sha256Pfv";
	import {message} from "ant-design-vue";
	import Sha256PfvException from "@/sdk/Sha256PfvException";
	import {ValidateErrorEntity} from "ant-design-vue/es/form/interface";
	import {ComputedRef} from "@vue/reactivity";

	const file = inject('file') as ComputedRef<File|undefined>;
	
	type ProduceFormData = {
		maxCompleteHashLength: number | undefined
	}
	
	const formState = reactive({
		maxCompleteHashLength:undefined,
	} as ProduceFormData);

	const produceResult = ref(undefined as undefined | string);
	const produceResultShow = ref(false);
	
	const onFinish = async (formState: ProduceFormData) => {
		try {
			if (file.value !== undefined && formState.maxCompleteHashLength !== undefined) {
				let sha256Pfv = await Sha256Pfv.fromFile(file.value, formState.maxCompleteHashLength);
				produceResult.value = sha256Pfv.toString()
				if(produceResult.value === ""){
					sha256Pfv.valid();
				}
				produceResultShow.value = true;
			} else {
				produceResultShow.value = false;
				message.error('请选择文件');
			}
		} catch (e) {
			produceResultShow.value = false;
			message.error(`哈希生成错误:${(e as Sha256PfvException).message}`);
		}
	};
	const onFinishFailed = (errorInfo: ValidateErrorEntity) => {
		message.error('表单错误:请检查表单内容');
	};
</script>

<style scoped lang="scss">

</style>