<template>
<div  class="musicList"  ref="musicContent" @click="hideBox($event)" >
  <div class="listContent" id="showMusicContent">
    <p class="titleContent">
      <span class="listTitle">当前播放列表</span>
      <span class="listCount">
        <span>({{musicList.length}})</span>
      </span>
    </p>
    <div class="ullist">
      <ul class="ulContent" ref="ulBox">
        <li v-for="(item,index) in musicList" @click="playMusic(item.itemid,$event,index)">  
          <span class="listName">
            <span>{{index+1}}.{{item.itemname.split("-")[1]}}</span>
            <b>-{{item.itemname.split("-")[0]}}</b>
          </span>
          <span class="listPlayBtn">
            <!-- <img class="listPlayPic" :src="playPic" /> -->     
            <i  class="listPlayPic"></i>
          </span>
        </li>
      </ul>
    </div>
    
  </div>
</div>
</template>

<script>
import {request} from '@/network/request'
export default {
  name:'List',
  data(){
    return {
      musicList:[],
      playList:[],
      musicName:[],
      musicAuthor:[],
      playPic:require('../assets/img/playlist1.png'),
      playitem:'',
      currentIndex:0,//实际index
      orderIndex:'',//顺序播放的index
      randomIndex:'',//循环播放的index
      playMusicType:0,
    }
  },
  props:{
    showContent:Boolean,
    paramStr:Object
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      var param={
        wpcontentquery:"online",
        tag:this.paramStr.tag,
        iid:this.paramStr.iid,
        mn:this.paramStr.mn,
        //mid:'9396',
        mid:this.paramStr.mid,
        //ct:'9',
        ct:this.paramStr.ct,
       // uid:'166',
        uid:this.paramStr.uid,
        in:'',
        bd:'',
        ed:'',
        rn:'',
        ck:'',
        orderby:'',
        amount:'',
        window:'',
        utf8:'1',
        markid:'0'
      };
      request({
        url:'Module/WiseAPI/SongsAPI.ashx',
        params:param,
        methods:'get'
      }).then(res=>{
        debugger;
        if(res.error=="0"){
          this.musicList=res.wpcontentlist;
          this.playList=this.musicList;
          this.filterMusic(res.wpcontentlist);
        }
        console.log(res);
      })
      
    },
    playMusic(id,ele,curIndex){
      console.log(id);
      //取消事件冒泡 
      if (event && event.stopPropagation) {
        // this code is for Mozilla and  Opera
          event.stopPropagation();
      } else if (window.event) {
          // this code is for IE
          window.event.cancelBubble = true;
      }
      var parent=this.$refs.ulBox;
      debugger;
      for(var i=0;i<parent.querySelectorAll("li").length;i++){
        parent.querySelectorAll("li")[i].removeAttribute("class");
        parent.querySelectorAll("li")[i].querySelector("i").removeAttribute("class");
      }
      ele.currentTarget.classList.add("playActive");  
      ele.currentTarget.querySelector("i").classList.add("playActiveImg");  
      this.playitem=id;
      // this.orderIndex=i;
      // if(this/playMusicType==0||this.playMusicType==1){
      //   this.currentIndex=i;
      // }
      this.orderIndex=curIndex;
      for(var i=0;i<this.playList.length;i++){
        if(this.playList[i].itemid==this.playitem){
          this.randomIndex=i;  
        }  
      }
      if(this.playMusicType==1||this.playMusicType==0){
        this.currentIndex=this.orderIndex
      }else if(this.playMusicType==2){
        
        this.currentIndex=this.randomIndex;
      }
      //this.currentIndex=curIndex;
      
      this.$emit('sendcid', [this.currentIndex,this.orderIndex,this.randomIndex]);
      this.$emit('sendId', this.playitem);
    
    },
    playToList(index,type){
      debugger;
      var parent=this.$refs.ulBox;
      
     var eleItemId=this.playList[index].itemid;
      if(this.playMusicType==1){
         if(type=="add"){
          if(index<=this.musicList.length){
            parent.querySelectorAll("li")[index].click();
          }
        }else if(type=="atten"){
          if(index>=0){
            parent.querySelectorAll("li")[index].click();
          }
        }   
      }else if(this.playMusicType==2){    
        if(type=="add"){
           if(index<=this.musicList.length){
            for(var i=0;i<this.musicList.length;i++){
              if(this.musicList[i].itemid==eleItemId){
                parent.querySelectorAll("li")[i].click();
                return ;
              }
            }
          }
        } else if(type=="atten"){
           if(index>=0){
            for(var i=0;i<this.musicList.length;i++){
              if(this.musicList[i].itemid==eleItemId){
                parent.querySelectorAll("li")[i].click();
                return ;
              }
            }
           }
        }
        
      }
     
    },
    //关闭列表
    hideBox(){
     
      //this.$refs.musicContent.style.display="none";
      this.$emit('changShow', false);
    },
    changeListOrder(type){
      debugger;
      if(type==1){
        this.playList=this.musicList
      }else if(type==2){
        let eleArr=this.musicList
        let eleArr1=JSON.parse(JSON.stringify(eleArr))
        this.playList=this.shuffleSelf(eleArr1, eleArr1.length);
      }
      this.playMusicType=type;
    },
    //生成随机播放列表
    shuffleSelf(array,size){
      debugger;
      var index = -1,
      length = array.length,
      lastIndex = length - 1;
 
      size = size === undefined ? length : size;
      while (++index < size) {
          // var rand = baseRandom(index, lastIndex),
          var rand = index + Math.floor( Math.random() * (lastIndex - index + 1))
          var value = array[rand];

          array[rand] = array[index];

          array[index] = value;
      }
      array.length = size;
      return array;
    },
    filterMusic(data){
      debugger;
      for(var i=0;i<data.length;i++){
        this.musicAuthor.push(data[i].itemname.split("-")[0]);
        this.musicName.push(data[i].itemname.split("-")[1]);
      }
    }
  },
 
  
}

