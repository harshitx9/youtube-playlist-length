var express = require('express');
var router = express.Router();
let axios = require('axios');
const parseIsoDuration = require('parse-iso-duration');
const humanizeDuration = require('humanize-duration');
const { yt_key } = require("./config");
/* Home page Route: GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Exp' });
});
// Post
router.post('/', function (req, res, next) {
  let stri = req.body.tstr;

/////////////////
// Logic//
/////////////////
  let input = stri;
  if (input.includes("list=")) {
    input = input.split("list=")[1];
    if (input.includes("&index")) {
      input = input.split("&index")[0];
    } else if (input.includes("&start")) {
      input = input.split("&start")[0];
    }
  }
  // console.log(input);
  let playlistId = input;

  /////////////////
  // let opfinal;
  async function getOutput() {
    try {
      const url1 = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${yt_key}&playlistId=${playlistId}&pageToken=`;
      let next_page = '';
      let count = 0;
      let totalTime = 0;
      let length = 0;
      while (true) {
        let video_list = [];
        let response = await axios.get(url1 + next_page);
        let results = response.data;
        for (let i = 0; i < results.items.length; i++) {
          video_list.push(results.items[i]['contentDetails']['videoId']);
        }
        let url_list = video_list.join(",");
        let url2 = `https://www.googleapis.com/youtube/v3/videos?&part=contentDetails&key=${yt_key}&id=${url_list}&fields=items/contentDetails/duration`;
        count += video_list.length;
        let output_response = await axios.get(url2);
        let output = output_response.data;
        for (let i = 0; i < output.items.length; i++) {
          let a = (output.items[i]['contentDetails']['duration']);
          let ms = parseIsoDuration(a);
          totalTime += ms;
        }
        if ('nextPageToken' in results) {
          next_page = results['nextPageToken']
        } else {
          length = humanizeDuration(totalTime);
          let averageTime = Math.floor(totalTime / count)
          let averageLength = humanizeDuration(averageTime);
          let k = humanizeDuration(Math.floor(totalTime / 1.25));
          let l = humanizeDuration(Math.floor(totalTime / 1.5));
          let m = humanizeDuration(Math.floor(totalTime / 1.75));
          let n = humanizeDuration(Math.floor(totalTime / 2));
          return [`Total length of playlist: ${length}`, 
                  `Number of Videos: ${count}`, 
                  `Average length of video: ${averageLength}`,
                  `At 1.25x : ${k}`, 
                  `At 1.50x : ${l}`, 
                  `At 1.75x : ${m}`, 
                  `At 2.00x : ${n}`];
        }
      }

    } catch (error) {
      return error.response.status;
    }

  }

  getOutput().then(data => {
    if (data == 404) {
      res.render("index", {
        punchline: "Please enter valid playlist ID"
      })}else {
        res.render("index", {
          punchline: data[0],
          hcount: data[1],
          haverage: data[2],
          h25x: data[3],
          h50x: data[4],
          h75x: data[5],
          h00x: data[6]
        }
        )}




    // res.render("index", {
    // punchline : data
    // punchline: data
  });









/////////////////

  // res.render("index", {
  //   punchline: data
  // });

})

module.exports = router;
