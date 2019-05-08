<template>
    <div id="app">
        <el-container>
            <el-header>Header</el-header>
            <el-main>
                <router-view/>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import io from 'socket.io-client';

    export default {
        name: 'app',
        created() {
            let so = io("/vue-api");
            so.on('connect', () => {
                this.$store.commit("setSocket",so);
                so.on('app list_project', data => {
                    this.$store.commit("setProjectList",data);
                });
                so.on('app select_project', response => {
                    if (response.code === 0) {
                        let tmpDir = null;
                        let projectList = this.$store.state.projectList;
                        for (let tmpProIndex in projectList) {
                            if (projectList[tmpProIndex].dir === response.data) {
                                tmpDir = response.data;
                            }
                        }
                        if (tmpDir !== null) {
                            this.$store.commit("setProjectDir",tmpDir);
                            this.$router.push({
                                name: 'projectInfo', params: {projectName: tmpDir}
                            });
                        } else {
                            this.$message.error("无效的project: " + response.data);
                        }
                    } else {
                        this.$message.error(response.message);
                    }
                });
                so.on("app save_menu_info", data => {
                    this.$store.commit("setMenuInfo",data);
                });
                so.on("app save_urls", data => {
                    for (let itemIndex in data) {
                        data[itemIndex].saved = false;
                    }
                    this.$store.commit("setUrls",data);
                });
                so.on("app save_page_url",pageUrl=>{
                    this.$store.commit("pageSaved",pageUrl);
                });
                so.on("app error",message=>{
                    this.$store.commit("addError",message);
                });
                so.on("app message",message=>{
                    this.$store.commit("addMessage",message);
                });
                so.on("app build_complete",()=>{
                    this.$store.commit("setBuilding",false);
                });
                so.emit("app list_project");
            });
        },
        destroyed() {
            this.socket.close();
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
