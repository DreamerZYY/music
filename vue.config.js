const path = require('path')
const webpack = require('webpack')
module.exports={
    // 修改output.path
    outputDir: 'dist',
    // 修改output.publishPath
    chainWebpack: config => {
        config.module
            .rule('images')
            .use('url-loader')
            .loader('url-loader')
            .tap(options => Object.assign(options, { limit: 20000 }))
        // 添加全局scss文件
        const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
        types.forEach(type => {
            config.module.rule('scss').oneOf(type).use('style-resource')
                .loader('style-resources-loader')
                .options({
                patterns: [
                    path.resolve(__dirname, 'src/css/base.scss')
                ]
            })
        })
    },
    configureWebpack:{
        resolve:{
            alias:{
                'assets':'@/assets',
                'common':'@/common',
                'components':'@/components',
                'network':'@/network',
                'views':'@/views'
            }
        }
    }
}