</script>

<style scoped>
ul,li{
  list-style: none;
}
.musicList{
  display: block;
  position: absolute;
  background: #aaa0;;
  top: 0;
  width: 100%;
  height: 100%;
  
}

.listContent{
  display: flex;
  flex-direction: column;
  width: 80%;
  margin: auto;
  height: 300px;
  background: #525355;
  bottom: 0;
  position: absolute;
  margin-left: 10%;
  border-radius: 10px 10px 0px 0px;
  box-shadow: #666 0px 0px 10px;
  color: #fff;
  animation:myfirst 0.2s;
  -webkit-animation:myfirst 0.2s;
  animation-fill-mode: forwards;/*当动画完成时，动画会停留在最后一帧。*/
}
@-webkit-keyframes myfirst /* Safari and Chrome */
{
    0%   {height: 10px}
    10%  {height: 30px;bottom:0;} 
    25%  {height:50px;bottom:0;}
    40%  {height:80px;bottom:0;}
    50%  {height:100px;bottom:0;}
    60%  {height:150px;bottom:0;}
    75%  {height:180px; bottom:0;}
    90%  {height:250px; bottom:0;}
    100% {height:300px;bottom:0;}
}
.titleContent{
  display: flex;
  align-items: baseline;
  width: 80%;
  margin: auto;
  margin-top:10px;
  margin-bottom: 10px;
}
.listTitle{
  font-size: 18px;
}
.listCount{
  font-size: 14px;
}
.ullist{
  flex:8;
  overflow: hidden;
  width: 80%;
  margin: auto;
  margin-bottom: 20px;
}
.ulContent{
  display: block;
  width: 96%;
  height: 100%;
  overflow: auto;
  margin: auto;
}
.ulContent li{
  width: 100%;
  height: 40px;
  line-height: 40px;
  display: flex;
  justify-content: space-between;
}
.listName{
  overflow: hidden;
  display: flex;
  align-items: baseline;
}
.listName b{
  font-size: 10px;
  transform: scale(0.8);
  color: #aaa;
}
.listPlayBtn{
  display: flex;
  align-items: center;
}
.listPlayBtn i{
  height:25px;
  width: 25px;  
  background:  url('../assets/img/playlist1.png') no-repeat;
  background-size: 100% 100%;
}
.listCount span{
    font-size: 12px;
    transform: scale(0.8);
    color: #aaa;
}
.playActive{
  color: red;
}
.playActive b{
  color: red;
}
.playActiveImg{
  background:  url('../assets/img/pauseList.png') no-repeat!important;
  background-size: 100% 100% !important;
}
</style>
