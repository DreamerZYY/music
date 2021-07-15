<template>
    <div id="playContent">
        <p class="musicTitle">{{itemname}}</p>
        <p class="author">{{author}}</p>
        <div class="picContent">
         <div class="out ">
          <div class="roll">
              <div class="inner">
                  <img :src="picUrl"/>   
              </div>
            </div>
          </div>
          <div class="musicrod">
            <img :class="{'activeSing':activeSing}" src="~assets/img/musicrod.png" />
          </div>
        </div>
       
        <div class="lrcContent">
           <ul ref="ulList">
              <li v-for="(item,index) in lrcContent" :dataindex="index" v-model="lrcContent[index]">{{item}}</li>
           </ul>
           <!-- {{currentLrc}} -->
        </div>
        
        <div class="content-box">
            <div class="timeBlock">
                <div class="left-box played-progress">{{playedProgress}}</div>
                <div class="right-box all-progress" >{{allProgress}}</div>
            </div>
            
            <div class="center-box"> <div class="slider-bar" ref="silider" @click="clickSiderBar($event)">
                <div class="slider-progress" ref="progress">
                    <div class="slider-dot-control" @touchstart="startTouchBar($event)" @touchmove="moveTouchBar($event)" @touchend="endTouchBar($event)" ></div>
                </div>
            </div>
            </div>
           
        </div>
        <div class="playBar">
            <audio ref='audio' controls @play="playAudioMusic()" @pause="pauseAudioMusic()" @canplay="canplayMusic()" @timeupdate="timeUpdateMusic()" @ended="endMusic()">
              <!-- <source src="http://www.satall.cn/privatefiles/wisepeak/av/有没有 - 薛之谦.flac" type="audio/flac"> -->
              <source :src="misicurl" type="audio/flac">
               您的浏览器不支持 flac 元素
            </audio>
        </div>
        <div class="playBtn">
            <ul>
                <li>
                    <img :src="playCirclePic" @click="changePlayStatus()"/>
                </li>
                <li>
                    <img src="~assets/img/before.png" @click="beforeMusic()"/>
                </li>
                <li>
                    <img style="width:50%;max-width:70px;" :src="playSrc" class="playMusic" ref="playBtn" @click="playMusic()" />
                </li>
                <li>
                    <img src="~assets/img/next.png" @click="nextMusic()"/>
                </li>
                <li>
                    <img src="~assets/img/playList.png" @click="showList()"/>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import {request} from '@/network/request'
