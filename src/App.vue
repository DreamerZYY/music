<template>
  <div id="app">
    <player @showList="showMusic($event)" @playToList="playToList" @sendType="sendType" :listNoid="noid" :listcid="cid" :orderid="orderid" :randomid="randomid" :playType="playType" ref="playerref" ></player>
    <list :showContent="showMusicList" v-show="showMusicList" @changShow="changeShowShadow($event)" @sendId="sendId($event)" @sendcid="sendcid($event)" ref="playListRef"></list>
  </div>
</template>

<script>
var url=window.location.search;
var itemid="";
if(url.indexOf("id")>=0){
  itemid=url.split("id=")[1];
  if(itemid.indexOf("&")>=0){
    itemid=itemid.split("&")[0]
  }
}
import Player from '@/views/Player'
import List from '@/views/List'
export default {
  name:"App",
  data(){
    return{
      showMusicList:false,
      noid:itemid,
      cid:0,
      orderid:0,
      randomid:0,
      playType:"0"
    }
  },
  components:{
    Player,
    List
  },
  methods: {
    //从播放页读取是否需要展示列表页
    showMusic(res) {
      this.showMusicList=res
    },
    //从列表页读取是否需要关闭列表页
    changeShowShadow(res){
      this.showMusicList=res;
    },
    //接受点击播放的音频id
    sendId(res){
      debugger;
      this.noid=res;
      this.$refs.playerref.getNowInfo(this.noid);
    },
     //接受点击播放的音频index
    sendcid(res){
      debugger;
      this.cid=res[0];
      this.orderid=res[1];
      this.randomid=res[2];
      setTimeout(()=>{
        this.$refs.playerref.playMusic()
      },1000)
      //this.$refs.playerref.getNowInfo(this.noid);
    },
    playToList(playIndex,str){
      debugger;
      console.log(playIndex)
      this.$refs.playListRef.playToList(playIndex,str);
    },
    sendType(res){
      debugger;
      this.playType=res;
      this.$refs.playListRef.changeListOrder(res);
    }
  },
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

</style>
