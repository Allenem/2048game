window.onload=function(){
	var btn=document.getElementById("newGame"),
		tileContainer=document.getElementById("tile-container"),
		scoreEle=document.getElementById("currentscore"),
		bestScoreEle=document.getElementById("bestscore");
		/*startX,startY,endX,endY;*/
	var game=game||new Game(tileContainer,scoreEle,bestScoreEle);
	game.initEvent();//初始化事件处理
	game.init();//初始化游戏
	EventUtil.addHandler(btn,"click",function(){
		game.init();//新游戏按钮被点击，初始化游戏，最佳分数保留直至刷新页面
	})
}
var	winNum=2048;//获胜要求的最小数2048
//事件处理对象EventUtil
var EventUtil = {
	//添加事件
	addHandler: function (element, type, handler) {
		if (element.addEventListener) { //DOM2级
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent) {      //DOM1级
			element.attachEvent("on" + type, handler);
		} else {
			element["on" + type] = handler;    //DOM0级
		}
	},
	//移除事件
	removeHandler: function (element, type, handler) {  //类似addHandler
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent) {
			element.detachEvent("on" + type, handler);
		} else {
			element["on" + type] = null;
		}
	},
	//获取事件对象
	getEvent:function(event){
		return event?event:window.event;//兼容ie
	}
}

//定义一些Game元素
function Game(tileContainer,scoreEle,bestScoreEle){
	this.tileContainer=tileContainer;
	this.scoreEle=scoreEle;
	this.bestScoreEle=bestScoreEle;
	this.tiles=new Array(4);//创建存方块数值与dom对象的数组
}

