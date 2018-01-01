const fs = require('fs');
const Nightmare = require('nightmare');

const credentials = require('../credentials/index.js');

const TOKEN = '4322add8b07763476ae44959a76f49136c222a713b0c11ee0e75f90b8d635fc2229297ddc1ebe72c9b666';
const VKApi = new (require('node-vkapi'))({
	accessToken: TOKEN
});

let savedData = []; //uses in function scrap for storage authorImg
let pageObj = {}; //for authorName and orderText
let links = []; //groups, which it will parse
let bigData = []; //all data here (authorImg, authorName, orderText)

const prof = 'https://vk.com';
const scrollCount = 1;
const groupsCount = 1;

const vo = require('vo'); //for generator, like 'co' in JS
const nightmare = Nightmare({
	show: false
});

let run = function*() {
	yield nightmare
		.goto('https://vk.com/')
		.type('#index_email', credentials.email)
		.type('#index_pass', credentials.pass)
		.click('#index_login_button')
		.wait(2000);

	yield VKApi.call('groups.search', { //take groups link
		q: 'фриланс',
		count: groupsCount
	}).then(res => {
		console.dir(res);
		for (let i = 0; i < res.items.length; i++) {
			for (let k in res.items[i]) {
				if (k == 'screen_name') {
					links.push(res.items[i][k]);
				};
			}
		}
		console.dir(links);
	})
	.catch( error => console.error(error) );
	
	for (let i = 0; i < links.length; i++) {
		console.log(i);
		yield scrap(links[i], bigData);
	}
	yield nightmare.end();
	
};
module.exports.run = run;
module.exports.bigData = bigData;

function* getContents(pathname) { //take authorImg
  var contents = yield nightmare
    .goto('https://vk.com' + pathname)
    .wait(1000)
    .evaluate((selector) => {
    	let linkOnImg = '';
    	if (document.querySelectorAll(selector).length != 0) {
    		linkOnImg = document.querySelector(selector);
    		if ( linkOnImg.hasAttribute('src') ) linkOnImg = linkOnImg.getAttribute('src');
    		else linkOnImg = '';
    	}
        return linkOnImg;
    }, '.page_avatar_img')
    .then(function (src) {
    	savedData.push(src);
    });
}

function* forEach(arr, fn, results) { // NEEDED BECAUSE FOREACH DOESN'T WORK IN GENERATORS
  let i;
  var results = results || [];
  for (i = 0; i < arr.length; i++) {
    results.push(yield * fn(arr[i]));
  }
  return results;
}

function* scrap(link, bigData) {
	var mainData = [];
	savedData = [];
	yield nightmare
		.goto('https://vk.com/' + link)
		.wait(2000);

	var currentHeight;
				//
	for (let i = 0; i < scrollCount; i++) { //scrolling page for take Ajax contents
		currentHeight = yield nightmare.evaluate(function() {
			let scrolls = document.querySelector('body');
			return {
				html: scrolls.scrollHeight
			}
			});
			console.dir(currentHeight);

			yield nightmare.evaluate(function(height) {
				let scrolls = document.querySelector('body');
				scrolls.scrollTop = height.html;
			}, currentHeight);

			yield nightmare.wait(2000);
		};

	yield nightmare.wait(1000);

				/**/
	yield nightmare
		.evaluate(function() {
			let orderText = [];
			let authorName = [];
			let authorLink = [];
			let wallPosts = document.getElementById('public_wall');
			let postContents = wallPosts.getElementsByClassName('post_content');
			for (let i = 0; i < postContents.length; i++) {
				orderText.push(postContents[i].getElementsByClassName('wall_post_text')[0].innerHTML.replace(/<\/?[^>]+>/g,' ').replace(/Показать полностью…/g, ' '));

				if (postContents[i].getElementsByClassName('wall_signed_by')[0]) {
					authorName.push(postContents[i].getElementsByClassName('wall_signed_by')[0].innerText);
					authorLink.push('https://vk.com' + postContents[i].getElementsByClassName('wall_signed_by')[0].getAttribute('href'));
				} else {
					authorName.push(false);
					authorLink.push('');
				}
			}
			let allOrders = {
				'orderText': orderText,
				'authorName': authorName,
				'authorLink': authorLink
			};
			return allOrders;
		})
		.then(function (page) {
			pageObj = page;
		});

	var linkList = yield nightmare
		.wait(1000)
		.evaluate(() => {
			let nodeList = [];
			let wallPosts = document.getElementById('public_wall');
			let postContents = wallPosts.getElementsByClassName('post_content');
			for (let i = 0; i < postContents.length; i++) 
				if (postContents[i].getElementsByClassName('wall_signed_by')[0]) 
					nodeList.push(postContents[i].getElementsByClassName('wall_signed_by')[0]);
				else nodeList.push("/durov");
			const pathnames = Array.from(nodeList, el => {
				var parser = document.createElement('a');
				parser.href = el.href;
				return parser.pathname;
			});
			return pathnames;
		});

	yield* forEach(linkList, getContents);

	yield nightmare
		.evaluate(()=>{})
		.then(function(results) {
			for (let i = 0; i < savedData.length - 1; i++) {
				mainData[i] = {
					'orderText': pageObj.orderText[i],
					'authorName': pageObj.authorName[i],
					'authorLink': pageObj.authorLink[i],
					'authorImg': savedData[i]
				};
				bigData.push(mainData[i]);
			};
			fs.writeFileSync('./public/mainData.json', JSON.stringify(bigData, null, 4));
		});
}