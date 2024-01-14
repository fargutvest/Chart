import './Chart.css';
import React, { useEffect } from "react";
import $ from 'jquery';

const nbrbAPI = "https://api.nbrb.by/ExRates/Rates/Dynamics/431?startDate=" + parseRuDate('01.01.2023') + "&endDate=" + parseRuDate('31.12.2023');
const padding = 25;

export default function Chart() {
    useEffect(() => {
        console.log(nbrbAPI);
        const container = document.getElementById("container");
        const canvas = document.getElementById("myCanvas");
        const thumb = document.getElementById("thumb");
        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;
        const ctx = canvas.getContext("2d");
        const canwasWidht = canvas.width;
        const canvasHeight = canvas.height;
        container.addEventListener("mousemove", (e) => {
            thumb.style.top = e.y + "px";
        });
       callApi(nbrbAPI, ctx, canwasWidht, canvasHeight, padding);
    }, []);

    return (
        <div id="container">
            <canvas id="myCanvas"></canvas>
            <div id="thumb" />
        </div>
    )
}

function callApi(nbrbAPI, ctx, canwasWidht, canvasHeight, padding) {
$.getJSON(nbrbAPI, { format: "json"})
	.done(data => {
		console.log(data);
		drawChart(data, ctx, canwasWidht, canvasHeight, padding);
	});
}


function calcScaleAndOffset(data, canwasWidht, canvasHeight, padding){
	let minY = canwasWidht;
	let maxY = 0;

	for(let i = 0; i < data.length; i++){
		let y = data[i].Cur_OfficialRate;
		if (y < minY)
			minY = y;

		if (y > maxY)
			maxY = y;
	}
	let scaleY = (canvasHeight - padding * 2) / (maxY - minY);
	let scaledMaxY = maxY * scaleY;
	let offsetY = scaledMaxY - canvasHeight + padding;

	return {scaleY, offsetY};
}  

function scale(val, scaleAndOffset) {
return (val * scaleAndOffset.scaleY - scaleAndOffset.offsetY)
}

function drawChart(data, ctx, canwasWidht, canvasHeight, padding){
ctx.beginPath();
drawAxes(ctx, canwasWidht, canvasHeight);

var scaleX = canwasWidht / data.length;
var previousPoint = {x:0,y:0};

let scaleAndOffset = calcScaleAndOffset(data, canwasWidht, canvasHeight, padding);

for(let i = 0; i < data.length; i++){ 
   let x1 = previousPoint.x;
   let y1 = previousPoint.y;
   let x2 = i * scaleX;
   let y2 = scale(data[i].Cur_OfficialRate, scaleAndOffset);
   previousPoint = {x2,y2};
   line(viewPort(x1,y1,x2,y2, canvasHeight), ctx);
}
ctx.lineWidth = 3;
ctx.stroke();	

for(let i = 0; i < data.length; i++){ 
   let date = parseDate(data[i].Date);
   let dayOfMounth = date.getDate();
   let mounth = date.getMonth() + 1;
 if ((mounth == 2 && dayOfMounth == 28) || 
 ((mounth == 1 || mounth == 3 || mounth == 5 || mounth == 7 || mounth == 8 || mounth == 10 || mounth == 12) && dayOfMounth == 31) ||
 ((mounth == 4 || mounth == 6 || mounth == 9 || mounth == 11) && dayOfMounth == 30))
 {
   let x = i * scaleX;
   line(viewPort(x, 0, x, canvasHeight, canvasHeight), ctx);
 }
 if (dayOfMounth == 5){
	let x = i * scaleX;
	line(viewPort(x, 0, x, canvasHeight, canvasHeight), ctx);
 }
}
ctx.lineWidth = 0.2;
ctx.stroke();
}



function line(obj, ctx){
ctx.moveTo(obj.x1, obj.y1);
ctx.lineTo(obj.x2, obj.y2);
}

function drawAxes(ctx, canwasWidht, canvasHeight){
ctx.moveTo(0, canvasHeight);
ctx.lineTo(canwasWidht, canvasHeight);
ctx.moveTo(0, 0);
ctx.lineTo(0,  canvasHeight);
}

function viewPort(x1, y1, x2, y2, canvasHeight){
x1 = x1;
y1 = canvasHeight - y1;
x2 = x2;
y2 = canvasHeight - y2;
return {x1, y1, x2, y2};
}

function parseDate(dateStr){
return new Date(Date.parse(dateStr));
}

function parseRuDate(s) {
    var parts = s.split('.');
    if (parts.length != 3) return NaN;

    parts[0] = parseInt(parts[0], 10);
    parts[1] = parseInt(parts[1], 10);
    parts[2] = parseInt(parts[2], 10);

    if (isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return NaN;
    if (parts[0] < 0 || parts[1] < 0 || parts[2] < 0) return NaN;

    return new Date(parts[2], parts[1] - 1, parts[0]).toUTCString();
};

