<template>
    <div class="project-main-warp">
        <el-row>
            <el-col :span="21">
                <el-breadcrumb separator-class="el-icon-arrow-right" style="height: 28px;line-height: 28px;">
                    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                    <el-breadcrumb-item>{{ projectName}} - {{ projectTitle }}</el-breadcrumb-item>
                </el-breadcrumb>
            </el-col>
            <el-col :span="3">
                <el-tooltip v-if="menuInfo!==null" effect="dark" content="查看菜单结构" placement="top">
                    <el-button type="primary" icon="el-icon-collection" size="mini" circle
                               @click="dialogVisible = true"></el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="查看抓取脚本" placement="top">
                    <el-button type="primary" icon="el-icon-document" size="mini" circle
                               @click="sourceDialogVisible = true"></el-button>
                </el-tooltip>
            </el-col>
        </el-row>
        <el-table class="menu-table"
                  v-if="pageUrls.length>0"
                  :data="pageUrls"
                  style="width: 100%">
            <el-table-column
                    prop="title"
                    label="标题"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="url"
                    label="URL">
            </el-table-column>
            <el-table-column
                    label="状态">
                <template slot-scope="scope">
                    <span class="saved-success" v-if="scope.row.saved" style="color:green;">已保存</span>
                    <span v-else>未保存</span>
                </template>
            </el-table-column>
        </el-table>
        <el-row v-if="canBuild" class="build-command-area">
            <el-button type="primary" :loading="building" @click="startBuild">{{ buildText }}</el-button>
        </el-row>
        <el-card class="app-message-card" v-if="appMessages.length>0">
            <div slot="header" class="clearfix">
                <span>构建日志</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="clearAppMessages">清除</el-button>
            </div>
            <div ref="msgLogEl" class="msg-logs">
                <template v-for="(msgInfo,eIndex) in appMessages">
                    <div :key="eIndex" :class="{'text':true,'item':true,'has-error':msgInfo.error}">
                        {{msgInfo.message}}
                    </div>
                </template>
            </div>
        </el-card>
        <el-dialog title="菜单结构" :visible.sync="dialogVisible">
            <template v-if="menuInfo!==null">
                <pre>{{ menuInfo }}</pre>
            </template>
        </el-dialog>
        <el-dialog title="抓取脚本" :visible.sync="sourceDialogVisible">
            <el-alert
                    title="将以下代码复制到目标文档页的控制台,执行即可进行数据抓取."
                    type="info"
                    close-text="知道了">
            </el-alert>
            <el-row style="margin-top: 8px;">
                <el-col :span="4">
                    <el-button type="primary" round @click="copyCode">复制代码</el-button>
                </el-col>
                <el-col :span="20">
                    <p class="fetch-page-url">目标文档地址: <a :href="fetchPageUrl" target="_blank">{{ fetchPageUrl }}</a></p>
                </el-col>
            </el-row>
            <el-input ref="codeRef" style="margin-top: 15px;"
                      type="textarea"
                      :rows="15"
                      :readonly="true"
                      placeholder="请输入内容"
                      v-model="fetchSource">
            </el-input>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "ProjectInfo",
        data() {
            return {
                projectName: "",
                projectTitle: "",
                fetchSource: "",
                fetchPageUrl: "",
                dialogVisible: false,
                sourceDialogVisible: false
            };
        },
        methods: {
            clearAppMessages() {
                this.$store.commit("clearMessage");
            },
            startBuild() {
                if (this.building) {
                    this.$message.error("正在构建中...");
                } else {
                    this.$store.commit("setBuilding", true);
                    this.$store.state.socket.emit("app build");
                    setTimeout(() => {
                        window.scrollTo(0, window.document.body.scrollHeight - window.innerHeight);
                    }, 900);
                }
            },
            copyCode(){
                this.$refs.codeRef.focus();
                window.document.execCommand("selectAll");
                window.document.execCommand("copy");
            }
        },
        watch: {
            '$store.state.buildMessages': function () {
                let cEl = this.$refs.msgLogEl;
                if (cEl !== undefined) {
                    setTimeout(() => {
                        cEl.scrollTop = cEl.scrollHeight - cEl.offsetHeight
                    }, 120);
                }
            }
        },
        computed: {
            menuInfo() {
                if (this.$store.state.menuInfo === null) {
                    return null;
                }
                return JSON.stringify(this.$store.state.menuInfo, null, "\t");
            },
            pageUrls() {
                return this.$store.state.urls;
            },
            building() {
                return this.$store.state.building;
            },
            buildText() {
                if (this.$store.state.building) {
                    return "构建中...";
                } else {
                    return "构建";
                }
            },
            appMessages() {
                return this.$store.state.buildMessages;
            },
            canBuild() {
                if (this.$store.state.menuInfo === null) {
                    return false;
                }
                if (this.$store.state.urls.length > 0) {
                    let result = true;
                    for (let i = 0; i < this.$store.state.urls.length; i++) {
                        if (!this.$store.state.urls[i].saved) {
                            result = false;
                            break;
                        }
                    }
                    return result;
                }
                return false;
            }
        },
        created() {
            let currentProject = this.$store.getters.currentProject;
            if (currentProject === null) {
                //跳回首页
                this.$router.push({
                    name: 'home'
                });
                return;
            }
            this.$store.commit("resetProject");
            this.projectName = currentProject.dir;
            this.projectTitle = currentProject.name;
            this.fetchSource = currentProject.source;
            this.fetchPageUrl = currentProject.page_url;
        }
    }
</script>

<style scoped>
    .project-main-warp {
        width: 900px;
        margin: 0 auto;
        padding-bottom: 40px;
    }

    pre {
        text-align: left;
        background: #ddd;
        padding: 8px;
    }

    .text {
        font-size: 15px;
        text-align: left;
        line-height: 20px;
        color: green;
    }

    .item {
        margin-bottom: 5px;
    }

    .item.has-error {
        color: red;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .msg-logs {
        max-height: 600px;
        overflow: auto;
        background: #2b2626;
        padding: 5px 12px;
    }

    .msg-logs .item:last-child {
        margin: 0;
    }

    .saved-success {
        display: inline-block;
        color: #fff;
        background: #54fdb7;
        padding: 2px 4px;
    }

    .error-card, .build-command-area, .app-message-card, .menu-table {
        margin-top: 15px;
    }

    .fetch-page-url {
        text-align: left;
    }

    .fetch-page-url a {
        text-decoration: none;
        color: #2196F3;
    }

    .fetch-page-url a:hover {
        color: red;
        text-decoration: underline;
    }
</style>