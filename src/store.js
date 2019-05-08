import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        socket: null,
        projectList: [],
        projectDir: null,
        menuInfo: null,
        urls: [],
        buildMessages: [],
        building: false
    },
    mutations: {
        resetProject(state) {
            state.menuInfo = null;
            state.urls = [];
            state.buildMessages = [];
            state.building = false;
        },
        setBuilding(state, s) {
            state.building = s;
        },
        setSocket(state, so) {
            state.socket = so;
        },
        setProjectList(state, list) {
            state.projectList = list;
        },
        setProjectDir(state, d) {
            state.projectDir = d;
        },
        setMenuInfo(state, info) {
            state.menuInfo = info;
        },
        setUrls(state, s) {
            state.urls = s;
        },
        pageSaved(state, pageUrl) {
            let lists = state.urls;
            for (let i = 0; i < lists.length; i++) {
                if (lists[i].url === pageUrl) {
                    lists[i].saved = true;
                }
            }
        },
        addError(state, errorStr) {
            state.buildMessages.push({
                error: true,
                message: errorStr
            });
        },
        addMessage(state, msgStr) {
            state.buildMessages.push({
                error: false,
                message: msgStr
            });
        },
        clearMessage(state) {
            state.buildMessages = [];
        }
    },
    getters: {
        currentProject(state) {
            if (state.projectDir === null) {
                return null;
            }
            for (let i = 0; i < state.projectList.length; i++) {
                if (state.projectList[i].dir === state.projectDir) {
                    return state.projectList[i];
                }
            }
            return null;
        }
    },
    actions: {}
})