import {request1} from '@/network/request'
export default {
    name:'Player',
    data(){
        return {
            musicInfo:[],
            itemname:"",
            author:"",
            picUrl:"",
            lrc:"",  
            filterLrc:[],
            lrcContent:[],
            misicurl:"",
            baseURL:'http://www.satall.cn',
            power:false,
            lastX:0,
            playedProgress:'00:00',
            allProgress:'00:00',
            playSrc:require('../assets/img/play.png'),
            lineNo:0,
            currenLine:0,
            showMusicList:false,
            clicNoMusic:this.paramStr.iid==""?this.paramStr.pid:this.paramStr.iid,
            playCircleStatus:0,//0:单曲循环 1：列表顺序 2：列表随机
            playCirclePic:require('../assets/img/circle.png'),
            activeSing:false//设置属性来判断唱片杆的位置
            
        }
    },
    props:{
        listNoid:String,
        //列表页正在播放的index
        listcid:Number,
        orderid:Number,
        randomid:Number,
        paramStr:Object
    },
    created() {
        this.getNowInfo(this.clicNoMusic)
    },
    methods: {
        getNowInfo(id) {
            request({
                url:'Module/WiseAPI/SongsAPI.ashx',
                params:{
                    wpcontentquery:"online",
                    iid:id,
                    mid:this.paramStr.mid,
                    cp:this.paramStr.cp,
                    cn:decodeURI(this.paramStr.cn),
                    tag:this.paramStr.tag,
                    mn:this.paramStr.mn,
                    ct:this.paramStr.ct,
                    uid:this.paramStr.uid,
                    rn:""
                },
                methods:'get'
            }).then(res=>{
   
                //this.$refs.ulList.innerHTML="";
                this.musicInfo=res.wpcontentlist;
                if(res.wpcontentlist[0].itemname.indexOf("-")>=0){
                  this.itemname=res.wpcontentlist[0].itemname.split("-")[0].trim();
                  //解决给audio标签设置src属性后音频不能播放的问题
                  this.author=res.wpcontentlist[0].itemname.split("-")[1].trim();
                  if(this.author.indexOf(".")>=0){
                    this.author=this.author.split(".")[0];
                  }
                }
                this.misicurl=this.baseURL+res.wpcontentlist[0].fileurl;
                this.$refs.audio.src=this.baseURL+res.wpcontentlist[0].fileurl;
                if(res.wpcontentlist[0].ct=="9"){
                  this.picUrl=this.baseURL+res.wpcontentlist[0].fileurl.replace("av","pic").replace("flac","jpg");
                  this.lrc=this.baseURL+res.wpcontentlist[0].fileurl.replace("av","txt").replace("flac","lrc");
                   request1({
                    url:this.lrc,
                     //url:"/mock/music.lrc",
                     methods:"get"
                   }).then(res=>{
                       if(res!=undefined){
                        this.lrc=res.data.split("\r\n");   
                        this.filterLrcFun(res.data); 
                       }else{
                           this.lrc=[];
                            this.filterLrcFun([]); 
                       }
                       
                       
                   })
                }else if(res.wpcontentlist[0].ct=="10"){
                  this.picUrl=this.baseURL+res.wpcontentlist[0].thumbnail;
                }
            })
        },
        startTouchBar(e){
            var touch=e.touches[0];
            this.power=true;
            this.lastX=touch.clientX;
        },
        moveTouchBar(e){  
            var touch=e.touches[0];
            if(this.power){
                var curX=touch.clientX;
                var addW=curX-this.lastX;
                var setW=this.$refs.progress.offsetWidth+addW;
                var maxW=this.$refs.silider.offsetWidth;
                if(setW>=0&&setW<=maxW){
                    this.lastX=curX;
                    var percen=setW/maxW;
                }else if(setW<0){
                    percen=0;
                }else {
                    percen=1;
                }
                this.$refs.progress.style.width=percen*100+"%";
            }
        },
        endTouchBar(e){
            if(this.power){
                var setW=this.$refs.progress.offsetWidth;
                var maxW=this.$refs.silider.offsetWidth;
                if(setW>=0&&setW<=maxW){
                    var percen=setW/maxW;
                }else if(setW<0){
                    percen=0;
                }else {
                    percen=1;
                }
                this.$refs.progress.style.width=percen*100+"%";
                this.upDateProgress(percen);
            }
            this.power=false;
        },
        clickSiderBar(e){
         
            var setW=e.clientX-e.offsetLeft;
            var maxW=this.$refs.silider.offsetWidth;
            if(setW>=0&&setW<=maxW){
                var percen=setW/maxW;
                this.$refs.progress.style.width=percen*100+"%";
                this.upDateProgress(percen);
            }
        },
        upDateProgress(percence) {
            this.$refs.audio.currentTime=percence*(this.$refs.audio).duration;
        },
        playMusic(){
           
           if(this.$refs.audio.paused){
                this.$refs.audio.play()
            }else {
                this.$refs.audio.pause()
            }
        },
        playAudioMusic(){
            this.$refs.playBtn.className='play_bt icon-zanting iconfont';
            this.playSrc=require('../assets/img/pause.png');
            this.activeSing=true;
        },
        pauseAudioMusic(){
            this.playSrc=require('../assets/img/play.png');
            this.activeSing=false;
        },
        canplayMusic(){
           this.allProgress=this.duration(parseInt(this.$refs.audio.duration));
            if(!this.power){
                var prence=this.$refs.audio.currentTime/this.$refs.audio.duration;
                this.$refs.progress.style.width=prence*100+"%";
            }
            if(this.$refs.audio.paused){
                this.$refs.playBtn.className='play_bt icon-bofang iconfont';
            }else {
                this.$refs.playBtn.className='play_bt icon-zanting iconfont';
            }
        },
        timeUpdateMusic(){
            this.playedProgress=this.duration(parseInt(this.$refs.audio.currentTime));
            var ulStr=this.$refs.ulList;
           
            for(var i=0;i<this.filterLrc.length;i++){
                var eleTime="";
                if(this.filterLrc[i][0].indexOf(".")>=0){
                    eleTime=this.filterLrc[i][0].replace("[","").replace("]","").split(".")[0];
                    if(this.changeTime(eleTime)<=this.changeTime1(this.playedProgress)){
                        
                        if(this.lineNo<i){
                            if(i>=1){
                                ulStr.getElementsByTagName("li")[this.lineNo ].removeAttribute("class");
                            }
                            this.lineNo = i;
                            ulStr.getElementsByTagName("li")[this.lineNo ].classList.add("activeClass");
                            var el = document.querySelector('.activeClass');
                            var index = [].indexOf.call(el.parentElement.children, el);
                            this.currenLine=index;
                        }else{
                            ulStr.getElementsByTagName("li")[this.lineNo ].removeAttribute("class");
                            this.lineNo = i;
                            ulStr.getElementsByTagName("li")[this.lineNo ].classList.add("activeClass");
                            
                        }
                       
                    }
                   
                }
            }
            if(!this.power){
                var prence=this.$refs.audio.currentTime/this.$refs.audio.duration;
                this.$refs.progress.style.width=prence*100+"%";
            }
        },
        //监听播放结束事件
        endMusic(){
            if(this.playCircleStatus=="0"){
                var that=this;
                setTimeout(function () {
                    var a=document.getElementsByClassName("lrcContent")[0];
                    that.$refs.audio.play();
                    a.scrollTo(0, 0);
                },200)
            }else if(this.playCircleStatus=="1"){
                //this.listcid;
                var nextindex=this.listcid+1;
                //this.$parent.playToList({nextindex,"add"});
                this.$emit('playToList',nextindex,"add");
            }else if(this.playCircleStatus=="2"){
                var nextindex=this.listcid+1;
                 this.$emit('playToList',nextindex,"add");
            }
            this.$emit('sendType', this.playCircleStatus);
        },
        //下一首
        nextMusic(){
            if(this.playCircleStatus==0||this.playCircleStatus==1){
                this.listcid=this.orderid;
                
            }else if(this.playCircleStatus==2){
                this.listcid=this.randomid;
            }
            var nextindex=this.listcid+1;
            this.$emit('playToList',nextindex,"add");
        },
        //上一首
        beforeMusic(){
            if(this.playCircleStatus==0||this.playCircleStatus==1){
                this.listcid=this.orderid;
                
            }else if(this.playCircleStatus==2){
                this.listcid=this.randomid;
            }
            var nextindex=this.listcid-1;
            this.$emit('playToList',nextindex,"atten");
        },
        //时间转换
        duration(time){
            var fen=parseInt(time/60);
            var miao=time%60;
            if(fen<=9){
                fen="0"+fen;
            }
            if(miao<=9){
                miao="0"+miao;
            }
            return fen+'：'+miao;
        },
        //过滤生成单独的歌词数组和时间数组
        filterLrcFun(values){
            var lrc={};
            var lrcics=[];
            if(values.indexOf("\r\n")>=0){
                lrcics=values.split("\r\n");
            }else if(values.indexOf("\n")>=0){
                lrcics=values.split("\n");
            } 
           // alert("lrcics_"+lrcics);
            var reg=/\[\d*:\d*(\.|:)\d*]/g;
            this.lrcContent=[];
            this.filterLrc=[];
            if(lrcics.length>0){
                for(var i=0;i<lrcics.length;i++){
                    var timeRegArr=lrcics[i].match(reg);
                    if(!timeRegArr){
                        continue;
                    }
                    var content=lrcics[i].replace(timeRegArr,"");
                    if(content!=""){
                        this.lrcContent.push(content);
                        this.filterLrc.push(timeRegArr);
                    }   
                }
            }else{
                 this.lrcContent.push("无歌词")
            }
            
             //alert(this.lrcContent);
            var a=document.getElementsByClassName("lrcContent")[0];
            a.scrollTo({
                top:0,
                behavior:"smooth"
            })
        },
        //将分,秒转成秒
        changeTime(value){
            var mTime=parseInt(value.split(":")[0]);
            var sTime=parseInt(value.split(":")[1]);
            return mTime*60+sTime;

        },
        changeTime1(value){
            var mTime=parseInt(value.split("：")[0]);
            var sTime=parseInt(value.split("：")[1]);
            return mTime*60+sTime;

        },
        showList(){

            this.showMusicList=true;
            this.$emit('showList', this.showMusicList);
        },
        changePlayStatus(){
            if(this.playCircleStatus==0){
                this.playCircleStatus=1;
                this.playCirclePic=require('../assets/img/order.png');  
            }else if(this.playCircleStatus==1){
                this.playCircleStatus=2;
                this.playCirclePic=require('../assets/img/randPlay.png');
            }else if(this.playCircleStatus==2){
                this.playCircleStatus=0;
                this.playCirclePic=require('../assets/img/circle.png')
            }
            this.$emit('sendType', this.playCircleStatus);
        }
        
    },
    watch: {
        //设置监听属性，当歌词行数产生变化时，及时滚动
        currenLine(newValue, oldValue) {
            var a=document.getElementsByClassName("lrcContent")[0];
            var el=document.getElementsByClassName("activeClass")[0]; 
            //算出中间行，在中间位置滚动，且保持当前的最新歌词始终在中间位置
            var middleIndex=Math.floor(parseInt(a.offsetHeight/document.getElementsByClassName("activeClass")[0].offsetHeight)/2);
            if(newValue>middleIndex){
               
                var index = [].indexOf.call(el.parentElement.children, el);
                //以下两种方式都实现滚动，显示的样式略有差异
                // a.scrollTo(0,(document.getElementsByClassName("activeClass")[0].offsetHeight*index));
               a.scrollTo({
                   top:document.getElementsByClassName("activeClass")[0].offsetHeight*(index-middleIndex),
                   behavior:"smooth"
               })
                //滚动效果不带动画
               // this.$refs.ulList.style.transform="translateY(-"+document.getElementsByClassName("activeClass")[0].offsetHeight*(index-3)+"px)";   
            }
           
        },
    },
    computed: {
    },
    mounted() {
         
    },
    
}
</script>

