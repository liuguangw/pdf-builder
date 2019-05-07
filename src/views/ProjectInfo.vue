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
            </el-col>
        </el-row>
        <el-card class="error-card" v-if="errorMessages.length>0">
            <div slot="header" class="clearfix">
                <span>错误日志</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="clearErrorMessages">清除</el-button>
            </div>
            <div v-for="(errStr,eIndex) in errorMessages" :key="eIndex" class="text item">
                {{ errStr }}
            </div>
        </el-card>
        <el-table
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
                    <span v-if="scope.row.saved" style="color:green;">已保存</span>
                    <span v-else>未保存</span>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog title="菜单结构" :visible.sync="dialogVisible">
            <template v-if="menuInfo!==null">
                <pre v-highlightjs="menuInfo"><code class="javascript"></code></pre>
            </template>
        </el-dialog>
    </div>
</template>

<script>
    import 'highlight.js/styles/github.css';

    export default {
        name: "ProjectInfo",
        data() {
            return {
                projectName: "",
                projectTitle: "",
                dialogVisible: false
            };
        },
        methods: {
            clearErrorMessages() {
                this.$store.commit("clearError");
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
            errorMessages() {
                return this.$store.state.errorMessages;
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
            this.projectName = currentProject.dir;
            this.projectTitle = currentProject.name;
        }
    }
</script>

<style scoped>
    .project-main-warp {
        width: 900px;
        margin: 0 auto;
    }

    pre {
        text-align: left;
    }

    .text {
        font-size: 14px;
        text-align: left;
    }

    .item {
        margin-bottom: 18px;
    }
    .error-card{
        margin-top: 10px;
    }
    .error-card .text {
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
</style>