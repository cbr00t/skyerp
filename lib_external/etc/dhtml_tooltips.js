/*
   Milonic DHTML Menu - Tool Tips Module  tooltips.js version 2.92 - February 4 2009
   This module is only compatible with the Milonic DHTML Menu version 5.796 or higher

   Copyright 2008 (c) Milonic Solutions Limited. All Rights Reserved.
   This is a commercial software product, please visit http://www.milonic.com/ for more information.
*/

M_ToolTipDelay=500    // Milliseconds after menu has been displayed before showing tooltip
M_maxTipWidth="100%"     // Sets the maximum width, set to "100%" for 100% or integer value for fixed pixel width, remove to disable


// The above 2 parameters are the only user definable parameters for this module.
// In order to use this module you will also need the Milonic DHTML Menu code files 
// The syntax for tooltips in a menuitem is : tooltip=I Am A Tooltip;

// The syntax for HTML object is: showtip("This is your text <b><i>With HTML </i></b> too!")
// Don't forget to use the hidetip() function onmouseout to stop the tip from showing after your have moved away from the HTML object

_tos=_los=_TtSo=_tipFoll=_TTD=0

with(M_toolTipStyle=new mm_style()){
    offbgcolor = "#FFFFE1";
      offcolor = "#000000";
   bordercolor = "#999999";
   borderstyle = "solid";
       padding = 1
   borderwidth = 1
      fontsize = "10px";
     fontstyle = "normal";
    fontfamily = "tahoma, verdana";
    overfilter = "Fade(duration=0.2);Shadow(color='#777777', Direction=135, Strength=5)"
}
with(new menuname("M_toolTips"))
{
	top="offset=18"
	left="offset=10"
	style=M_toolTipStyle;
	margin=4
	if(_W.M_maxTipWidth)maxwidth=M_maxTipWidth
	aI("text=;type=ToolTip;");
}
drawMenus()


Tgm=null
function _gTOb(m){
	t_M=$h(m)
	_Tgm=$c("menu"+t_M)
}
_gTOb("M_toolTips")
_TipIF=$mD
function buildTips(t)
{
	TTaN=-88
	if(!_m[t_M][23]&&!_startM){
		_m[t_M][23]=1
		g$(t_M)	
	}
	_m[t_M].tooltip=1
	_el=_m[t_M][0][0]
	if($tL(_Tgm.style.visibility)==$6)return
	_mi[_el][1]=t
	_Tgm.innerHTML=o$(t_M)
	_mcnt--
	_i=_itemRef
	popup(_m[t_M][1],1);
	_TipIF=$mD
	_itemRef=_i
	j_=$D(_gm_)
	if((j_[0]+j_[2])>_bH)$_E(_gm_,Y_-j_[2])
	_Tgm.style.zIndex=_zi+100	
	_TtSo=0
	setTimeout("TTaN=-1",100);
}


function hidetip(){	
	
	if(TTaN==-88)return
	if(_Mtip){
		_TtSo=0
		_Gtt=""
		_Mtip=$P(_Mtip);
		$Y(t_M,0)
		_tipFoll=0
		_TTD=M_ToolTipDelay
		_gTOb("M_toolTips")
	}
}
	TTaN=-1
hidetip();

function showtip(){

	_Mtip=$P(_Mtip);
	if(!_Tgm){
		_gTOb("M_toolTips")
		if(!_Tgm)return
	}
	$Y(t_M,0)
	_Tgm.style.visibility="hidden"
	_Tgm.style.zIndex=10000
	var a=arguments,t;
	if(a[0]||_W._Gtt){
		if(_W._Gtt)t=_Gtt; else t=a[0];
		_Gtt=t
		if(a[1])_tipFoll=1 // Toggle for whether tooltips follows mouse movement
		if(a[2])_TTD=a[2] // Tooltip delay in milliseconds
		if(a[3])_gTOb(a[3]); // tipmenu
	}
	else{
		if(_itemRef==-1)return
		t=_mi[_itemRef][95]
		if(_mi[_itemRef][98])_TTD=_mi[_itemRef][98]
		if(_mi[_itemRef][100])_gTOb(_mi[_itemRef][100]);
		
	}
	if(t==""||t==_n)return	
	if(!inDragMode)_Mtip=setTimeout("buildTips(\""+t+"\")",_TTD)
	_TtSo=1
}

function _TtM(){
	if(_TtSo)showtip()
	if(_tipFoll==1||(_trueItemRef>-1&&_mi[_trueItemRef][99])){
		_TY=Y_+_tos
		_TX=X_+_los
		
		if(ns6&&_W.fixMozillaZIndex){
			_TX-=_sL;
			_TY-=_sT
		}
		
		$_E(_Tgm,_TY,_TX)
		_a9=$c("iF"+_TipIF)
		if(_a9)$_E(_a9,_TY,_TX)
	}
}