<style scoped>
* {
    margin: 0px;
    padding: 0px;
    box-sizing: border-box;
    border: none;
}
ul,li{
    list-style: none;
}
body {
    margin: 0;
    padding: 0;
}
#playContent{
    width:100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
@keyframes spin {

    0% {
        transform: rotateZ(0deg);
    }
    100% {
        transform: rotateZ(360deg);
    }
}

.inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;

}

.inner img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    -webkit-filter: blur(1px);
    transition-delay: 1.5s;
    transition: all 0.005s ease-in-out;
}

.out {
    width: 160px;
    height: 160px;
    /* border: 1px dashed red; */
    border-radius: 50%;
    /* padding: 5px; */
    margin: 0px auto;
    transform: rotateX(0deg);
    /* transform-origin: center; */
    /* box-shadow: -6px -5px 0px #aaa; */
    -webkit-box-shadow: #666 0px 0px 10px;
    -moz-box-shadow: #666 0px 0px 10px;
    box-shadow: #666 0px 0px 10px;
    margin-top:20px;   
}
.roll{
    animation: spin 10s linear infinite; 
    width: 100%;
    height: 100%;
}
.inner:hover img {
    transform: scale(1.1, 1.1);
    -webkit-filter: blur(0px);
}

/*音乐播放器进度*/
/*滑动时间的样式*/
.slider-bar{
    height:4px;
    width: 100%;
    background-color: #6d6d6d;
    border-radius: 2px;
}
.slider-progress{
    position: relative;
    height: 100%;
    width: 0;
    background-color: #71aaff;
    border-radius: 2px;
}
.slider-dot-control{
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    left: 100%;
    background-color: #ff7471;
    border: 6px solid #fff;
    top: 50%;
    margin-top: -7px;
    margin-left: -9px;
}
/*滑动时间的样式*/
/*播放时间的样式*/
.played-progress,.all-progress{
    display: flex;
    -webkit-justify-content: center;
    justify-content: center;
    padding: 0 10px;
    font-size: 14px;
}
.content-box{
    display: flex;
    height: 20px;
    color: #eee;
    margin-top: 20px;
    align-items: center;
    flex-direction: column;
}
.center-box{
    width: 80%;
    height: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}
