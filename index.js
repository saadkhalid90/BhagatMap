let mapLocs;

let timeTrans = 2000;
let timeDelay = 0;

let multiplier = 0.375;

let stepFocus;

async function readAndDraw(){
  mapLocs = await d3.tsv('Bhagat_Coordinates.tsv');
  // console.log(mapLocs);

  d3.select('svg.mapLocs')
    .selectAll('circle.pulsating')
    .data(mapLocs)
    .enter()
    .append('circle')
    .attr('class', 'pulsating')
    .attr('cx', d => {
        return d.X * multiplier;
    })
    .attr('cy', d => {
      return d.Y * multiplier;
    })
    //.attr('r', '0px')
    .style('fill', 'teal')
    .style('stroke', '#212121')
    .style('stroke-width', '2px')
    .call(pulseTrans, timeTrans, timeDelay);

  d3.select('svg.mapLocs')
    .selectAll('circle.static')
    .data(mapLocs)
    .enter()
    .append('circle')
    .attr('class', 'static')
    .attr('cx', d => {
        return d.X * multiplier;
    })
    .attr('cy', d => {
      return d.Y * multiplier;
    })
    .attr('r', '6px')
    .style('fill', 'teal')
    .style('stroke', '#212121')
    .style('stroke-width', '1px')


  stepFocus = function(step) {

      d3.select('svg.mapLocs')
        .selectAll('circle.pulsating')
        .remove();

      let mapFilt = step == 0 ? mapLocs : mapLocs.filter(d => d.Index == step);

      d3.select('svg.mapLocs')
        .selectAll('circle.pulsating')
        .data(mapFilt)
        .enter()
        .append('circle')
        .attr('class', 'pulsating')
        .attr('cx', d => multiplier * d.X)
        .attr('cy', d => multiplier * d.Y)
        //.attr('r', '0px')
        .style('fill', 'teal')
        .style('stroke', '#212121')
        .style('stroke-width', '2px')
        .call(pulseTrans, timeTrans, timeDelay, Date);

      let StatBub = d3.select('svg.mapLocs')
        .selectAll('circle.static')
        .raise();

      StatBub
        .filter(d => d.Index == step)
        .transition()
        .duration(500)
        .style('fill', 'yellow')

      StatBub
        .filter(d => d.Index != step)
        .transition()
        .duration(500)
        .style('fill', 'teal')
    }

  function pulseTrans(selection, transDur, transDelay) {
    selection
      .attr('r', '0px')
      .style('stroke-opacity', 1)
      .style('fill-opacity', 1)
      .transition()
      .delay((d, i) => i * transDelay)
      .duration(transDur)
      .attr('r', '20px')
      .style('stroke-width', '3px')
      .style('stroke-opacity', 0)
      .style('fill-opacity', 0)
      .on('end', function(d, i){
        d3.select(this)
          .call(pulseTrans, timeTrans, 0);
      });
  }
}

readAndDraw();

function zoomInOut(selection, scale, translateArr, transDur){
    selection.transition()
            .duration(transDur)
            .style('transform', `translate(${translateArr[0]}px, ${translateArr[1]}px) scale(${scale})`)
}

function pictSVGZoom(scale, translateArr, transDur){
  // select both the image and the svg and apply transform to it
  return d3.selectAll('.zoomable')//.call(zoomInOut, scale, translateArr, transDur).end();
          .transition()
          .duration(transDur)
          .style('transform', `translate(${translateArr[0]}px, ${translateArr[1]}px) scale(${scale})`)
          .end();
}

function pictSVGZoomStep(scale, transDur, step, mapData, multiplier){
  // select both the image and the svg and apply transform to it

  let mapDataStep = mapData.filter(d => d.Index == step);

  // console.log(mapDataStep)

  let xAvg = average(mapDataStep.map(d => +d.X).filter(d => d != 0));
  let yAvg = average(mapDataStep.map(d => +d.Y).filter(d => d != 0));

  let avg = [xAvg, yAvg];
  let avgScaled = avg.map(d => d * multiplier)

  let xNorm = document.getElementsByClassName('mapContain')[0].getBoundingClientRect().width;  // automate this
  let yNorm = document.getElementsByClassName('mapContain')[0].getBoundingClientRect().height;  // automate this

  let xImg = 720; // automate this
  let yImg = 950;  // automate this

  let xImgNormDiff = ((xImg - xNorm)/2) * scale;
  let yImgNormDiff = ((yImg - yNorm)/2) * scale;

  function scaleTransFactor(scale){
    return 1 + ((scale - 1)/2);
  }


  let avgT = transformXY([xImg, yImg], scale, avgScaled);

  // console.log("avgScaled", avgScaled);
  // console.log("avgT", avgT);

  let xExt = ((xNorm/2) - avgT[0]) //* scaleTransFactor(scale);
  let yExt = ((yNorm/2) - avgT[1]) //* scaleTransFactor(scale);

  let xScaled = xImg * scale;
  let yScaled = yImg * scale;

  let xLim = (xScaled - xImg)/2;
  let yLim = (yScaled - yImg)/2;

  xLim = (xExt >= 0) ? xLim : -xLim - (1.5 * xImgNormDiff);
  yLim = (yExt >= 0) ? yLim : -yLim - (1.5 * yImgNormDiff);


  let xTrans = Math.abs(xExt) > Math.abs(xLim) ? (xLim) : (xExt);
  let yTrans = Math.abs(yExt) > Math.abs(yLim) ? (yLim) : (yExt);

  let transArr = [xTrans, yTrans];
  //let transArr = [xLim, yLim];
  //let transArr = [xExt, yExt];

  //console.log("XY Lim", xLim, yLim);
  // console.log("XYAvg", xAvgScaled, yAvgScaled);
  // console.log('xImg', xImg/ 2, yImg/ 2)
  // console.log("XYAvgT", avgT[0], avgT[1]);
  // console.log("XYExt", xExt, yExt);
  //console.log("Trans", transArr);

  // d3.select('img.mapBG').call(zoomInOut, scale, transArr, transDur);
  // d3.select('svg.mapLocs').call(zoomInOut, scale, transArr, transDur);

  //await pictSVGZoom(1, [0, 0], transDur);
  return pictSVGZoom(scale, transArr, transDur);

}