//定义Game的prototype属性向对象添加属性
Game.prototype={
	//初始化事件处理
	initEvent:function(){
		var me=this;
		//添加键盘弹起事件，防止一直按下重复触发
		EventUtil.addHandler(window,"keyup",function(event){
			me.moveTile(EventUtil.getEvent(event).keyCode);//方块移动处理
		})
	},
	//初始化游戏
	init:function(){
		this.posArray=[];//创建存空白方块坐标的数组
		for (var i=0,len=this.tiles.length; i<len; i++) {
			this.tiles[i]=[];
			for(var j=0;j<len;j++){
				this.tiles[i][j]={num:0};//初始化存方块数值与dom对象的数组
				this.posArray.push({"x":i,"y":j});//初始化存方块坐标的数组
			}
		}
		this.deleteTile(true);//清空全部方块
		this.score=0;
		this.bestScore=this.bestScore||0;//初始化分数和最佳分数
		this.newTile();
		this.newTile();//随机创建2个方块
	},
	//清除dom节点
	deleteTile:function(all,tile){
		if(all){
			this.tileContainer.innerHTML="";//清空所有
		}else{
			this.tileContainer.removeChild(tile);//删除单个
		}
	},
	//创建一新方块
	newTile:function(){
		var tile=document.createElement("div"),
			pos=this.randomPos(),//随机方块位置
			num=Math.random()<0.9?2:4;//随机方块数值2（90%概率）或4（10%概率）
		this.tiles[pos.x][pos.y]={num:num,tile:tile}//将新方块的数值与dom对象存入数组
		this.setTile(tile,num,pos.x,pos.y);//设置方块属性产生移动与淡入效果
		this.tileContainer.appendChild(tile);//将tile添加到tileContainer中
	},
	//设置方块显示数字和类
	setTile:function(element,num,x,y){
		element.innerHTML=num;
		element.className="tile tile-"+num+" tile-pos-"+x+"-"+y;
	},
	//方块的随机位置
	randomPos:function(){
    var index=Math.floor(Math.random()*this.posArray.length);//向下取整即0~15
    var pos=this.posArray[index];
    this.posArray.splice(index,1);//将新方块的位置从存空白坐标的数组中删除
    return pos;
	},
	//方块移动处理
	moveTile:function(keyCode){
		var len=this.tiles.length,
			merge;//存合并状态
		switch(keyCode){
			//左移
			case 37:
				for(var i=1;i<len;i++){//从左起第二个方块开始判断
					for(var j=0;j<len;j++){
						if(this.tiles[i][j].num!=0&&this.leftMove(i,j)){
							merge=this.merge(i,j);//值不为0且可移动则合并
						}
					}
				}
				break;
			//右移
			case 39:
				for(var i=len-2;i>=0;i--){//从右起第2个方块开始判断
					for(var j=0;j<len;j++){
						if(this.tiles[i][j].num!=0&&this.rightMove(i,j)){
							merge=this.merge(i,j);
						}
					}
				}
				break;
			//上移
			case 38:
				for(var j=1;j<len;j++){//从上起第二个方块开始判断
					for(var i=0;i<len;i++){
						if(this.tiles[i][j].num!=0&&this.upMove(i,j)){
							merge=this.merge(i,j);
						}
					}
				}
				break;
			//下移
			case 40:
				for(var j=len-2;j>=0;j--){//从下起第2个方块开始判断
					for(var i=0;i<len;i++){
						if(this.tiles[i][j].num!=0&&this.downMove(i,j)){
							merge=this.merge(i,j);
						}
					}
				}
				break;
		}
		if(merge){
			this.newTile();//合并之后新建1方块
		}else if(this.posArray.length==0&&this.gameOverTest()){
			this.gameOverMes();//判断无空方块且游戏结束检测为真则弹出游戏结束提示
		}
	},
	//方块左移
	leftMove:function(i,j){
		this.num=this.tiles[i][j].num;
		this.moveI=undefined;
		this.moveJ=undefined;
		for(var m=i-1;m>=0;m--){//左移要从当前左边第一个向左检测
			if(this.tiles[m][j].num==0){
				this.moveI=m;
			}else if (this.tiles[m][j].num==this.num) {
				this.num*=2;
				this.moveI=m;
				if(this.num==winNum){
					this.gameWin();
				}
				this.getScore(this.num);
				break
			}else{
				break;
			}
		}
		this.moveJ=j;
		if(!(this.moveI+1)||!(this.moveJ+1)){
			return;
		}
		return true;
	},
	//方块右移
	rightMove:function(i,j){
		var len=this.tiles.length;
		this.num=this.tiles[i][j].num;
		this.moveI=undefined;
		this.moveJ=undefined;
		for(var m=i+1;m<len;m++){
			if(this.tiles[m][j].num==0){
				this.moveI=m;
			}else if(this.tiles[m][j].num==this.num){
				this.num*=2;
				this.moveI=m;
				if(this.num==winNum){
					this.gameWin();
				}
				this.getScore(this.num);
				break;
			}else{
				break;
			}
		}
		this.moveJ=j;
		if(!(this.moveI+1)||!(this.moveJ+1)){
			return;
		}
		return true;
	},
	//方块上移
	upMove:function(i,j){
		this.num=this.tiles[i][j].num;
    this.moveI=undefined;
    this.moveJ=undefined;
    for(var n=j-1;n>=0;n--){
      if(this.tiles[i][n].num==0){
        this.moveJ=n;
      }else if(this.tiles[i][n].num==this.num){
        this.moveJ=n;
        this.num*=2;
        if(this.num==winNum){
          this.gameWin();
        }
        this.getScore(this.num);
        break;
      }else{
        break;
      }
    }
    this.moveI=i;
    if(!(this.moveI+1)||!(this.moveJ+1)){
      return;
    }
    return true;
	},
	//方块下移
	downMove:function(i,j){
		var len=this.tiles.length;
    this.num=this.tiles[i][j].num;
    this.moveI=undefined;
    this.moveJ=undefined;
    for(var n=j+1;n<len;n++){
      if(this.tiles[i][n].num==0){
        this.moveJ=n;
      }else if(this.tiles[i][n].num==this.num){
        this.moveJ=n;
        this.num*=2;
        if(this.num==winNum){
          this.gameWin();
        }
        this.getScore(this.num);
        break;
      }else{
        break;
      }
    }
    this.moveI=i;
    if(!(this.moveI+1)||!(this.moveJ+1)){
      return;
    }
    return true;
	},
	//合并
	merge:function(i,j){
		var me=this;
		if(this.num>this.tiles[i][j].num){
			//this.num的值变化，即遇到相同值的方块，可移动到其位置，只需删除被覆盖的方块
			this.deleteTile(false,this.tiles[this.moveI][this.moveJ].tile);
			//将移到相同值的方块的位置上的方块的原始位置添加到存空白坐标的数组中
			this.posArray.push({x:i,y:j})
		}else if(this.num==this.tiles[i][j].num){
			//值未变化，即遇到空白方块。只需将空白数组中该空白方块的坐标改为移动的方块的原始坐标
			this.posArray.forEach(function(item){
				if(item.x==me.moveI&&item.y==me.moveJ){
					item.x=i;
					item.y=j;
				}
			})
		}
		//设置将要移动的方块的属性，产生移动效果
		this.setTile(this.tiles[i][j].tile,this.num,this.moveI,this.moveJ);
		//在存方块数值与dom对象的数组中将被覆盖的方块的值设为将移动的方块的值
		this.tiles[this.moveI][this.moveJ]={num:this.num,tile:this.tiles[i][j].tile};
		//将移动的方块的值设为空白值(即num：0)
		this.tiles[i][j]={num:0};
		return true;
	},
	//计分
	getScore:function(score){
		//当前得分
		this.score+=score;
		this.scoreEle.innerHTML=this.score;
		//最佳分数
		if(this.score>this.bestScore){
			this.bestScore=this.score;
			this.bestScoreEle.innerHTML=this.bestScore;
		}
	},
	//获胜界面的添加与移除
	gameWin:function(){
		var me=this,
				win=document.createElement("div"),
				continueBtn=document.createElement("button");
		continueBtn.className="game-win-again";
		win.className="game-win";
		win.appendChild(continueBtn);
		this.tileContainer.appendChild(win);
		EventUtil.addHandler(continueBtn,"click",function(){
			me.deleteTile(false,win)
		})
	},
	//游戏结束测试
	gameOverTest:function(){
		var len=this.tiles.length;
		for(var i=0;i<len;i++){
			for(var j=0;j<len;j++){
				if(this.leftMove(i,j)||this.rightMove(i,j)||this.upMove(i,j)||this.downMove(i,j)){
					return;//只要有一个方向可以移动即退出
				}
			}
		}
		return true;//任何方向都不能移动即游戏结束
	},
	//游戏结束消息
	gameOverMes:function(){
		var message=document.createElement("div");
		message.className="game-over-mes";
		this.tileContainer.appendChild(message);
	},
}