<template>
    <div class="home">
        <img alt="Vue logo" src="../assets/logo.png">
        <HelloWorld msg="Welcome to Your Vue.js App"/>
    </div>
</template>

<script>
    // @ is an alias to /src
    import HelloWorld from '@/components/HelloWorld.vue'
    import io from 'socket.io-client';

    export default {
        name: 'home',
        data() {
            return {
                socket: null
            };
        },
        components: {
            HelloWorld
        },
        created() {
            let so = io();
            so.on('connect', function () {
                this.socket = so;
                so.emit("app list_project");
                so.on('app list_project', function (projectList) {
                    window.console.log(projectList);
                });
            });
        }
    }
</script>