.timeBlock{
    display: block;
    width:80%;
    margin-bottom: 10px;
}
.left-box{
    width: 70px;
    height: 100%;
    text-align: center;
    font-size: 14px;
    flex: 1;
    float: left;
}
.right-box{
    width: 70px;
    height: 100%;
    text-align: center;
    font-size: 14px;
    flex: 1;
    float: right;
}
#playContent{
    overflow: hidden;
}
.musicTitle{
    font-size: 30px;
    margin-top: 20px;
    color: #666;
    flex:1;
}
.author{
    color:#666;
    margin-top:10px;
    font-size: 20px;
    flex: 1;
}
.picContent{   
    flex: 3;
    position: relative;
}
.musicrod{
    width: 100px;
    height: 100px;
    position: absolute;
    top: 0;
    left: calc(50% + 28px);
    margin-top: 10px;
}
.musicrod img{
    height:100%;
    height: 100%;
    /* transform-origin: right top; */
    transform-origin: 30px 10px;
    transform: rotate(-40deg);
}
.lrcContent{
    flex:10;
    overflow: auto;
    margin-top: 30px;
}
.content-box{
    flex:2;
}
audio{
    display: none;
}
.playBtn{
    flex: 2;
    margin-bottom: 20px;
}
.playBtn ul{
    display: flex;
    align-items: center;
}
.playBtn ul li{
    flex: 1;
}
.playBtn ul li:nth-child(3n+3){
    flex: 2;
}
.playBtn ul li img{
    width:40%;
    max-width:25px;
}
.lrcContent li{
    line-height: 30px;
}
.activeClass{
    color:#ff7471;
    font-size: 20px;
    text-shadow: 1px 4px 5px #717171;
}
.activeSing{
    transform: rotate(0deg) !important;
}
/* .play_bt{
    background: url('../assets/img/play.png') no-repeat;
} */
/*播放时间的样式*/
</style>