function average(values) {
  let sum = values.reduce((previous, current) => current += previous);
  let avg = sum / values.length;

  return avg;
}

function transformXY(imgDims, scale, coords){
  let scaledDims = imgDims.map(dim => dim * scale);
  let imgCenter= imgDims.map(dim => dim/ 2);
  let scaledCoords = coords.map(coord => coord * scale);
  // console.log(scaledDims);
  let excess = scaledDims.map((d,i) => d - imgDims[i]);
  // console.log('excess', excess);
  // console.log('scaledC', scaledCoords)
  return scaledCoords.map((d, i) =>  d - excess[i]/2 );
}


// d3.selectAll('p.dateP')
//   .on('click', function(d, i){
//     let date= d3.select(this).html();
//     let dataDate;
//     let zoomVal;
//     let dateMonth;
//     let dateDay;
//
//     d3.selectAll('p.dateP')
//       .classed('clicked', false)
//       //.style('color', 'white')
//       .style('transform', 'scale(1.0)');
//
//     // d3.selectAll('p.dateP:hover')
//     //   .style('color', '#FFEB3B')
//
//     d3.select(this)
//       .classed('clicked', true)
//       //.style('color', '#FFEB3B')
//       .transition()
//       //.duration(500)
//       .style('transform', 'scale(1.2)');
//
//     function dateHTMLToData(Date){
//       switch (date) {
//         case "March 9":
//           dataDate = '9/3/19';
//           zoomVal = 1.7;
//           break;
//         case "April 6":
//           dataDate = '6/4/19';
//           zoomVal = 1.45;
//           break;
//         case "April 10":
//           dataDate = '10/4/19';
//           zoomVal = 1.30;
//           break;
//         case "April 11":
//           dataDate = '11/4/19';
//           zoomVal = 1.65;
//           break;
//         case "April 12":
//           dataDate = '12/4/19';
//           zoomVal = 1.35;
//           break;
//         case "April 14":
//           dataDate = '14/4/19';
//           zoomVal = 1.65;
//           break;
//         case "April 17":
//           dataDate = '17/4/19';
//           zoomVal = 1.75;
//           break;
//         case "April 18":
//           dataDate = '18/4/19';
//           zoomVal = 1.7;
//           break;
//         case "May 20":
//           dataDate = '20/5/19';
//           zoomVal = 1.8;
//           break;
//         default:
//       }
//       dateMonth = date.split(" ")[0];
//       dateDay = date.split(" ")[1];
//       return dataDate;
//     }
//
//     console.log(dateHTMLToData(date));
//
//     let dateText = dateHTMLToData(date);
//     dateFocus(dateText);
//     pictSVGZoomDate(zoomVal, 1500, dateText, mapLocs, 0.2)
//
//     d3.select('p.date.month').html(dateMonth);
//     d3.select('p.date.day').html(dateDay);
//   })
//
//   d3.selectAll('p.dateP').on('mouseover', function(d, i){
//     d3.select(this).classed('hovered', true);
//   })
//   d3.selectAll('p.dateP').on('mouseout', function(d, i){
//     d3.select(this).classed('hovered', false);
//   })

let nextIdx = 0;

d3.select('.nextButton').on('click', function(d, i){
  nextIdx++;
  let nextIdxMod = nextIdx%9;
  let zoomVal;
  // console.log(nextIdxMod);


  switch (nextIdxMod) {
    case 1:
      zoomVal = 1.45;
      break;
    case 2:
      zoomVal = 1.55;
      break;
    case 3:
      zoomVal = 1.5;
      break;
    case 4:
      zoomVal = 1.65;
      break;
    case 5:
      zoomVal = 1.48;
      break;
    case 6:
      zoomVal = 1.57;
      break;
    case 7:
      zoomVal = 1.68;
      break;
    case 8:
      zoomVal = 1.72;
      break;
    case 0:
      zoomVal = 1;
      break;
    default:
      zoomVal = 1;
  }

  stepFocus(nextIdxMod);
  (nextIdxMod != 0) ? pictSVGZoomStep(zoomVal, 1500, nextIdxMod, mapLocs, 0.375) : pictSVGZoom(zoomVal, [0, 0], 1500);
})
