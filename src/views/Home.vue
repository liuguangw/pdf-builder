<template>

    <el-row :gutter="20">
        <template v-for="(projectInfo,index) in projectList">
            <el-col :span="8" :offset="(projectList.length<3)?((1-index)*(24-projectList.length*8)/2):0"
                    :key="projectInfo.dir"
                    class="box-node">
                <el-card>
                    <div slot="header" class="clearfix">
                        <span>{{ projectInfo.name }}</span>
                        <el-button class="pro-btn" type="text" @click="selectProject(projectInfo.dir)">选择项目
                        </el-button>
                    </div>
                    <div class="text item">
                        <el-row>
                            <el-col :span="6">名称</el-col>
                            <el-col :span="18">{{ projectInfo.name }}</el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="6">文件夹名称</el-col>
                            <el-col :span="18">{{ projectInfo.dir }}</el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="6">完整路径</el-col>
                            <el-col :span="18">{{ projectInfo.full_path }}</el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="6">文档URL</el-col>
                            <el-col :span="18"><a :href="projectInfo.page_url" target="_blank">{{ projectInfo.page_url
                                }}</a></el-col>
                        </el-row>
                    </div>
                </el-card>
            </el-col>
        </template>
    </el-row>
</template>

<script>

    export default {
        name: 'home',
        computed: {
            projectList() {
                return this.$store.state.projectList;
            }
        },
        methods: {
            sendSelectProjectEvt(projectDir) {
                this.$store.state.socket.emit("app select_project", projectDir);
            },
            selectProject(projectDir) {
                if (this.$store.state.projectDir !== projectDir) {
                    this.sendSelectProjectEvt(projectDir);
                } else {
                    //dir不变时,无需向服务端发送选择事件
                    this.$router.push({
                        name: 'projectInfo', params: {projectName: projectDir}
                    });
                }
            }
        }
    }
</script>

<style scoped>
    .text {
        font-size: 14px;
    }

    .pro-btn {
        float: right;
        padding: 3px 0;
    }

    .item {
        margin-bottom: 18px;
        text-align: left;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .box-node {
        padding-bottom: 15px;
    }

    a {
        color: #3a8ee6;
        text-decoration: none;
    }

    a:hover {
        color: red;
        text-decoration: underline;
    }
</style>