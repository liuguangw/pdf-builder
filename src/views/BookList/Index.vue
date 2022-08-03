<template>
  <div class="books-container">
    <message-tip v-show="showMessage" :message-type="messageType" :message="message"
                 @dialog-close="showMessage = false"/>
    <div class="book-info-card" v-for="bookInfo in bookList">
      <div class="card-header">
        <h4>{{ bookInfo.title }}</h4>
      </div>
      <div class="card-body">
        <div class="book-info-node"><span>项目名称：</span>{{ bookInfo.projectName }}</div>
        <div class="book-info-node"><span>URL：</span><a :href="bookInfo.docURL" target="_blank">{{
            bookInfo.docURL
          }}</a></div>
        <router-link :to="{name:'bookProject',params:{
          projectName:bookInfo.projectName
        }}" class="card-btn">查看项目
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import useFetchBookList from "./fetch_book_list.js";
import MessageTip from "../../components/MessageTip.vue";

export default {
  name: "BookList",
  components: {MessageTip},
  setup() {
    const {bookList, showMessage, messageType, message} = useFetchBookList();
    return {
      bookList,
      showMessage, messageType, message
    }
  }
}
</script>

<style lang="scss" scoped>
.books-container {
  margin: 12px;

  &:after {
    content: "020";
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
  }

  .book-info-card {
    margin-right: 15px;
    margin-bottom: 15px;
    float: left;
    border: 1px solid rgba(0, 0, 0, 0.175);

    &:last-child {
      margin-right: 0;
    }

    .card-header {
      background: rgba(0, 0, 0, 0.03);
      padding: 13px 0;
      text-align: center;

      h4 {
        color: #099299;
        margin: 0;
      }
    }

    .card-body {
      padding: 12px 28px;

      .book-info-node {
        margin-bottom: 8px;

        a {
          color: #9eafff;
          text-decoration: none;

          &:hover {
            color: #22ff66;
            text-decoration: underline;
          }
        }

        span {
          color: #13f4ff;
          font-weight: bold;
        }
      }

      .card-btn {
        display: block;
        text-decoration: none;
        padding: 8px 0;
        height: 30px;
        line-height: 30px;
        font-size: 20px;
        color: #0d6efd;
        border: 1px solid #0d6efd;
        border-radius: 8px;
        text-align: center;

        &:hover {
          color: #ffffff;
          background-color: #0b5ed7;
        }
      }
    }
  }
}
</style>
