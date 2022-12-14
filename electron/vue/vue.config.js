const { defineConfig } = require('@vue/cli-service')
const path = require('node:path')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack:{
    resolve:{
      alias:{
        "@":path.resolve(__dirname, "src"),
      },
      extensions:[".js",".ts"],
    },
  }
  
})
